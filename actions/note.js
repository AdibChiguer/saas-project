"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

export const createWorkLog = async (payload) => {
  try {
    const { clientId, jour, heureDebut, heureFin, lieu, modeTarif, prixUnitaire, notes, semaineRef } = payload;

    if (!clientId || !jour || !heureDebut || !heureFin || !modeTarif || !prixUnitaire) {
      return { status: 400, error: "Missing required fields" };
    }

    // Calcul des heures
    const start = new Date(`1970-01-01T${heureDebut}:00`);
    const end = new Date(`1970-01-01T${heureFin}:00`);
    let diff = (end - start) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // Handle overnight shift if any

    const heuresTotal = diff;
    const montant = modeTarif === "horaire" ? heuresTotal * prixUnitaire : prixUnitaire;

    const workLog = await prisma.workLog.create({
      data: {
        clientId,
        jour: new Date(jour),
        heureDebut,
        heureFin,
        heuresTotal,
        lieu,
        modeTarif,
        prixUnitaire,
        montant,
        notes,
        semaineRef,
      },
    });

    return { status: 201, data: workLog };
  } catch (error) {
    console.log("🔴 createWorkLog error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getWorkLogsBySemaine = async (semaineRef) => {
  try {
    const workLogs = await prisma.workLog.findMany({
      where: { semaineRef },
      include: { client: true },
      orderBy: { jour: "asc" },
    });
    return { status: 200, data: workLogs };
  } catch (error) {
    console.log("🔴 getWorkLogsBySemaine error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};
