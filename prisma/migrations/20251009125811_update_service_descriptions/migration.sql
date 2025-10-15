-- DropIndex
DROP INDEX `VisitService_visitId_serviceId_key` ON `visitservice`;

-- AlterTable
ALTER TABLE `service` MODIFY `description` TEXT NULL,
    MODIFY `highlightDescription` TEXT NULL;
