import { jwtVerify, SignJWT } from "jose";

/** Signed admin session token. Edge/Node safe (used by proxy.ts and server code). */
export const SESSION_COOKIE = "aj_admin";
export const SESSION_HOURS = 8;

export type SessionPayload = { sub: string; role: "OWNER" | "EDITOR"; v: number };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ role: p.role, v: p.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub || (payload.role !== "OWNER" && payload.role !== "EDITOR")) return null;
    return { sub: payload.sub, role: payload.role, v: Number(payload.v) || 0 };
  } catch {
    return null;
  }
}
