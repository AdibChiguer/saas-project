"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import nodemailer from "nodemailer";

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

export const generateDevisFromWeek = async (semaineRef) => {
  try {
    const { user } = await getOrCreateUser();

    // 1. Récupérer tous les worklogs de la semaine qui ne sont pas encore liés à un devis
    const workLogs = await prisma.workLog.findMany({
      where: {
        semaineRef,
        devisLignes: { none: {} },
        client: { ownerId: user.id }
      },
      include: { client: true }
    });

    if (workLogs.length === 0) {
      return { status: 404, error: "No work logs found for this week or already billed" };
    }

    // 2. Grouper par client
    const logsByClient = workLogs.reduce((acc, log) => {
      if (!acc[log.clientId]) acc[log.clientId] = [];
      acc[log.clientId].push(log);
      return acc;
    }, {});

    const generatedDevis = [];

    // 3. Créer un devis par client
    for (const [clientId, logs] of Object.entries(logsByClient)) {
      const client = logs[0].client;
      const totalHt = logs.reduce((sum, log) => sum + log.montant, 0);
      const tauxTva = 20.0; // Par défaut
      const totalTva = totalHt * (tauxTva / 100);
      const totalTtc = totalHt + totalTva;

      // Générer numéro de devis (simplifié pour l'instant)
      const count = await prisma.devis.count();
      const numero = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      const devis = await prisma.devis.create({
        data: {
          clientId,
          numero,
          semaineRef,
          dateEmission: new Date(),
          statut: "brouillon",
          totalHt,
          tauxTva,
          totalTva,
          totalTtc,
          lignes: {
            create: logs.map(log => ({
              workLogId: log.id,
              description: `${new Date(log.jour).toLocaleDateString('fr-FR')} - ${log.lieu || 'Travail'}`,
              quantite: log.heuresTotal,
              unite: log.modeTarif === "horaire" ? "heure" : "forfait",
              prixUnitaire: log.prixUnitaire,
              montantHt: log.montant
            }))
          }
        },
        include: { lignes: true, client: true }
      });

      generatedDevis.push(devis);
    }

    return { status: 201, data: generatedDevis };
  } catch (error) {
    console.log("🔴 generateDevisFromWeek error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const updateDevisStatus = async (devisId, statut) => {
  try {
    const devis = await prisma.devis.update({
      where: { id: devisId },
      data: { statut },
    });

    // Si accepté, générer automatiquement la facture
    if (statut === "accepte") {
      await generateFactureFromDevis(devisId);
    }

    return { status: 200, data: devis };
  } catch (error) {
    console.log("🔴 updateDevisStatus error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const generateFactureFromDevis = async (devisId) => {
  try {
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: { client: true }
    });

    if (!devis) return { status: 404, error: "Devis not found" };

    const count = await prisma.facture.count();
    const numero = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const dateEmission = new Date();
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEmission.getDate() + 30); // 30 jours par défaut

    const facture = await prisma.facture.create({
      data: {
        devisId,
        clientId: devis.clientId,
        numero,
        dateEmission,
        dateEcheance,
        statut: "generee",
        totalHt: devis.totalHt,
        tauxTva: devis.tauxTva,
        totalTva: devis.totalTva,
        totalTtc: devis.totalTtc,
      }
    });

    return { status: 201, data: facture };
  } catch (error) {
    console.log("🔴 generateFactureFromDevis error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

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

export const getAllDevis = async (semaineRef) => {
  try {
    const devis = await prisma.devis.findMany({
      where: semaineRef ? { semaineRef } : {},
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
