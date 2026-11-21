-- AlterTable
ALTER TABLE "MenuVariant" ADD COLUMN     "calories" INTEGER;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "buffetEnabled" BOOLEAN NOT NULL DEFAULT true;
