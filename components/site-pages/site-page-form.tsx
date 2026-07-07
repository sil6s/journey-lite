"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { createClient } from "@/lib/supabase/client";
import type { FormDefinition, FormFieldDefinition } from "@/src/lib/sanity/types";

type SubmitState = "idle" | "submitting" | "success" | "error";
type UploadValue = { path: string; originalName: string; size: number; type: string };
type FormValue = string | boolean | string[] | File | UploadValue | null;
const UPLOAD_BUCKET = "form-uploads";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SitePageForm({ form, pageSlug }: { form: FormDefinition; pageSlug: string }) {
  const fields = useMemo(() => form.fields?.filter((field) => field.key && field.type) ?? [], [form.fields]);
  const [values, setValues] = useState<Record<string, FormValue>>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFields(fields, values);
    if (TURNSTILE_SITE_KEY && !turnstileToken) nextErrors.turnstile = "Please complete the security check.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState("submitting");
    setMessage("");

    try {
      const preparedValues = await prepareValuesForSubmit(form.key, fields, values);
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formKey: form.key,
          pageSlug,
          values: preparedValues,
          turnstileToken,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; redirectUrl?: string };

      if (!response.ok || !payload.ok) {
        setState("error");
        setMessage(payload.error || form.errorMessage || "Something went wrong. Please try again.");
        return;
      }

      setState("success");
      setMessage(form.successMessage || "Thank you. We received your submission.");
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
      if (payload.redirectUrl) window.location.href = payload.redirectUrl;
    } catch {
      setState("error");
      setMessage(form.errorMessage || "Something went wrong. Please try again.");
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
    }
  }

  if (form.status !== "active") return null;

  return (
    <form className="rounded-xl border border-[#dce4df] bg-white p-5 shadow-sm md:p-6" onSubmit={onSubmit}>
      {form.title ? <h3 className="font-serif text-3xl leading-tight text-[#1f2c25]">{form.title}</h3> : null}
      {form.introText ? <p className="mt-3 text-sm leading-6 text-[#53635b]">{form.introText}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <FieldControl
            error={field.key ? errors[field.key] : undefined}
            field={field}
            key={field._key ?? field.key}
            value={field.key ? values[field.key] : undefined}
            onChange={(value) => {
              if (!field.key) return;
              setValues((prev) => ({ ...prev, [field.key as string]: value }));
              setErrors((prev) => ({ ...prev, [field.key as string]: "" }));
            }}
          />
        ))}
      </div>
      <input
        className="hidden"
        name={form.spamProtection?.honeypotFieldName || "website"}
        tabIndex={-1}
        type="text"
        value={(values[form.spamProtection?.honeypotFieldName || "website"] as string) || ""}
        onChange={(event) =>
          setValues((prev) => ({ ...prev, [form.spamProtection?.honeypotFieldName || "website"]: event.target.value }))
        }
      />
      <div className="mt-6">
        <TurnstileWidget
          action="site_form_submit"
          key={turnstileResetKey}
          onError={() => {
            setTurnstileToken("");
            setErrors((prev) => ({ ...prev, turnstile: "Security check failed. Please try again." }));
          }}
          onExpire={() => {
            setTurnstileToken("");
            setErrors((prev) => ({ ...prev, turnstile: "Security check expired. Please try again." }));
          }}
          onVerify={(token) => {
            setTurnstileToken(token);
            if (token) setErrors((prev) => ({ ...prev, turnstile: "" }));
          }}
        />
        {errors.turnstile ? <p className="mt-2 text-sm font-semibold text-[#8a3b22]">{errors.turnstile}</p> : null}
      </div>
      <div className="mt-6">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4d37] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={state === "submitting"}
          type="submit"
        >
          {state === "submitting" ? "Submitting..." : form.submitButtonLabel || "Submit"}
        </button>
      </div>
      {message ? (
        <p
          className={state === "success" ? "mt-4 rounded-lg bg-[#edf4ef] p-3 text-sm text-[#145c42]" : "mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"}
          role={state === "success" ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

function FieldControl({
  field,
  value,
  error,
  onChange,
}: {
  field: FormFieldDefinition;
  value: FormValue | undefined;
  error?: string;
  onChange: (value: FormValue) => void;
}) {
  const id = `form-field-${field._key || field.key}`;
  const commonClass =
    "min-h-11 w-full rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm text-[#1f2c25] outline-none transition placeholder:text-[#8b9b92] focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/15";
  const wrapperClass = field.width === "half" && field.type !== "hidden" ? "md:col-span-1" : "md:col-span-2";
  const options = field.options?.filter((option) => option.value || option.label) ?? [];

  if (field.type === "hidden") {
    return <input name={field.key} type="hidden" value={String(value ?? field.defaultValue ?? "")} />;
  }

  return (
    <div className={wrapperClass}>
      <label className="text-sm font-semibold text-[#1f2c25]" htmlFor={id}>
        {field.label}
        {field.required ? <span className="text-red-600"> *</span> : null}
      </label>
      {field.type === "textarea" ? (
        <textarea
          className={`${commonClass} mt-1 min-h-28 resize-y`}
          id={id}
          placeholder={field.placeholder}
          required={field.required}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
      {["text", "email", "phone", "number", "date"].includes(field.type) ? (
        <input
          className={`${commonClass} mt-1`}
          id={id}
          inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "decimal" : undefined}
          placeholder={field.placeholder}
          required={field.required}
          type={field.type === "phone" ? "tel" : field.type}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
      {field.type === "select" ? (
        <select className={`${commonClass} mt-1`} id={id} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
          <option value="">{field.placeholder || "Select an option"}</option>
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value || option.label}>
              {option.label || option.value}
            </option>
          ))}
        </select>
      ) : null}
      {field.type === "radio" ? (
        <div className="mt-2 grid gap-2">
          {options.map((option) => (
            <label className="flex items-center gap-2 text-sm text-[#53635b]" key={option.value || option.label}>
              <input checked={value === (option.value || option.label)} name={field.key} required={field.required && !value} type="radio" value={option.value || option.label} onChange={(event) => onChange(event.target.value)} />
              {option.label || option.value}
            </label>
          ))}
        </div>
      ) : null}
      {field.type === "checkboxGroup" ? (
        <div className="mt-2 grid gap-2">
          {options.map((option) => {
            const itemValue = option.value || option.label || "";
            const selected = Array.isArray(value) ? value : [];
            return (
              <label className="flex items-center gap-2 text-sm text-[#53635b]" key={itemValue}>
                <input
                  checked={selected.includes(itemValue)}
                  type="checkbox"
                  value={itemValue}
                  onChange={(event) =>
                    onChange(event.target.checked ? [...selected, itemValue] : selected.filter((selectedValue) => selectedValue !== itemValue))
                  }
                />
                {option.label || option.value}
              </label>
            );
          })}
        </div>
      ) : null}
      {["checkbox", "consent"].includes(field.type) ? (
        <label className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#53635b]">
          <input checked={Boolean(value)} className="mt-1" required={field.required} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
          <span>{field.helpText || field.label}</span>
        </label>
      ) : null}
      {field.type === "file" ? (
        <label className="mt-1 grid cursor-pointer gap-3 rounded-lg border-2 border-dashed border-[#b9d0c3] bg-[#f8fbf9] p-5 text-center transition hover:border-[#145c42] hover:bg-[#f1f8f4]">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-white text-[#145c42] shadow-sm">
            {value instanceof File ? <FileText className="size-5" aria-hidden="true" /> : <UploadCloud className="size-5" aria-hidden="true" />}
          </span>
          <span className="text-sm font-semibold text-[#1f2c25]">{value instanceof File ? value.name : field.placeholder || "Choose file"}</span>
          <span className="text-xs font-normal leading-5 text-[#64736b]">
            {(field.acceptedFileTypes ?? ["application/pdf"]).join(", ")} · max {field.maxFileSizeMb ?? 10} MB
          </span>
          <input
            accept={(field.acceptedFileTypes ?? ["application/pdf"]).join(",")}
            className="sr-only"
            required={field.required}
            type="file"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
          {value instanceof File ? (
            <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#145c42]">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Ready to upload
            </span>
          ) : null}
        </label>
      ) : null}
      {field.helpText && !["checkbox", "consent"].includes(field.type) ? <p className="mt-1 text-xs leading-5 text-[#64736b]">{field.helpText}</p> : null}
      {error ? <p className="mt-1 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function initialValues(fields: FormFieldDefinition[]) {
  const values: Record<string, FormValue> = {};
  for (const field of fields) {
    if (!field.key) continue;
    if (field.type === "checkbox" || field.type === "consent") values[field.key] = field.defaultValue === "true";
    else if (field.type === "checkboxGroup") values[field.key] = field.defaultValue ? [field.defaultValue] : [];
    else if (field.type === "file") values[field.key] = null;
    else values[field.key] = field.defaultValue || "";
  }
  values.website = "";
  return values;
}

function validateFields(fields: FormFieldDefinition[], values: Record<string, FormValue>) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.key) continue;
    const value = values[field.key];
    const isEmpty = value instanceof File ? false : Array.isArray(value) ? value.length === 0 : typeof value === "boolean" ? !value : !String(value ?? "").trim();
    if (field.required && isEmpty) errors[field.key] = "This field is required.";
    if (field.type === "email" && value && typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = "Enter a valid email address.";
    if (field.type === "phone" && value && typeof value === "string" && value.replace(/\D/g, "").length < 10) errors[field.key] = "Enter a valid phone number.";
    if (field.type === "file" && value instanceof File) {
      const maxBytes = (field.maxFileSizeMb ?? 10) * 1024 * 1024;
      const accepted = field.acceptedFileTypes ?? ["application/pdf"];
      if (value.size > maxBytes) errors[field.key] = `File must be ${field.maxFileSizeMb ?? 10} MB or smaller.`;
      if (accepted.length && !accepted.includes(value.type)) errors[field.key] = "This file type is not accepted.";
    }
  }
  return errors;
}

async function prepareValuesForSubmit(formKey: string, fields: FormFieldDefinition[], values: Record<string, FormValue>) {
  const next: Record<string, unknown> = { ...values };
  const supabase = createClient();

  for (const field of fields) {
    if (!field.key || field.type !== "file") continue;
    const value = values[field.key];
    if (!(value instanceof File)) continue;

    const response = await fetch("/api/forms/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formKey,
        fieldKey: field.key,
        fileName: value.name,
        fileSize: value.size,
        fileType: value.type || "application/octet-stream",
      }),
    });
    const payload = (await response.json()) as { path?: string; token?: string; error?: string };
    if (!response.ok || !payload.path || !payload.token) throw new Error(payload.error || "Could not prepare file upload.");

    const { error } = await supabase.storage.from(UPLOAD_BUCKET).uploadToSignedUrl(payload.path, payload.token, value);
    if (error) throw new Error(error.message || "Could not upload file.");

    next[field.key] = {
      path: payload.path,
      originalName: value.name,
      size: value.size,
      type: value.type || "application/octet-stream",
    };
  }

  return next;
}
