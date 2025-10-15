-- DropForeignKey
ALTER TABLE `visitservice` DROP FOREIGN KEY `VisitService_serviceId_fkey`;

-- DropIndex
-- DROP INDEX `VisitService_visitId_serviceId_key` ON `visitservice`;

-- AlterTable
ALTER TABLE `visit` MODIFY `price` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `visitservice` ADD COLUMN `customName` VARCHAR(191) NULL,
    ADD COLUMN `customPrice` DECIMAL(10, 2) NULL,
    MODIFY `serviceId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `VisitService_visitId_idx` ON `VisitService`(`visitId`);

-- AddForeignKey
ALTER TABLE `VisitService` ADD CONSTRAINT `VisitService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `visit` RENAME INDEX `Visit_createdByUserId_fkey` TO `Visit_createdByUserId_idx`;

-- RenameIndex
ALTER TABLE `visit` RENAME INDEX `Visit_doctorId_fkey` TO `Visit_doctorId_idx`;

-- RenameIndex
ALTER TABLE `visitservice` RENAME INDEX `VisitService_serviceId_fkey` TO `VisitService_serviceId_idx`;
