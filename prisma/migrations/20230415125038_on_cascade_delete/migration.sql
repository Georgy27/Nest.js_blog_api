-- DropForeignKey
ALTER TABLE "BannedUsers" DROP CONSTRAINT "BannedUsers_blogId_fkey";

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
