"use server";
// lib/devis/actions.js

import { prisma } from "@/lib/prisma";
import { buildDevisHtml } from "@/lib/buildDevisHtml";
import { buildFactureHtml } from "@/lib/buildFactureHtml";
import { getOrCreateUser } from "./user";

// Configuration Puppeteer pour Vercel
const getBrowser = async () => {
  if (process.env.VERCEL) {
    const chromium = require("@sparticuz/chromium");
    const puppeteer = require("puppeteer-core");
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    const puppeteer = require("puppeteer");
    return await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
};

// ─────────────────────────────────────────────────────────────────
// getClients()
// ─────────────────────────────────────────────────────────────────
export async function getClients() {
  try {
    const res = await getOrCreateUser();
    if (res.status !== 200) return res;
    const user = res.user;

    const clients = await prisma.client.findMany({
      where: { ownerId: user.id },
      select: { id: true, nom: true, email: true },
      orderBy: { nom: "asc" },
    });
    return { data: clients, error: null };
  } catch (err) {
    console.error("[getClients]", err);
    return { data: null, error: "Impossible de charger les clients." };
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
    const res = await getOrCreateUser();
    if (res.status !== 200) return { data: null, error: res.error };
    const user = res.user;

    const devisList = await prisma.devis.findMany({
      where: { 
        clientId, 
        semaineRef,
        client: { ownerId: user.id }
      },
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
  }
}

// ─────────────────────────────────────────────────────────────────
// generateDevisPDF({ devisNumero?, semaineRef?, clientId?, locale? })
// ─────────────────────────────────────────────────────────────────
export async function generateDevisPDF({ devisNumero, semaineRef, clientId, locale = "fr" }) {
  if (!devisNumero && (!semaineRef || !clientId)) {
    return {
      data: null,
      error: "Fournissez devisNumero ou bien semaineRef + clientId.",
    };
  }

  try {
    const authRes = await getOrCreateUser();
    if (authRes.status !== 200) return { data: null, error: authRes.error };
    const currentUser = authRes.user;

    // ── 1. Company settings ──────────────────────────────────────
    const parametres = await prisma.parametre.findMany();
    const param = Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]));

    // ── 2. Fetch Devis — include client + owner (User) ───────────
    const devis = devisNumero
      ? await prisma.devis.findUnique({
          where: { numero: devisNumero },
          include: {
            client: { include: { owner: true } },
            lignes: { include: { workLog: true } },
          },
        })
      : await prisma.devis.findFirst({
          where: { 
            semaineRef, 
            clientId,
            client: { ownerId: currentUser.id }
          },
          orderBy: { createdAt: "desc" },
          include: {
            client: { include: { owner: true } },
            lignes: { include: { workLog: true } },
          },
        });

    if (!devis || devis.client.ownerId !== currentUser.id) {
      return { data: null, error: "Devis introuvable ou accès refusé." };
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
    const html = buildDevisHtml({ devis, workLogs, param, user, locale });

    // ── 6. Puppeteer → PDF ───────────────────────────────────────
    const browser = await getBrowser();

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
  }
}

export async function generateFacturePDF({ factureId, factureNumero, locale = "fr" }) {
  if (!factureId && !factureNumero) {
    return { data: null, error: "Fournissez factureId ou factureNumero." };
  }
 
  try {
    const authRes = await getOrCreateUser();
    if (authRes.status !== 200) return { data: null, error: authRes.error };
    const currentUser = authRes.user;

    // ── 1. Parametre table ──
    const parametres = await prisma.parametre.findMany();
    const param = Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]));
 
    // ── 2. Fetch Facture ──
    const whereClause = factureId
      ? { id: factureId }
      : { numero: factureNumero };
 
    const facture = await prisma.facture.findUnique({
      where: whereClause,
      include: {
        client: { include: { owner: true } },
        devis: {
          include: {
            lignes: { include: { workLog: true } },
          },
        },
      },
    });
 
    if (!facture || facture.client.ownerId !== currentUser.id) {
      return { data: null, error: "Facture introuvable ou accès refusé." };
    }
 
    // ── 3. Build HTML ──
    const html = buildFactureHtml({ facture, param, locale });
 
    // ── 4. Render PDF ──
    const browser = await getBrowser();
 
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
 
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });
 
    await browser.close();
 
    const base64   = Buffer.from(pdfBuffer).toString("base64");
    const filename = `facture_${facture.numero}.pdf`;
 
    return { data: base64, filename, error: null };
  } catch (err) {
    console.error("[generateFacturePDF]", err);
    return { data: null, error: "Erreur lors de la génération du PDF." };
  }
}