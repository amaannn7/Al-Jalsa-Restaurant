import "server-only";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, hasDatabase } from "./db";
import { SESSION_COOKIE, SESSION_HOURS, signSession, verifySessionToken } from "./session";

export type Admin = { id: string; email: string; name: string; role: "OWNER" | "EDITOR" };

/** Full check: valid signature, user still active, session not revoked. */
export async function getCurrentAdmin(): Promise<Admin | null> {
  if (!hasDatabase) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await db().adminUser.findUnique({ where: { id: session.sub } });
  if (!user || !user.isActive || user.sessionVersion !== session.v) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(role?: "OWNER"): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (role === "OWNER" && admin.role !== "OWNER") redirect("/admin?denied=1");
  return admin;
}

async function clientKey(email: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return { byEmail: `login:${email}`, byIp: `login-ip:${ip}` };
}

const WINDOW_MS = 15 * 60 * 1000;
let dummyHash: string | null = null;

/** Returns an error message, or null on success (cookie set). */
export async function attemptLogin(emailRaw: string, password: string): Promise<string | null> {
  if (!hasDatabase) return "The database is not connected yet.";
  const email = emailRaw.trim().toLowerCase();
  const keys = await clientKey(email);
  const since = new Date(Date.now() - WINDOW_MS);
  const [failsEmail, failsIp] = await Promise.all([
    db().loginAttempt.count({ where: { key: keys.byEmail, success: false, createdAt: { gte: since } } }),
    db().loginAttempt.count({ where: { key: keys.byIp, success: false, createdAt: { gte: since } } }),
  ]);
  if (failsEmail >= 5 || failsIp >= 20) return "Too many attempts. Please wait 15 minutes and try again.";

  const user = await db().adminUser.findUnique({ where: { email } });
  // Compare against a dummy hash when the user does not exist, so timing does not reveal accounts.
  dummyHash ??= await bcrypt.hash("timing-equaliser-not-a-password", 12);
  const ok = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
  if (!user || !ok || !user.isActive) {
    await db().loginAttempt.createMany({ data: [{ key: keys.byEmail, success: false }, { key: keys.byIp, success: false }] });
    return "Email or password is incorrect.";
  }
  await db().loginAttempt.create({ data: { key: keys.byEmail, success: true } });
  await db().adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await signSession({ sub: user.id, role: user.role, v: user.sessionVersion });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return null;
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return "Use at least 12 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number.";
  return null;
}
