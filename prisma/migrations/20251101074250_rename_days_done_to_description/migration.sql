/*
  Warnings:

  - You are about to drop the column `daysDone` on the `doctorprofile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `doctorprofile` DROP COLUMN `daysDone`,
    ADD COLUMN `description` VARCHAR(191) NULL;
