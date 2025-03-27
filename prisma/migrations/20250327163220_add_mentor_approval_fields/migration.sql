-- AlterTable
ALTER TABLE "User" ADD COLUMN     "submittedForApproval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submittedForApprovalAt" TIMESTAMP(3);
