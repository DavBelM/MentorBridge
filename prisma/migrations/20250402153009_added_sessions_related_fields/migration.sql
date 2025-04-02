/*
  Warnings:

  - Added the required column `menteeId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "menteeId" TEXT NOT NULL,
ADD COLUMN     "mentorId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
