// Build command for Vercel ("npm run vercel-build"): generate the Prisma client, apply database
// migrations and seed empty tables when a database is connected, then build Next.js.
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

// Same lookup as src/lib/db-url.ts: Neon (DATABASE_URL) or Prisma Postgres (POSTGRES_URL) names.
const hasDb = ["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_POOLED", "POSTGRES_PRISMA_URL", "DATABASE_URL_UNPOOLED"].some((n) =>
  /^postgres(ql)?:\/\//.test((process.env[n] || "").trim()),
);

run("npx prisma generate");
if (hasDb) {
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed.ts"); // idempotent: only fills empty tables, never overwrites admin edits
} else {
  console.warn("\nNo Postgres URL (DATABASE_URL or POSTGRES_URL) is set: building from the built-in menu data (admin disabled).");
}
if (!process.env.AUTH_SECRET) console.warn("AUTH_SECRET is not set: admin sign-in will not work until it is.");
run("npx next build");
