"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { addToCart } from "@/lib/shopify/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FMLA_BUCKET = "form-uploads";
const CART_ID_KEY = "journeylite_shopify_cart_id";
const CART_URL_KEY = "journeylite_shopify_checkout_url";
const CART_QTY_KEY = "journeylite_shopify_cart_qty";
const CART_UPDATED_EVENT = "journeylite-shopify-cart-updated";

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

    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      setState("error");
      setMessage("Email and confirmation email must match.");
      return;
    }

    try {
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
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not submit the paperwork request.");
      }

      form.reset();
      setFile(null);
      const nextCheckoutUrl = await maybeAddFmlaProductToCart();
      setState("success");
      setMessage(
        nextCheckoutUrl
          ? "Thank you. We received your paperwork request and added the FMLA fee to your cart."
          : "Thank you. We received your paperwork request. Please complete the $30 FMLA payment in the eStore."
      );
    } catch (error) {
      setState("error");
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
      <div className="grid gap-4 md:grid-cols-2">
        <input autoComplete="off" className="hidden" name="website" tabIndex={-1} type="text" />
        <Field label="First Name" name="firstName" required />
        <Field label="Last Name" name="lastName" required />
        <Field label="Your Email" name="email" required type="email" />
        <Field label="Confirm Email" name="confirmEmail" required type="email" />
        <Field label="Date of Birth" name="dob" required type="date" />
        <Field label="Phone" name="phone" required type="tel" />
        <label className="grid gap-1 text-sm font-semibold text-[#1f2c25] md:col-span-2">
          My Job Is <span className="sr-only">required</span>
          <select className="min-h-11 rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm" name="jobType" required>
            <option value="">Select job type</option>
            <option value="Desk Only">Desk Only</option>
            <option value="Light Duty">Light Duty</option>
            <option value="Moderate Duty">Moderate Duty</option>
            <option value="Heavy Labor">Heavy Labor</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <Field label="Employer" name="employer" required />
        <Field label="Send Completed Form To Fax/Email" name="sendCompletedTo" required />
        <label className="flex gap-3 rounded-md border border-[#dce4df] bg-[#f8fbf9] p-3 text-sm leading-6 text-[#53635b] md:col-span-2">
          <input className="mt-1" name="permissionToTransmit" required type="checkbox" />
          <span>I give permission to transmit this info via email or fax.</span>
        </label>
        <label className="flex gap-3 rounded-md border border-[#dce4df] bg-[#f8fbf9] p-3 text-sm leading-6 text-[#53635b] md:col-span-2">
          <input className="mt-1" name="paymentAcknowledged" required type="checkbox" />
          <span>
            I understand I will complete the $30 FMLA payment after submitting this form.{" "}
            <Link className="font-semibold text-[#145c42] underline-offset-4 hover:underline" href="/shop#services">
              View eStore
            </Link>
          </span>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#1f2c25] md:col-span-2">
          Upload Scanned FMLA Form Here
          <input
            accept="application/pdf,.pdf"
            className="min-h-11 rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <span className="text-xs font-normal leading-5 text-[#64736b]">
            Accepted file type: PDF. Max file size: 50 MB. If we have not already received it, upload a PDF here or fax it to 513-559-1235.
          </span>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#1f2c25] md:col-span-2">
          Additional Information
          <textarea className="min-h-28 rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm" name="additionalInformation" />
        </label>
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

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "date";
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[#1f2c25]">
      {label}
      <input className="min-h-11 rounded-md border border-[#cbd9d1] bg-white px-3 py-2 text-sm" name={name} required={required} type={type} />
    </label>
  );
}
