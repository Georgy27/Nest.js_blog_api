-- DropForeignKey
ALTER TABLE "BannedBlogs" DROP CONSTRAINT "BannedBlogs_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_bloggerId_fkey";

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_bloggerId_fkey" FOREIGN KEY ("bloggerId") REFERENCES "Blogger"("bloggerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedBlogs" ADD CONSTRAINT "BannedBlogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
