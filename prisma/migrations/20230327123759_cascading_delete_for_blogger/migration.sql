-- DropForeignKey
ALTER TABLE "Blogger" DROP CONSTRAINT "Blogger_bloggerId_fkey";

-- AddForeignKey
ALTER TABLE "Blogger" ADD CONSTRAINT "Blogger_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
