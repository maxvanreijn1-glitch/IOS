-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "usedAt",
DROP COLUMN "expiresAt",
ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;
