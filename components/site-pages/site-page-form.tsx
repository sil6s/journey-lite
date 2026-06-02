"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { FormDefinition, FormFieldDefinition } from "@/src/lib/sanity/types";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function SitePageForm({ form, pageSlug }: { form: FormDefinition; pageSlug: string }) {
  const fields = useMemo(() => form.fields?.filter((field) => field.key && field.type) ?? [], [form.fields]);
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFields(fields, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formKey: form.key,
          pageSlug,
          values,
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
      if (payload.redirectUrl) window.location.href = payload.redirectUrl;
    } catch {
      setState("error");
      setMessage(form.errorMessage || "Something went wrong. Please try again.");
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
  value: string | boolean | string[] | undefined;
  error?: string;
  onChange: (value: string | boolean | string[]) => void;
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
      {field.helpText && !["checkbox", "consent"].includes(field.type) ? <p className="mt-1 text-xs leading-5 text-[#64736b]">{field.helpText}</p> : null}
      {error ? <p className="mt-1 text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

function initialValues(fields: FormFieldDefinition[]) {
  const values: Record<string, string | boolean | string[]> = {};
  for (const field of fields) {
    if (!field.key) continue;
    if (field.type === "checkbox" || field.type === "consent") values[field.key] = field.defaultValue === "true";
    else if (field.type === "checkboxGroup") values[field.key] = field.defaultValue ? [field.defaultValue] : [];
    else values[field.key] = field.defaultValue || "";
  }
  values.website = "";
  return values;
}

function validateFields(fields: FormFieldDefinition[], values: Record<string, string | boolean | string[]>) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.key) continue;
    const value = values[field.key];
    const isEmpty = Array.isArray(value) ? value.length === 0 : typeof value === "boolean" ? !value : !String(value ?? "").trim();
    if (field.required && isEmpty) errors[field.key] = "This field is required.";
    if (field.type === "email" && value && typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = "Enter a valid email address.";
    if (field.type === "phone" && value && typeof value === "string" && value.replace(/\D/g, "").length < 10) errors[field.key] = "Enter a valid phone number.";
  }
  return errors;
}
