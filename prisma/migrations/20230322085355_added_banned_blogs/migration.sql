-- CreateTable
CREATE TABLE "BannedBlogs" (
    "id" SERIAL NOT NULL,
    "isBanned" BOOLEAN NOT NULL,
    "banDate" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,

    CONSTRAINT "BannedBlogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedBlogs_blogId_key" ON "BannedBlogs"("blogId");

-- AddForeignKey
ALTER TABLE "BannedBlogs" ADD CONSTRAINT "BannedBlogs_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
