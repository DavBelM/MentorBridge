-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "interests" TEXT,
ADD COLUMN     "learningGoals" TEXT,
ALTER COLUMN "education" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
