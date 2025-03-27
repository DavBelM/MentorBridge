-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "allowNewRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "requireMentorApproval" BOOLEAN NOT NULL DEFAULT true,
    "maxSessionsPerWeek" INTEGER NOT NULL DEFAULT 5,
    "sessionDuration" INTEGER NOT NULL DEFAULT 60,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "siteName" TEXT NOT NULL DEFAULT 'MentorBridge',
    "contactEmail" TEXT NOT NULL DEFAULT 'support@mentorbridge.com',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
