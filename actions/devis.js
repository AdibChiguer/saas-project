"use server";
// lib/devis/actions.js

import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import { buildDevisHtml } from "@/lib/buildDevisHtml";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// getClients()
// ─────────────────────────────────────────────────────────────────
export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      select: { id: true, nom: true, email: true },
      orderBy: { nom: "asc" },
    });
    return { data: clients, error: null };
  } catch (err) {
    console.error("[getClients]", err);
    return { data: null, error: "Impossible de charger les clients." };
  } finally {
    await prisma.$disconnect();
  }
}

// ─────────────────────────────────────────────────────────────────
// searchDevis({ clientId, semaineRef })
// ─────────────────────────────────────────────────────────────────
export async function searchDevis({ clientId, semaineRef }) {
  if (!clientId || !semaineRef) {
    return { data: null, error: "clientId et semaineRef sont requis." };
  }

  try {
    const devisList = await prisma.devis.findMany({
      where: { clientId, semaineRef },
      select: {
        id: true,
        numero: true,
        semaineRef: true,
        statut: true,
        total: true,
        dateEmission: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: devisList, error: null };
  } catch (err) {
    console.error("[searchDevis]", err);
    return { data: null, error: "Erreur lors de la recherche." };
  } finally {
    await prisma.$disconnect();
  }
}

// ─────────────────────────────────────────────────────────────────
// generateDevisPDF({ devisNumero?, semaineRef?, clientId? })
// ─────────────────────────────────────────────────────────────────
export async function generateDevisPDF({ devisNumero, semaineRef, clientId }) {
  if (!devisNumero && (!semaineRef || !clientId)) {
    return {
      data: null,
      error: "Fournissez devisNumero ou bien semaineRef + clientId.",
    };
  }

  try {
    // ── 1. Company settings ──────────────────────────────────────
    const parametres = await prisma.parametre.findMany();
    const param = Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]));

    // ── 2. Fetch Devis — include client + owner (User) ───────────
    const devis = devisNumero
      ? await prisma.devis.findUnique({
          where: { numero: devisNumero },
          include: {
            client: { include: { owner: true } },   // ← owner fetched here
            lignes: { include: { workLog: true } },
          },
        })
      : await prisma.devis.findFirst({
          where: { semaineRef, clientId },
          orderBy: { createdAt: "desc" },
          include: {
            client: { include: { owner: true } },   // ← owner fetched here
            lignes: { include: { workLog: true } },
          },
        });

    if (!devis) {
      return { data: null, error: "Devis introuvable." };
    }

    // ── 3. User is available directly via devis.client.owner ─────
    const user = devis.client.owner;

    // ── 4. WorkLogs for schedule grid ────────────────────────────
    const workLogs = await prisma.workLog.findMany({
      where: { clientId: devis.clientId, semaineRef: devis.semaineRef },
      include: {
        client: { include: { owner: true } },
      },
      orderBy: { startAt: "asc" },
    });

    // ── 5. Build HTML ─────────────────────────────────────────────
    const html = buildDevisHtml({ devis, workLogs, param, user });

    // ── 6. Puppeteer → PDF ───────────────────────────────────────
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });

    await browser.close();

    // ── 7. Return as base64 ───────────────────────────────────────
    const base64 = Buffer.from(pdfBuffer).toString("base64");
    const filename = `devis_${devis.numero}_${devis.semaineRef}.pdf`;

    return { data: base64, filename, error: null };
  } catch (err) {
    console.error("[generateDevisPDF]", err);
    return { data: null, error: "Erreur lors de la génération du PDF." };
  } finally {
    await prisma.$disconnect();
  }
}