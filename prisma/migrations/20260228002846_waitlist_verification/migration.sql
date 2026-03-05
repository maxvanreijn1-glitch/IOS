/*
  Warnings:

  - A unique constraint covering the columns `[verifyToken]` on the table `WaitlistEntry` will be added. If there are existing duplicate values, this will fail.
  - The required column `verifyToken` was added to the `WaitlistEntry` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "WaitlistEntry" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifyToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_verifyToken_key" ON "WaitlistEntry"("verifyToken");
