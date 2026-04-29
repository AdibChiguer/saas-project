/*
  Warnings:

  - You are about to drop the column `condes` on the `DevisLigne` table. All the data in the column will be lost.
  - Added the required column `codes` to the `DevisLigne` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DevisLigne" DROP COLUMN "condes",
ADD COLUMN     "codes" TEXT NOT NULL;
