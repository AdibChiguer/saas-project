"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { generateReportXLSX } from "@/lib/generateRapport";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, text, attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Mon Application" <noreply@example.com>',
      to,
      subject,
      text,
      attachments,
    });
    return { status: 200, message: "Email envoyé" };
  } catch (error) {
    console.error("🔴 sendEmail error:", error);
    return { status: 500, error: "Erreur lors de l'envoi de l'email" };
  }
};

// ── helper: build DevisLigne create payload from a WorkLog ───────────────────
// Uses `workLog: { connect: { id } }` — Prisma requires the relation object
// syntax (not bare `workLogId`) when creating nested records via `create`.
function ligneFromLog(log) {
  return {
    workLog:      { connect: { id: log.id } },
    codes:        log.codes || null,
    description:  `${new Date(log.startAt).toLocaleDateString("fr-FR")} - ${log.lieu || "Travail"}`,
    quantite:     log.heuresTotal,
    unite:        log.modeTarif === "horaire" ? "heure" : "forfait",
    prixUnitaire: log.prixUnitaire,
    montantHt:    log.montant,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export const generateDevisFromWeek = async (semaineRef) => {
  console.log("semaineRef:", semaineRef);
  try {
    const { user } = await getOrCreateUser();

    // 1. Get all worklogs for the week not yet linked to a devis ligne
    const workLogs = await prisma.workLog.findMany({
      where: {
        semaineRef,
        devisLignes: { none: {} },
        client: { ownerId: user.id },
      },
      include: { client: true },
    });

    if (workLogs.length === 0) {
      return {
        status: 200,
        data: [],
        message: "No new work logs to invoice for this week.",
      };
    }

    // 2. Group by client
    const logsByClient = workLogs.reduce((acc, log) => {
      if (!acc[log.clientId]) acc[log.clientId] = [];
      acc[log.clientId].push(log);
      return acc;
    }, {});

    const generatedDevis = [];

    // 3. Create or update one devis per client
    for (const [clientId, logs] of Object.entries(logsByClient)) {
      let devis = await prisma.devis.findFirst({
        where: { clientId, semaineRef },
        include: { lignes: true, client: true },
      });

      if (devis) {
        // ── Update existing devis ──────────────────────────────────
        const extraTotal = logs.reduce((sum, log) => sum + log.montant, 0);

        devis = await prisma.devis.update({
          where: { id: devis.id },
          data: {
            total:  { increment: extraTotal },
            lignes: { create: logs.map(ligneFromLog) },
          },
          include: { lignes: true, client: true },
        });

      } else {
        // ── Create new devis ───────────────────────────────────────
        const total  = logs.reduce((sum, log) => sum + log.montant, 0);
        const count  = await prisma.devis.count();
        const numero = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

        devis = await prisma.devis.create({
          data: {
            clientId,
            numero,
            semaineRef,
            dateEmission: new Date(),
            statut:       "brouillon",
            total,
            lignes: { create: logs.map(ligneFromLog) },
          },
          include: { lignes: true, client: true },
        });
      }

      // 4. Generate Excel report
      const client = devis.client;

      const workerDays = { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null };
      const dayMap     = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      logs.forEach((log) => {
        const day = dayMap[new Date(log.startAt).getDay()];
        workerDays[day] = (workerDays[day] || 0) + log.heuresTotal;
      });

      const reportData = {
        company: {
          name:              client.nom,
          address:           client.adresse   || "",
          city:              "",
          phone:             client.telephone || "",
          email:             client.email     || "",
          chamberOfCommerce: "",
        },
        year:          new Date().getFullYear(),
        weekNumber:    semaineRef,
        contactPerson: client.nom,
        lines: devis.lignes.map((ligne) => ({
          code:        ligne.codes || "",
          description: ligne.description,
          unit:        ligne.unite,
          unitPrice:   ligne.prixUnitaire,
          quantity:    ligne.quantite,
        })),
        workers: [{ name: client.nom, ssn: "", ...workerDays }],
      };

      const wb = generateReportXLSX(reportData);

      const reportsDir = path.join(process.cwd(), "public", "reports");
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

      const fileName  = `${devis.numero}-${semaineRef}.xlsx`;
      const filePath  = path.join(reportsDir, fileName);
      const publicUrl = `/reports/${fileName}`;
      XLSX.writeFile(wb, filePath);

      await prisma.devis.update({
        where: { id: devis.id },
        data:  { fichierExcel: publicUrl },
      });

      devis.fichierExcel = publicUrl;
      generatedDevis.push(devis);
    }

    return { status: 201, data: generatedDevis };
  } catch (error) {
    console.log("🔴 generateDevisFromWeek error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const updateDevisStatus = async (devisId, statut) => {
  try {
    const devis = await prisma.devis.update({
      where: { id: devisId },
      data:  { statut },
    });

    if (statut === "accepte") {
      await generateFactureFromDevis(devisId);
    }

    return { status: 200, data: devis };
  } catch (error) {
    console.log("🔴 updateDevisStatus error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const generateFactureFromDevis = async (devisId) => {
  try {
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: { client: true },
    });
    if (!devis) return { status: 404, error: "Devis not found" };

    // devis.total is treated as HT — derive TVA/TTC
    const tauxTva  = 20.0;
    const totalHt  = devis.total;
    const totalTva = totalHt * (tauxTva / 100);
    const totalTtc = totalHt + totalTva;

    const count        = await prisma.facture.count();
    const numero       = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const dateEmission = new Date();
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEmission.getDate() + 30);

    const facture = await prisma.facture.create({
      data: {
        devisId,
        clientId:     devis.clientId,
        numero,
        dateEmission,
        dateEcheance,
        statut:       "generee",
        totalHt,
        tauxTva,
        totalTva,
        totalTtc,
      },
    });

    return { status: 201, data: facture };
  } catch (error) {
    console.log("🔴 generateFactureFromDevis error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export const getAllFactures = async () => {
  try {
    const factures = await prisma.facture.findMany({
      include: { client: true },
      orderBy: { dateEmission: "desc" },
    });
    return { status: 200, data: factures };
  } catch (error) {
    console.log("🔴 getAllFactures error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getAllDevis = async (filters = {}) => {
  try {
    const { semaineRef, clientId } = filters;
    const where = {};
    if (semaineRef) where.semaineRef = semaineRef;
    if (clientId)   where.clientId   = clientId;

    const devis = await prisma.devis.findMany({
      where,
      include: { client: true, lignes: true },
      orderBy: { createdAt: "desc" },
    });
    return { status: 200, data: devis };
  } catch (error) {
    console.log("🔴 getAllDevis error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getFactureById = async (id) => {
  try {
    const facture = await prisma.facture.findUnique({
      where: { id },
      include: { client: true, devis: { include: { lignes: true } } },
    });
    return { status: 200, data: facture };
  } catch (error) {
    console.log("🔴 getFactureById error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};