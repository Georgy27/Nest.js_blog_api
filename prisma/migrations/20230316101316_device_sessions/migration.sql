-- CreateTable
CREATE TABLE "DeviceSessions" (
    "id" SERIAL NOT NULL,
    "deviceName" TEXT NOT NULL,
    "lastActiveDate" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DeviceSessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSessions_userId_key" ON "DeviceSessions"("userId");

-- AddForeignKey
ALTER TABLE "DeviceSessions" ADD CONSTRAINT "DeviceSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
