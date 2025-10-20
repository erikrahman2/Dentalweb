/*
  Warnings:

  - You are about to drop the column `ctaLink` on the `homepagecontent` table. All the data in the column will be lost.
  - You are about to drop the column `ctaText` on the `homepagecontent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `homepagecontent` DROP COLUMN `ctaLink`,
    DROP COLUMN `ctaText`;
