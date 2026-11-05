-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "industry" TEXT,
    "pillar" TEXT NOT NULL,
    "scope" TEXT[],
    "stage" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "estimateLowThousandsINR" INTEGER NOT NULL,
    "estimateHighThousandsINR" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
