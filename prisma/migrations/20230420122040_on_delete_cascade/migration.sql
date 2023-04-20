-- DropForeignKey
ALTER TABLE "PostLikeStatus" DROP CONSTRAINT "PostLikeStatus_postId_fkey";

-- AddForeignKey
ALTER TABLE "PostLikeStatus" ADD CONSTRAINT "PostLikeStatus_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
