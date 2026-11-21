import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations prefer the direct (unpooled) connection that Neon/Vercel provide.
const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
