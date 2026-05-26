export async function verifyRecaptchaToken(token: string | undefined, action: string, _remoteIp?: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const enforcement = process.env.RECAPTCHA_ENFORCEMENT ?? "optional";

  // If Enterprise server verification is incomplete, keep admin OAuth usable but report bypass mode.
  if (!siteKey || !apiKey || !projectId) {
    if (enforcement === "required") {
      return { ok: false, bypassed: false, score: 0, reason: "reCAPTCHA Enterprise is not configured." };
    }
    return { ok: true, bypassed: true, score: 1, reason: "reCAPTCHA Enterprise server verification is not configured." };
  }

  if (!token) return { ok: false, bypassed: false, score: 0, reason: "Missing reCAPTCHA token." };

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey,
        expectedAction: action,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { ok: false, bypassed: false, score: 0, reason: `Enterprise API error ${response.status}: ${text.slice(0, 120)}` };
  }

  const result = (await response.json()) as {
    tokenProperties?: { valid?: boolean; action?: string };
    riskAnalysis?: { score?: number };
    name?: string;
  };

  if (!result.tokenProperties?.valid) {
    return { ok: false, bypassed: false, score: 0, reason: "reCAPTCHA token invalid." };
  }
  if (result.tokenProperties.action && result.tokenProperties.action !== action) {
    return { ok: false, bypassed: false, score: 0, reason: "reCAPTCHA action mismatch." };
  }

  const score = result.riskAnalysis?.score ?? 0;
  if (score < 0.5) {
    return { ok: false, bypassed: false, score, reason: `reCAPTCHA score too low (${score}).` };
  }

  return { ok: true, bypassed: false, score };
}
