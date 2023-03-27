/*
  Warnings:

  - You are about to drop the column `userId` on the `Blog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_userId_fkey";

-- AlterTable
ALTER TABLE "BannedBlogs" ALTER COLUMN "banDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "userId",
ADD COLUMN     "bloggerUserId" TEXT;

-- CreateTable
CREATE TABLE "Blogger" (
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BannedUsers" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "isBanned" BOOLEAN NOT NULL,
    "banDate" TEXT NOT NULL,
    "banReason" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "bloggerUserId" TEXT,
    "userId" TEXT,

    CONSTRAINT "BannedUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blogger_userId_key" ON "Blogger"("userId");

-- AddForeignKey
ALTER TABLE "Blogger" ADD CONSTRAINT "Blogger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_bloggerUserId_fkey" FOREIGN KEY ("bloggerUserId") REFERENCES "Blogger"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_bloggerUserId_fkey" FOREIGN KEY ("bloggerUserId") REFERENCES "Blogger"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
