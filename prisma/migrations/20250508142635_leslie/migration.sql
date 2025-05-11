/*
  Warnings:

  - Added the required column `amount` to the `Paiement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `paiement` ADD COLUMN `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `price` VARCHAR(191) NOT NULL;
