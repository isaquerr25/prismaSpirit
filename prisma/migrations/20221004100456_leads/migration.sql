-- CreateTable
CREATE TABLE "Lied" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth" TIMESTAMP(3),
    "originLead" TEXT,
    "sex" TEXT,
    "address" TEXT,
    "cep" TEXT,
    "salaryYear" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "statusLead" TEXT,
    "phone" TEXT,
    "maritalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lied_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lied_email_key" ON "Lied"("email");
