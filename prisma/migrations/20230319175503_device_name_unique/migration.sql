/*
  Warnings:

  - A unique constraint covering the columns `[deviceName]` on the table `DeviceSessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeviceSessions_deviceName_key" ON "DeviceSessions"("deviceName");
