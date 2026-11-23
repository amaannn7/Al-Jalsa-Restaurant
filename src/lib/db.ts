import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { runtimeDatabaseUrl } from "./db-url";

const url = runtimeDatabaseUrl();
export const hasDatabase = Boolean(url);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: url, max: 5 });
  return new PrismaClient({ adapter });
}

/** Lazily created so builds without a database (preview deploys) never open a connection. */
export function db(): PrismaClient {
  if (!hasDatabase) throw new Error("No Postgres connection string is configured (DATABASE_URL or POSTGRES_URL)");
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}
