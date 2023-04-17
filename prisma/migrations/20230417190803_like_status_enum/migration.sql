/*
  Warnings:

  - The values [like,dislike] on the enum `LikeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LikeStatus_new" AS ENUM ('Like', 'Dislike');
ALTER TABLE "CommentLikeStatus" ALTER COLUMN "likeStatus" TYPE "LikeStatus_new" USING ("likeStatus"::text::"LikeStatus_new");
ALTER TABLE "PostLikeStatus" ALTER COLUMN "likeStatus" TYPE "LikeStatus_new" USING ("likeStatus"::text::"LikeStatus_new");
ALTER TYPE "LikeStatus" RENAME TO "LikeStatus_old";
ALTER TYPE "LikeStatus_new" RENAME TO "LikeStatus";
DROP TYPE "LikeStatus_old";
COMMIT;
