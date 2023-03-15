-- DropForeignKey
ALTER TABLE "EmailConfirmation" DROP CONSTRAINT "EmailConfirmation_userEmail_fkey";

-- DropForeignKey
ALTER TABLE "PasswordRecovery" DROP CONSTRAINT "PasswordRecovery_userId_fkey";

-- AddForeignKey
ALTER TABLE "PasswordRecovery" ADD CONSTRAINT "PasswordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfirmation" ADD CONSTRAINT "EmailConfirmation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
