export type AdminSessionUser = {
  email: string;
  name?: string;
  picture?: string;
};

export const adminSessionCookieName = "jl_admin_session";

type AdminSessionPayload = AdminSessionUser & {
  exp: number;
  version: 2;
};

const encoder = new TextEncoder();

export async function createAdminSession(user: AdminSessionUser, maxAgeSeconds = 60 * 60 * 8) {
  const payload: AdminSessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    version: 2,
  };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(value?: string | null): Promise<AdminSessionPayload | null> {
  if (!value) return null;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = await signValue(encodedPayload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as AdminSessionPayload;
    if (!payload.email || !payload.exp || payload.version !== 2 || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAllowedAdminEmail(email: string) {
  const configured = process.env.ADMIN_ALLOWED_EMAILS;
  if (!configured) return process.env.NODE_ENV !== "production";
  return configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

async function signValue(value: string) {
  const secret = process.env.ADMIN_AUTH_SECRET || (process.env.NODE_ENV !== "production" ? "journeylite-dev-admin-secret" : "");
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}
