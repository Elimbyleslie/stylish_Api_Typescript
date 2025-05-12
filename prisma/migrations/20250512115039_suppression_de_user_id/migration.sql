/*
  Warnings:

  - You are about to drop the column `userId` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_userId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_userId_fkey`;

-- DropIndex
DROP INDEX `Category_userId_fkey` ON `category`;

-- DropIndex
DROP INDEX `Product_userId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `userId`;
