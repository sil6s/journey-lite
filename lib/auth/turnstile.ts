type TurnstileVerification = {
  success?: boolean;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
};

type TurnstileResult =
  | { ok: true; bypassed: boolean; reason?: string }
  | { ok: false; bypassed: false; reason: string };

export async function verifyTurnstileToken(
  token: string | undefined,
  action: string,
  remoteIp?: string
): Promise<TurnstileResult> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const enforcement = process.env.TURNSTILE_ENFORCEMENT ?? "optional";

  if (!siteKey || !secretKey) {
    if (enforcement === "required") {
      return { ok: false, bypassed: false, reason: "Turnstile is not configured." };
    }
    return { ok: true, bypassed: true, reason: "Turnstile verification is not configured." };
  }

  if (!token) {
    return { ok: false, bypassed: false, reason: "Missing Turnstile token." };
  }

  const formData = new FormData();
  formData.set("secret", secretKey);
  formData.set("response", token);
  if (remoteIp) formData.set("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      bypassed: false,
      reason: `Turnstile API error ${response.status}: ${text.slice(0, 120)}`,
    };
  }

  const result = (await response.json()) as TurnstileVerification;

  if (!result.success) {
    return {
      ok: false,
      bypassed: false,
      reason: `Turnstile token invalid: ${(result["error-codes"] ?? ["unknown"]).join(", ")}`,
    };
  }

  if (result.action && result.action !== action) {
    return { ok: false, bypassed: false, reason: "Turnstile action mismatch." };
  }

  return { ok: true, bypassed: false };
}
