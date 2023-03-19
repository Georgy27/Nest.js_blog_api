/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `DeviceSessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeviceSessions_deviceId_key" ON "DeviceSessions"("deviceId");
