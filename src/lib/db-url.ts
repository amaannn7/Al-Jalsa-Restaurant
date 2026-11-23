/**
 * Finds the Postgres connection string whichever Vercel database integration created it:
 * Neon sets DATABASE_URL / DATABASE_URL_UNPOOLED; Prisma Postgres sets POSTGRES_URL (direct) and
 * PRISMA_DATABASE_URL (a prisma+postgres:// Accelerate URL, which the pg driver cannot use, so it is
 * skipped). Only plain postgres:// or postgresql:// URLs are returned.
 */
const isPg = (v: string | undefined): v is string => !!v && /^postgres(ql)?:\/\//.test(v.trim());

function first(names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (isPg(v)) return v.trim();
  }
  return undefined;
}

/** For the running site (a pooled URL is fine). */
export function runtimeDatabaseUrl(): string | undefined {
  return first(["DATABASE_URL", "POSTGRES_URL", "DATABASE_URL_POOLED", "POSTGRES_PRISMA_URL", "DATABASE_URL_UNPOOLED"]);
}

/** For migrations and the seed (a direct, unpooled URL is preferred). */
export function directDatabaseUrl(): string | undefined {
  return first(["DATABASE_URL_UNPOOLED", "DIRECT_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "DATABASE_URL"]);
}
