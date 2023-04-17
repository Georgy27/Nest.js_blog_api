-- CreateTable
CREATE TABLE "PostLikeStatus" (
    "id" TEXT NOT NULL,
    "likeStatus" "LikeStatus" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostLikeStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostLikeStatus" ADD CONSTRAINT "PostLikeStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikeStatus" ADD CONSTRAINT "PostLikeStatus_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
