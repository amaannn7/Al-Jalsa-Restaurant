import "dotenv/config";
import { defineConfig } from "prisma/config";

import { directDatabaseUrl } from "./src/lib/db-url";

// Migrations prefer the direct (unpooled) connection; works with Neon or Prisma Postgres variable names.
const url = directDatabaseUrl() ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
