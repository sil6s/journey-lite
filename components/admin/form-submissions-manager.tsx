"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type FormSubmissionListItem = {
  id: string;
  form_key: string;
  form_name: string | null;
  page_slug: string | null;
  status: "new" | "reviewed" | "contacted" | "closed" | "spam";
  submitted_at: string;
  data: unknown;
  metadata?: unknown;
  admin_notes: string | null;
};

const statuses: { label: string; value: FormSubmissionListItem["status"] }[] = [
  { label: "Open", value: "new" },
  { label: "In progress", value: "reviewed" },
  { label: "In progress - contacted", value: "contacted" },
  { label: "Complete", value: "closed" },
  { label: "Spam", value: "spam" },
];

const fmlaStatusFilters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Complete", value: "complete" },
  { label: "Spam", value: "spam" },
] as const;

type FmlaStatusFilter = typeof fmlaStatusFilters[number]["value"];

export function FormSubmissionsManager({ submissions }: { submissions: FormSubmissionListItem[] }) {
  const [items, setItems] = useState(submissions);
  const [saving, setSaving] = useState<string | null>(null);
  const [matching, setMatching] = useState<string | null>(null);
  const fmlaItems = items.filter(isFmlaSubmission);
  const otherItems = items.filter((item) => !isFmlaSubmission(item));
  const [selectedFmlaId, setSelectedFmlaId] = useState<string | null>(null);
  const selectedFmla = selectedFmlaId ? fmlaItems.find((item) => item.id === selectedFmlaId) ?? null : null;

  async function updateSubmission(id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) {
    setSaving(id);
    const response = await fetch(`/api/admin/form-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }
    setSaving(null);
  }

  async function matchShopifyOrder(id: string, payload: ShopifyOrderMatchPayload) {
    setMatching(id);
    const response = await fetch(`/api/admin/form-submissions/${id}/shopify-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { metadata?: unknown; error?: string };
    if (!response.ok) {
      setMatching(null);
      return { error: result.error || "Could not match this Shopify order." };
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, metadata: result.metadata ?? item.metadata } : item)));
    setMatching(null);
    return {};
  }

  if (!items.length) {
    return <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-sm text-muted-foreground">No form submissions yet.</div>;
  }

  return (
    <div className="grid gap-6">
      {fmlaItems.length > 0 ? (
        <FmlaSubmissionsWorkspace
          items={fmlaItems}
          matching={matching}
          onMatchOrder={matchShopifyOrder}
          onSelect={setSelectedFmlaId}
          onBack={() => setSelectedFmlaId(null)}
          onUpdateSubmission={updateSubmission}
          saving={saving}
          selected={selectedFmla}
        />
      ) : null}

      {otherItems.length > 0 ? (
        <section className="grid gap-4">
          {fmlaItems.length > 0 ? <h2 className="text-base font-semibold text-[#153f2b]">Other form submissions</h2> : null}
          {otherItems.map((item) => {
            const data = asRecord(item.data);
            return (
              <article className="rounded-xl border bg-white p-5 shadow-sm" key={item.id}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div>
                    <SubmissionHeader item={item} />
                    <GenericSubmissionDetails data={data} submissionId={item.id} />
                  </div>
                  <SubmissionControls item={item} saving={saving} updateSubmission={updateSubmission} />
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

type ShopifyOrderMatchPayload = {
  orderName: string;
  orderEmail?: string;
  totalPrice?: string;
  currency?: string;
  orderId?: string;
};

function FmlaSubmissionsWorkspace({
  items,
  matching,
  onBack,
  onMatchOrder,
  onSelect,
  onUpdateSubmission,
  saving,
  selected,
}: {
  items: FormSubmissionListItem[];
  matching: string | null;
  onBack: () => void;
  onMatchOrder: (id: string, payload: ShopifyOrderMatchPayload) => Promise<{ error?: string }>;
  onSelect: (id: string) => void;
  onUpdateSubmission: (id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) => Promise<void>;
  saving: string | null;
  selected: FormSubmissionListItem | null;
}) {
  const [statusFilter, setStatusFilter] = useState<FmlaStatusFilter>("all");
  const filteredItems = items.filter((item) => fmlaFilterMatches(item, statusFilter));

  if (selected) {
    return (
      <FmlaSubmissionDetailView
        item={selected}
        matching={matching === selected.id}
        onBack={onBack}
        onMatchOrder={(payload) => onMatchOrder(selected.id, payload)}
        onUpdateSubmission={onUpdateSubmission}
        saving={saving}
      />
    );
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#153f2b]">FMLA paperwork requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start with the queue. Click a request to review details, documents, status, and payment matching.</p>
        </div>
        <span className="rounded-full bg-[#edf4ef] px-3 py-1 text-xs font-semibold text-[#145c42]">{items.length} request{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {fmlaStatusFilters.map((filter) => {
          const count = items.filter((item) => fmlaFilterMatches(item, filter.value)).length;
          const active = statusFilter === filter.value;
          return (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-[#145c42] bg-[#145c42] text-white" : "border-[#dce6df] bg-white text-[#315545] hover:border-[#145c42]/50"}`}
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              type="button"
            >
              {filter.label} <span className={active ? "text-white/80" : "text-[#789083]"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-[#f7faf7] text-xs font-semibold uppercase tracking-[0.12em] text-[#5c7468]">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Shopify order</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eee8]">
              {filteredItems.map((item) => (
                <FmlaSubmissionRow item={item} key={item.id} onSelect={() => onSelect(item.id)} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 ? (
          <div className="border-t border-[#e6eee8] px-4 py-8 text-center text-sm text-muted-foreground">No FMLA requests match this filter.</div>
        ) : null}
      </div>
    </section>
  );
}

function FmlaSubmissionRow({ item, onSelect }: { item: FormSubmissionListItem; onSelect: () => void }) {
  const data = asRecord(item.data);
  const metadata = asRecord(item.metadata);
  const payment = asRecord(metadata.shopifyPayment);
  const paymentMatched = Boolean(payment.matchedAt);
  const fullName = [stringValue(data.firstName), stringValue(data.lastName)].filter(Boolean).join(" ") || "Unnamed patient";
  const upload = data.upload;

  return (
    <tr
      className="cursor-pointer bg-white transition hover:bg-[#f7faf7]"
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <td className="px-4 py-3 text-[#193f2c]">{new Date(item.submitted_at).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <span className="block font-semibold text-[#193f2c]">{fullName}</span>
        <span className="text-xs text-muted-foreground">DOB {stringValue(data.dob) || "not provided"}</span>
      </td>
      <td className="px-4 py-3">
        <span className="block text-[#193f2c]">{stringValue(data.email) || "No email"}</span>
        <span className="text-xs text-muted-foreground">{stringValue(data.phone) || "No phone"}</span>
      </td>
      <td className="px-4 py-3">
        {isUploadMetadata(upload) ? (
          <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={`/api/admin/form-submissions/${item.id}/attachment?field=upload`} onClick={(event) => event.stopPropagation()}>
            PDF
          </a>
        ) : (
          <span className="text-amber-800">No upload</span>
        )}
      </td>
      <td className="px-4 py-3">
        {paymentMatched ? (
          <span className="grid gap-0.5">
            <span className="font-semibold text-emerald-800">{stringValue(payment.orderName) || "Matched"}</span>
            <span className="text-xs text-muted-foreground">{stringValue(payment.orderEmail) || stringValue(payment.matchedBy)}</span>
          </span>
        ) : (
          <span className="font-semibold text-amber-800">Unmatched</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-semibold text-[#145c42]">{statusLabel(item.status)}</span>
      </td>
    </tr>
  );
}

function FmlaSubmissionDetailView({
  item,
  matching,
  onBack,
  onMatchOrder,
  onUpdateSubmission,
  saving,
}: {
  item: FormSubmissionListItem;
  matching: boolean;
  onBack: () => void;
  onMatchOrder: (payload: ShopifyOrderMatchPayload) => Promise<{ error?: string }>;
  onUpdateSubmission: (id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) => Promise<void>;
  saving: string | null;
}) {
  const data = asRecord(item.data);
  const metadata = asRecord(item.metadata);

  return (
    <section className="grid gap-4">
      <button className="w-fit text-sm font-semibold text-[#145c42] underline-offset-4 hover:underline" onClick={onBack} type="button">
        Back to FMLA requests
      </button>

      <article className="rounded-xl border bg-white p-5 shadow-sm">
        <SubmissionHeader item={item} />

        <div className="mt-5 grid gap-5">
          <FmlaSubmissionDetails
            data={data}
            initialEmail={stringValue(data.email)}
            matching={matching}
            metadata={metadata}
            onMatchOrder={onMatchOrder}
            submissionId={item.id}
          />
          <SubmissionControls item={item} saving={saving} updateSubmission={onUpdateSubmission} />
        </div>
      </article>
    </section>
  );
}

function SubmissionHeader({ item }: { item: FormSubmissionListItem }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-[#153f2b]">{item.form_name || item.form_key}</h3>
        <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-semibold text-[#145c42]">{statusLabel(item.status)}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(item.submitted_at).toLocaleString()} {item.page_slug ? `- /${item.page_slug}` : ""}
      </p>
    </>
  );
}

function SubmissionControls({
  item,
  saving,
  updateSubmission,
}: {
  item: FormSubmissionListItem;
  saving: string | null;
  updateSubmission: (id: string, patch: Pick<FormSubmissionListItem, "status" | "admin_notes">) => Promise<void>;
}) {
  return (
    <section className="grid content-start gap-3 rounded-xl border border-[#dce6df] bg-[#f7faf7] p-4">
      <div>
        <h4 className="text-sm font-semibold text-[#153f2b]">Workflow</h4>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Use this to keep the request queue current.</p>
      </div>
      <label className="grid gap-1 text-sm font-medium text-[#193f2c]">
        Request status
        <select
          className="h-10 rounded-md border bg-white px-3 text-sm"
          value={item.status}
          onChange={(event) => updateSubmission(item.id, { status: event.target.value as FormSubmissionListItem["status"], admin_notes: item.admin_notes })}
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Admin notes
        <Textarea
          defaultValue={item.admin_notes || ""}
          placeholder="Add follow-up notes"
          onBlur={(event) => updateSubmission(item.id, { status: item.status, admin_notes: event.target.value })}
        />
      </label>
      <Button disabled={saving === item.id} size="sm" variant="outline">
        {saving === item.id ? "Saving..." : "Saved on change"}
      </Button>
    </section>
  );
}

function GenericSubmissionDetails({ data, submissionId }: { data: Record<string, unknown>; submissionId: string }) {
  return (
    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div className="rounded-lg bg-[#f7faf7] p-3" key={key}>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{key}</dt>
          <dd className="mt-1 break-words text-[#193f2c]">{formatValue(key, value, submissionId)}</dd>
        </div>
      ))}
    </dl>
  );
}

function FmlaSubmissionDetails({
  data,
  initialEmail,
  matching,
  metadata,
  onMatchOrder,
  submissionId,
}: {
  data: Record<string, unknown>;
  initialEmail: string;
  matching: boolean;
  metadata: Record<string, unknown>;
  onMatchOrder: (payload: ShopifyOrderMatchPayload) => Promise<{ error?: string }>;
  submissionId: string;
}) {
  const knownKeys = new Set([
    "firstName",
    "lastName",
    "email",
    "dob",
    "phone",
    "jobType",
    "employer",
    "sendCompletedTo",
    "disclaimerAcknowledged",
    "upload",
    "additionalInformation",
  ]);
  const fullName = [stringValue(data.firstName), stringValue(data.lastName)].filter(Boolean).join(" ");
  const upload = data.upload ? formatValue("upload", data.upload, submissionId) : "No PDF uploaded";
  const payment = asRecord(metadata.shopifyPayment);
  const paymentMatched = Boolean(payment.matchedAt);
  const extraFields = Object.entries(data).filter(([key]) => !knownKeys.has(key));

  const patientRows: TableRow[] = [
    ["Patient name", fullName],
    ["Date of birth", stringValue(data.dob)],
    ["Email", contactLink("email", stringValue(data.email))],
    ["Phone", contactLink("phone", stringValue(data.phone))],
    ["Employer", stringValue(data.employer)],
    ["Job type", stringValue(data.jobType)],
    ["Send completed form to", stringValue(data.sendCompletedTo)],
  ];

  const requestRows: TableRow[] = [
    ["Authorization", data.disclaimerAcknowledged ? "Acknowledged" : "Not acknowledged"],
    ["Uploaded FMLA form", upload],
    [
      "Additional information",
      <span key="additional-information" className="whitespace-pre-wrap">
        {stringValue(data.additionalInformation) || "None provided"}
      </span>,
    ],
  ];

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-xl border border-[#dce6df] bg-[#fbfdfb] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c7468]">FMLA / Disability Intake</p>
            <h4 className="mt-1 text-xl font-semibold text-[#153f2b]">{fullName || "Unnamed patient"}</h4>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMatched ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
            {paymentMatched ? "Payment matched" : "Payment required before processing"}
          </span>
        </div>
      </div>

      <DataTable caption="Patient and routing details" rows={patientRows} />
      <PaymentSection initialEmail={initialEmail} matching={matching} onMatchOrder={onMatchOrder} payment={payment} />
      <DataTable caption="Request details" rows={requestRows} />

      {extraFields.length > 0 ? (
        <DataTable
          caption="Other submitted fields"
          rows={extraFields.map(([key, value]) => [humanizeKey(key), formatValue(key, value, submissionId)])}
        />
      ) : null}
    </div>
  );
}

function PaymentSection({
  initialEmail,
  matching,
  onMatchOrder,
  payment,
}: {
  initialEmail: string;
  matching: boolean;
  onMatchOrder: (payload: ShopifyOrderMatchPayload) => Promise<{ error?: string }>;
  payment: Record<string, unknown>;
}) {
  const paymentMatched = Boolean(payment.matchedAt);

  return (
    <section className="overflow-hidden rounded-xl border border-[#dce6df]">
      <div className="flex flex-wrap items-start justify-between gap-3 bg-[#f7faf7] px-4 py-3">
        <div>
          <h4 className="text-sm font-semibold text-[#153f2b]">Payment</h4>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Review the Shopify payment match or manually override it here.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMatched ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
          {paymentMatched ? "Matched" : "Unmatched"}
        </span>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-[#e6eee8] bg-white p-4 text-sm">
          {paymentMatched ? (
            <PaymentMatchSummary payment={payment} />
          ) : (
            <div className="grid gap-1">
              <span className="font-semibold text-amber-800">No matching Shopify order yet</span>
              <span className="text-xs leading-5 text-muted-foreground">If the webhook did not match this request automatically, enter the order details to attach the payment.</span>
            </div>
          )}
        </div>
        <ManualShopifyMatchForm
          disabled={matching}
          initialEmail={initialEmail}
          isOverride={paymentMatched}
          onMatch={onMatchOrder}
        />
      </div>
    </section>
  );
}

function PaymentMatchSummary({ payment }: { payment: Record<string, unknown> }) {
  const orderName = stringValue(payment.orderName);
  const total = [stringValue(payment.totalPrice), stringValue(payment.currency)].filter(Boolean).join(" ");
  return (
    <span className="grid gap-1">
      <span className="font-semibold text-emerald-800">{orderName ? `Matched to Shopify order ${orderName}` : "Matched to Shopify order"}</span>
      <span className="text-xs text-[#5c7468]">
        {[total, stringValue(payment.orderEmail), payment.matchedAt ? `Matched ${new Date(String(payment.matchedAt)).toLocaleString()}` : ""].filter(Boolean).join(" · ")}
      </span>
    </span>
  );
}

function ManualShopifyMatchForm({
  disabled,
  initialEmail,
  isOverride,
  onMatch,
}: {
  disabled: boolean;
  initialEmail: string;
  isOverride: boolean;
  onMatch: (payload: ShopifyOrderMatchPayload) => Promise<{ error?: string }>;
}) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const result = await onMatch({
      orderName: String(formData.get("orderName") ?? "").trim(),
      orderEmail: String(formData.get("orderEmail") ?? "").trim(),
      totalPrice: String(formData.get("totalPrice") ?? "").trim(),
      currency: String(formData.get("currency") ?? "").trim() || "USD",
      orderId: String(formData.get("orderId") ?? "").trim(),
    });
    setMessage(result.error ? result.error : "Shopify payment match saved.");
  }

  return (
    <form className="grid gap-3 rounded-lg border border-[#dce6df] bg-white p-4" onSubmit={submit}>
      <div>
        <h3 className="text-sm font-semibold text-[#153f2b]">{isOverride ? "Override Shopify order" : "Match Shopify order"}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {isOverride ? "Use this only if the matched order is wrong." : "Use this when the webhook did not automatically match the payment."}
        </p>
      </div>
      <label className="grid gap-1 text-xs font-semibold text-[#193f2c]">
        Order number/name
        <input className={inputClassName} name="orderName" placeholder="#1234" required />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-[#193f2c]">
        Order email
        <input className={inputClassName} defaultValue={initialEmail} name="orderEmail" placeholder="patient@example.com" type="email" />
      </label>
      <div className="grid grid-cols-[1fr_84px] gap-2">
        <label className="grid gap-1 text-xs font-semibold text-[#193f2c]">
          Total
          <input className={inputClassName} inputMode="decimal" name="totalPrice" placeholder="30.00" />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-[#193f2c]">
          Currency
          <input className={inputClassName} defaultValue="USD" name="currency" />
        </label>
      </div>
      <label className="grid gap-1 text-xs font-semibold text-[#193f2c]">
        Shopify order ID
        <input className={inputClassName} name="orderId" placeholder="Optional" />
      </label>
      <Button disabled={disabled} size="sm" type="submit">
        {disabled ? "Saving..." : isOverride ? "Save override" : "Match order"}
      </Button>
      {message ? <p className={`text-xs font-semibold ${message.includes("saved") ? "text-emerald-800" : "text-red-700"}`}>{message}</p> : null}
    </form>
  );
}

type TableRow = [label: string, value: ReactNode];

const inputClassName = "h-9 rounded-md border border-[#dce6df] bg-white px-3 text-sm outline-none focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/15";

function DataTable({ caption, rows }: { caption: string; rows: TableRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#dce6df]">
      <table className="w-full border-collapse text-sm">
        <caption className="bg-[#f7faf7] px-4 py-3 text-left text-sm font-semibold text-[#153f2b]">{caption}</caption>
        <tbody className="divide-y divide-[#e6eee8]">
          {rows.map(([label, value]) => (
            <tr className="align-top" key={label}>
              <th className="w-56 bg-[#fbfdfb] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#5c7468]">
                {label}
              </th>
              <td className="break-words px-4 py-3 text-[#193f2c]">
                {isEmptyValue(value) ? <span className="text-muted-foreground">Not provided</span> : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function formatValue(key: string, value: unknown, submissionId: string) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (isUploadMetadata(value)) {
    return (
      <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={`/api/admin/form-submissions/${submissionId}/attachment?field=${encodeURIComponent(key)}`}>
        {value.originalName || "Download uploaded PDF"}
      </a>
    );
  }
  return String(value ?? "");
}

function isUploadMetadata(value: unknown): value is { originalName?: string } {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "path" in value);
}

function isFmlaSubmission(item: FormSubmissionListItem) {
  return item.form_key === "fmla-short-term-disability-paperwork" || /fmla|short-term disability/i.test(item.form_name || "");
}

function fmlaFilterMatches(item: FormSubmissionListItem, filter: FmlaStatusFilter) {
  if (filter === "all") return true;
  if (filter === "open") return item.status === "new";
  if (filter === "in_progress") return item.status === "reviewed" || item.status === "contacted";
  if (filter === "complete") return item.status === "closed";
  return item.status === "spam";
}

function statusLabel(status: FormSubmissionListItem["status"]) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function contactLink(type: "email" | "phone", value: string) {
  if (!value) return "";
  const href = type === "email" ? `mailto:${value}` : phoneHref(value);
  return (
    <a className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href={href}>
      {value}
    </a>
  );
}

function phoneHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? `tel:+1${digits.slice(-10)}` : `tel:${digits}`;
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isEmptyValue(value: ReactNode) {
  return value === "" || value === null || value === undefined;
}
