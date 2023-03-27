/*
  Warnings:

  - Made the column `bloggerUserId` on table `Blog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_bloggerUserId_fkey";

-- AlterTable
ALTER TABLE "Blog" ALTER COLUMN "bloggerUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_bloggerUserId_fkey" FOREIGN KEY ("bloggerUserId") REFERENCES "Blogger"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
