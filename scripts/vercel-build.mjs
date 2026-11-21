// Build command for Vercel ("npm run vercel-build"): generate the Prisma client, apply database
// migrations and seed empty tables when a database is connected, then build Next.js.
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

run("npx prisma generate");
if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed.ts"); // idempotent: only fills empty tables, never overwrites admin edits
} else {
  console.warn("\nDATABASE_URL is not set: building from the built-in menu data (admin disabled).");
}
if (!process.env.AUTH_SECRET) console.warn("AUTH_SECRET is not set: admin sign-in will not work until it is.");
run("npx next build");
