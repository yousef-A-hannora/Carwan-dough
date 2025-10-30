/*
  Warnings:

  - You are about to drop the `worddays` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isActive` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` ADD COLUMN `isActive` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `isActive` BOOLEAN NOT NULL;

-- DropTable
DROP TABLE `worddays`;

-- CreateTable
CREATE TABLE `workDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workingDays` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sid_key`(`sid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
