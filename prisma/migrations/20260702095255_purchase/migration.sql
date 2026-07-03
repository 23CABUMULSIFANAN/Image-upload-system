/*
  Warnings:

  - You are about to drop the column `slotPurchased` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `slotsPurchased` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "slotPurchased",
ADD COLUMN     "slotsPurchased" INTEGER NOT NULL;
