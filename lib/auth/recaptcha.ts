export async function verifyRecaptchaToken(token: string | undefined, action: string, remoteIp?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return {
      ok: process.env.NODE_ENV !== "production",
      bypassed: process.env.NODE_ENV !== "production",
      reason: "reCAPTCHA secret is not configured.",
    };
  }

  if (!token) return { ok: false, bypassed: false, reason: "Missing reCAPTCHA token." };

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {}),
    }),
  });
  const result = (await response.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };

  if (!result.success) return { ok: false, bypassed: false, reason: result["error-codes"]?.join(", ") || "reCAPTCHA failed." };
  if (result.action && result.action !== action) return { ok: false, bypassed: false, reason: "reCAPTCHA action mismatch." };
  if (typeof result.score === "number" && result.score < 0.5) return { ok: false, bypassed: false, reason: "reCAPTCHA score too low." };

  return { ok: true, bypassed: false };
}
