-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "logoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "heuresTotal" DOUBLE PRECISION NOT NULL,
    "lieu" TEXT,
    "modeTarif" TEXT NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "semaineRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Devis" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "semaineRef" TEXT NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'brouillon',
    "totalHt" DOUBLE PRECISION NOT NULL,
    "tauxTva" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "totalTva" DOUBLE PRECISION NOT NULL,
    "totalTtc" DOUBLE PRECISION NOT NULL,
    "fichierExcel" TEXT,
    "notes" TEXT,
    "envoyeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DevisLigne" (
    "id" TEXT NOT NULL,
    "devisId" TEXT NOT NULL,
    "workLogId" TEXT,
    "description" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "montantHt" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DevisLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facture" (
    "id" TEXT NOT NULL,
    "devisId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'generee',
    "totalHt" DOUBLE PRECISION NOT NULL,
    "tauxTva" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "totalTva" DOUBLE PRECISION NOT NULL,
    "totalTtc" DOUBLE PRECISION NOT NULL,
    "fichierPdf" TEXT,
    "envoyeAt" TIMESTAMP(3),
    "payeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parametre" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("cle")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Client_ownerId_idx" ON "public"."Client"("ownerId");

-- CreateIndex
CREATE INDEX "WorkLog_clientId_idx" ON "public"."WorkLog"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Devis_numero_key" ON "public"."Devis"("numero");

-- CreateIndex
CREATE INDEX "Devis_clientId_idx" ON "public"."Devis"("clientId");

-- CreateIndex
CREATE INDEX "DevisLigne_devisId_idx" ON "public"."DevisLigne"("devisId");

-- CreateIndex
CREATE INDEX "DevisLigne_workLogId_idx" ON "public"."DevisLigne"("workLogId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numero_key" ON "public"."Facture"("numero");

-- CreateIndex
CREATE INDEX "Facture_devisId_idx" ON "public"."Facture"("devisId");

-- CreateIndex
CREATE INDEX "Facture_clientId_idx" ON "public"."Facture"("clientId");

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLog" ADD CONSTRAINT "WorkLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Devis" ADD CONSTRAINT "Devis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DevisLigne" ADD CONSTRAINT "DevisLigne_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "public"."Devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DevisLigne" ADD CONSTRAINT "DevisLigne_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "public"."WorkLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facture" ADD CONSTRAINT "Facture_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "public"."Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facture" ADD CONSTRAINT "Facture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
