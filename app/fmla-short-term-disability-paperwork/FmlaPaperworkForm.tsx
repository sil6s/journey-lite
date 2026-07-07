"use client";

import Link from "next/link";
import { useState, type ComponentType, type FormEvent } from "react";
import { AlertCircle, AlertTriangle, BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, CreditCard, FileText, Mail, Phone, Send, UploadCloud, UserRound } from "lucide-react";
import { TurnstileWidget } from "@/components/site/TurnstileWidget";
import { addToCart } from "@/lib/shopify/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FMLA_BUCKET = "form-uploads";
const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type SubmitState = "idle" | "uploading" | "submitting" | "addingToCart" | "success" | "error";

type UploadResult = {
  path: string;
  originalName: string;
  size: number;
  type: string;
};

export function FmlaPaperworkForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  async function uploadFile(): Promise<UploadResult | null> {
    if (!file) return null;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Upload must be a PDF.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("PDF must be 50 MB or smaller.");
    }

    setState("uploading");
    const uploadResponse = await fetch("/api/forms/fmla-paperwork/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/pdf",
      }),
    });
    const uploadPayload = (await uploadResponse.json()) as { path?: string; token?: string; error?: string };
    if (!uploadResponse.ok || !uploadPayload.path || !uploadPayload.token) {
      throw new Error(uploadPayload.error || "Could not prepare the file upload.");
    }

    const supabase = createClient();
    const { error } = await supabase.storage.from(FMLA_BUCKET).uploadToSignedUrl(uploadPayload.path, uploadPayload.token, file);
    if (error) throw new Error(error.message || "Could not upload the PDF.");

    return {
      path: uploadPayload.path,
      originalName: file.name,
      size: file.size,
      type: file.type || "application/pdf",
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (String(formData.get("website") ?? "").trim()) {
      setState("success");
      setMessage("Thank you. We received your FMLA/short-term disability paperwork request.");
      return;
    }

    const email = String(formData.get("email") ?? "").trim();
    const confirmEmail = String(formData.get("confirmEmail") ?? "").trim();
    const nextErrors = validateForm(formData, file);
    if (TURNSTILE_SITE_KEY && !turnstileToken) nextErrors.turnstile = "Please complete the security check.";

    if (Object.keys(nextErrors).length) {
      setState("error");
      setErrors(nextErrors);
      setMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      setErrors({});
      const upload = await uploadFile();
      setState("submitting");

      const response = await fetch("/api/forms/fmla-paperwork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          email,
          confirmEmail,
          dob: String(formData.get("dob") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          jobType: String(formData.get("jobType") ?? "").trim(),
          employer: String(formData.get("employer") ?? "").trim(),
          sendCompletedTo: String(formData.get("sendCompletedTo") ?? "").trim(),
          permissionToTransmit: formData.get("permissionToTransmit") === "on",
          paymentAcknowledged: formData.get("paymentAcknowledged") === "on",
          additionalInformation: String(formData.get("additionalInformation") ?? "").trim(),
          upload,
          website: String(formData.get("website") ?? ""),
          turnstileToken,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not submit the paperwork request.");
      }

      form.reset();
      setFile(null);
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
      const nextCheckoutUrl = await maybeAddFmlaProductToCart();
      setState("success");
      setMessage(
        nextCheckoutUrl
          ? "Thank you. We received your paperwork request and added the FMLA fee to your cart."
          : "Thank you. We received your paperwork request. Please complete the $30 FMLA payment in the eStore."
      );
    } catch (error) {
      setState("error");
      setTurnstileToken("");
      setTurnstileResetKey((key) => key + 1);
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function maybeAddFmlaProductToCart() {
    const variantId = new URLSearchParams(window.location.search).get("variantId");
    if (!variantId) return null;

    setState("addingToCart");
    const cartId = window.localStorage.getItem(CART_ID_KEY);
    const result = await addToCart(variantId, cartId);
    if (result.error) throw new Error(result.error);

    if (result.cartId) window.localStorage.setItem(CART_ID_KEY, result.cartId);
    if (result.checkoutUrl) {
      window.localStorage.setItem(CART_URL_KEY, result.checkoutUrl);
      setCheckoutUrl(result.checkoutUrl);
    }
    if (typeof result.totalQuantity === "number") {
      window.localStorage.setItem(CART_QTY_KEY, String(result.totalQuantity));
    }
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    return result.checkoutUrl ?? null;
  }

  const isBusy = state === "uploading" || state === "submitting" || state === "addingToCart";

  return (
    <form className="rounded-lg border border-[#dce4df] bg-white p-5 shadow-sm md:p-6" onSubmit={onSubmit}>
      <div className="mb-6 rounded-lg border border-[#c9ded2] bg-[#f4faf6] p-4">
        <div className="flex gap-3">
          <CreditCard className="mt-0.5 size-5 shrink-0 text-[#145c42]" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-[#1f2c25]">Next step after this form: payment</h2>
            <p className="mt-1 text-sm leading-6 text-[#53635b]">
              Submit the paperwork details first. After successful submission, the $30 FMLA paperwork fee is added to your cart so you can complete payment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />
        <Field autoComplete="given-name" error={errors.firstName} icon={UserRound} label="First Name" name="firstName" placeholder="First name" required />
        <Field autoComplete="family-name" error={errors.lastName} icon={UserRound} label="Last Name" name="lastName" placeholder="Last name" required />
        <Field autoComplete="email" error={errors.email} icon={Mail} label="Your Email" name="email" placeholder="you@example.com" required type="email" />
        <Field autoComplete="email" error={errors.confirmEmail} icon={Mail} label="Confirm Email" name="confirmEmail" placeholder="Re-enter email" required type="email" />
        <Field error={errors.dob} icon={CalendarDays} label="Date of Birth" name="dob" required type="date" />
        <Field autoComplete="tel" error={errors.phone} icon={Phone} inputMode="tel" label="Phone" name="phone" pattern="[0-9()+\\-.\\s]{10,}" placeholder="(513) 555-1234" required type="tel" />
        <label className="grid gap-1 text-sm font-semibold text-[#1f2c25] md:col-span-2">
          <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4 text-[#145c42]" aria-hidden="true" /> My Job Is <span className="text-red-600">*</span></span>
          <span className="relative">
            <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6a7c72]" aria-hidden="true" />
            <select className="min-h-11 w-full rounded-md border border-[#cbd9d1] bg-white px-10 py-2 text-sm outline-none transition focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/15 aria-[invalid=true]:border-red-500" name="jobType" required aria-invalid={Boolean(errors.jobType)}>
              <option value="">Select job type</option>
              <option value="Desk Only">Desk Only</option>
              <option value="Light Duty">Light Duty</option>
              <option value="Moderate Duty">Moderate Duty</option>
              <option value="Heavy Labor">Heavy Labor</option>
              <option value="Other">Other</option>
            </select>
          </span>
          {errors.jobType ? <span className="text-xs font-medium text-red-700">{errors.jobType}</span> : null}
        </label>
        <Field error={errors.employer} icon={Building2} label="Employer" name="employer" placeholder="Employer name" required />
        <Field error={errors.sendCompletedTo} helpText="Enter a valid email address or a 10-digit fax number." icon={Send} label="Send Completed Form To Fax/Email" name="sendCompletedTo" placeholder="hr@example.com or (513) 555-1234" required />
        <label className="group grid cursor-pointer gap-3 rounded-lg border-2 border-dashed border-[#b9d0c3] bg-[#f8fbf9] p-5 text-center transition hover:border-[#145c42] hover:bg-[#f1f8f4] md:col-span-2">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-[#145c42] shadow-sm">
            {file ? <FileText className="size-6" aria-hidden="true" /> : <UploadCloud className="size-6" aria-hidden="true" />}
          </span>
          <span className="text-sm font-semibold text-[#1f2c25]">Upload scanned FMLA form PDF</span>
          <span className="text-xs font-normal leading-5 text-[#64736b]">
            Drag-style upload area. Accepted file type: PDF. Max file size: 50 MB. You can also fax it to 513-559-1235.
          </span>
          <input
            accept="application/pdf,.pdf"
            className="sr-only"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          {file ? (
            <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#145c42]">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {file.name}
            </span>
          ) : null}
          {errors.file ? (
            <span className="mx-auto inline-flex items-center gap-2 text-xs font-medium text-red-700">
              <AlertCircle className="size-3.5" aria-hidden="true" />
              {errors.file}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#1f2c25] md:col-span-2">
          Additional Information
          <textarea className="min-h-28 rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/15" name="additionalInformation" placeholder="Anything else our medical assistants should know?" />
        </label>
        <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm leading-6 text-orange-950 md:col-span-2" role="alert">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-700" aria-hidden="true" />
            <div>
              <p className="font-bold">Payment must be completed within 1 hour.</p>
              <p className="mt-1">
                After this form is submitted, complete the $30 payment checkout within one hour. If payment is not completed within one hour, this form submission may be deleted and you may need to submit it again.
              </p>
            </div>
          </div>
        </div>
        <label className="flex gap-3 rounded-md border border-[#dce4df] bg-[#f8fbf9] p-3 text-sm leading-6 text-[#53635b] md:col-span-2">
          <input className="mt-1" name="permissionToTransmit" required type="checkbox" />
          <span>I give permission to transmit this info via email or fax.</span>
        </label>
        {errors.permissionToTransmit ? <span className="-mt-3 text-xs font-medium text-red-700 md:col-span-2">{errors.permissionToTransmit}</span> : null}
        <label className="flex gap-3 rounded-md border border-[#dce4df] bg-[#f8fbf9] p-3 text-sm leading-6 text-[#53635b] md:col-span-2">
          <input className="mt-1" name="paymentAcknowledged" required type="checkbox" />
          <span>
            I understand I must complete the $30 FMLA payment after submitting this form and within one hour.{" "}
            <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/shop#services">
              View eStore
            </Link>
          </span>
        </label>
        {errors.paymentAcknowledged ? <span className="-mt-3 text-xs font-medium text-red-700 md:col-span-2">{errors.paymentAcknowledged}</span> : null}
        <div className="md:col-span-2">
          <TurnstileWidget
            action="fmla_paperwork"
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
      </div>

      <button
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#145c42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4d37] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isBusy}
        type="submit"
      >
        {state === "uploading" ? "Uploading PDF..." : state === "submitting" ? "Submitting..." : state === "addingToCart" ? "Adding fee to cart..." : "Submit"}
      </button>
      {state === "success" && checkoutUrl ? (
        <Link
          className="ml-3 mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-[#145c42] bg-white px-5 py-3 text-sm font-semibold text-[#145c42] transition hover:bg-[#edf4ef]"
          href={checkoutUrl}
        >
          Continue to Checkout
        </Link>
      ) : null}

      {message ? (
        <p
          className={state === "success" ? "mt-4 rounded-lg bg-[#edf4ef] p-3 text-sm text-[#145c42]" : "mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"}
          role={state === "success" ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[#64736b]">
        By clicking the Submit button, I give permission for this information to be transmitted via internet to JourneyLite Physicians.
      </p>
    </form>
  );
}

function validateForm(formData: FormData, file: File | null) {
  const errors: Record<string, string> = {};
  const requiredFields = ["firstName", "lastName", "email", "confirmEmail", "dob", "phone", "jobType", "employer", "sendCompletedTo"];

  for (const key of requiredFields) {
    if (!String(formData.get(key) ?? "").trim()) errors[key] = "This field is required.";
  }

  const email = String(formData.get("email") ?? "").trim();
  const confirmEmail = String(formData.get("confirmEmail") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (email && confirmEmail && email.toLowerCase() !== confirmEmail.toLowerCase()) errors.confirmEmail = "Email addresses must match.";
  const phoneDigits = String(formData.get("phone") ?? "").replace(/\D/g, "");
  if (phoneDigits && !isValidUsPhone(phoneDigits)) errors.phone = "Enter a valid 10-digit phone number.";
  const dob = String(formData.get("dob") ?? "").trim();
  if (dob) {
    const dobDate = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(dobDate.getTime()) || dobDate > new Date()) errors.dob = "Enter a valid date of birth.";
  }
  const sendCompletedTo = String(formData.get("sendCompletedTo") ?? "").trim();
  if (sendCompletedTo && !isValidEmailOrFax(sendCompletedTo)) errors.sendCompletedTo = "Enter a valid email address or 10-digit fax number.";
  if (formData.get("permissionToTransmit") !== "on") errors.permissionToTransmit = "Permission to transmit is required.";
  if (formData.get("paymentAcknowledged") !== "on") errors.paymentAcknowledged = "Payment acknowledgement is required.";
  if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) errors.file = "Upload must be a PDF.";
  if (file && file.size > MAX_FILE_SIZE) errors.file = "PDF must be 50 MB or smaller.";

  return errors;
}

function isValidUsPhone(digits: string) {
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidEmailOrFax(value: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
  return isValidUsPhone(value.replace(/\D/g, ""));
}

function Field({
  label,
  name,
  required,
  type = "text",
  error,
  autoComplete,
  helpText,
  icon: Icon,
  inputMode,
  pattern,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "date";
  error?: string;
  autoComplete?: string;
  helpText?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  inputMode?: "tel" | "email" | "text" | "numeric" | "decimal";
  pattern?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[#1f2c25]">
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="size-4 text-[#145c42]" aria-hidden={true} /> : null}
        {label}
        {required ? <span className="text-red-600">*</span> : null}
      </span>
      <span className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6a7c72]" aria-hidden={true} /> : null}
        <input
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`min-h-11 w-full rounded-md border border-[#cbd9d1] bg-white py-2 text-sm outline-none transition placeholder:text-[#8b9b92] focus:border-[#145c42] focus:ring-2 focus:ring-[#145c42]/15 aria-[invalid=true]:border-red-500 ${Icon ? "px-10" : "px-3"}`}
          inputMode={inputMode}
          name={name}
          pattern={pattern}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      </span>
      {helpText ? <span className="text-xs font-normal leading-5 text-[#64736b]">{helpText}</span> : null}
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
