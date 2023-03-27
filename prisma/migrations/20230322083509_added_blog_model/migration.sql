-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "isMembership" BOOLEAN NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
