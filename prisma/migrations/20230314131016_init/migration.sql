-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordRecovery" (
    "id" SERIAL NOT NULL,
    "recoveryCode" TEXT,
    "expirationDate" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailConfirmation" (
    "id" SERIAL NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "expirationDate" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "EmailConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanInfo" (
    "id" SERIAL NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banDate" TEXT,
    "banReason" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BanInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecovery_userId_key" ON "PasswordRecovery"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmation_userEmail_key" ON "EmailConfirmation"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "BanInfo_userId_key" ON "BanInfo"("userId");

-- AddForeignKey
ALTER TABLE "PasswordRecovery" ADD CONSTRAINT "PasswordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfirmation" ADD CONSTRAINT "EmailConfirmation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanInfo" ADD CONSTRAINT "BanInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
