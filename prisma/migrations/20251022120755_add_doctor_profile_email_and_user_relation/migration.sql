/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `doctorprofile` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otpExpiry` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `passwordHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `DoctorProfile_email_key` ON `DoctorProfile`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `DoctorProfile_userId_key` ON `DoctorProfile`(`userId`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_isActive_idx` ON `User`(`isActive`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorProfile` ADD CONSTRAINT `DoctorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
