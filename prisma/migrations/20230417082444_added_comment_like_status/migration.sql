-- CreateEnum
CREATE TYPE "LikeStatus" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "CommentLikeStatus" (
    "id" TEXT NOT NULL,
    "likeStatus" "LikeStatus" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentLikeStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentLikeStatus" ADD CONSTRAINT "CommentLikeStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLikeStatus" ADD CONSTRAINT "CommentLikeStatus_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
