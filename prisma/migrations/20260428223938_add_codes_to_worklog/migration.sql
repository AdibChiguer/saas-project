/*
  Warnings:

  - You are about to drop the column `codes` on the `DevisLigne` table. All the data in the column will be lost.
  - Added the required column `codes` to the `WorkLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."DevisLigne" DROP COLUMN "codes";

-- AlterTable
ALTER TABLE "public"."WorkLog" ADD COLUMN     "codes" TEXT NOT NULL;
