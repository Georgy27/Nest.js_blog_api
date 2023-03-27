/*
  Warnings:

  - You are about to drop the column `bloggerUserId` on the `BannedUsers` table. All the data in the column will be lost.
  - You are about to drop the column `bloggerUserId` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Blogger` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bloggerId]` on the table `Blogger` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bloggerId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloggerId` to the `Blogger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BannedUsers" DROP CONSTRAINT "BannedUsers_bloggerUserId_fkey";

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_bloggerUserId_fkey";

-- DropForeignKey
ALTER TABLE "Blogger" DROP CONSTRAINT "Blogger_userId_fkey";

-- DropIndex
DROP INDEX "Blogger_userId_key";

-- AlterTable
ALTER TABLE "BannedUsers" DROP COLUMN "bloggerUserId",
ADD COLUMN     "bloggerId" TEXT;

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "bloggerUserId",
ADD COLUMN     "bloggerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Blogger" DROP COLUMN "userId",
ADD COLUMN     "bloggerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Blogger_bloggerId_key" ON "Blogger"("bloggerId");

-- AddForeignKey
ALTER TABLE "Blogger" ADD CONSTRAINT "Blogger_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedUsers" ADD CONSTRAINT "BannedUsers_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "Blogger"("bloggerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "Blogger"("bloggerId") ON DELETE RESTRICT ON UPDATE CASCADE;
