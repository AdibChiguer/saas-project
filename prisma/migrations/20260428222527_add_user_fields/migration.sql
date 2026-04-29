/*
  Warnings:

  - You are about to drop the column `tauxTva` on the `Devis` table. All the data in the column will be lost.
  - You are about to drop the column `totalHt` on the `Devis` table. All the data in the column will be lost.
  - You are about to drop the column `totalTtc` on the `Devis` table. All the data in the column will be lost.
  - You are about to drop the column `totalTva` on the `Devis` table. All the data in the column will be lost.
  - Added the required column `total` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condes` to the `DevisLigne` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Sofinummer` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adresse` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Devis" DROP COLUMN "tauxTva",
DROP COLUMN "totalHt",
DROP COLUMN "totalTtc",
DROP COLUMN "totalTva",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."DevisLigne" ADD COLUMN     "condes" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "Sofinummer" TEXT NOT NULL,
ADD COLUMN     "adresse" TEXT NOT NULL,
ADD COLUMN     "kvknr" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "telephone" TEXT NOT NULL;
