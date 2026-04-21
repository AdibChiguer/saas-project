"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

export const createWorkLog = async (payload) => {
  try {
    const { clientId, startAt, endAt, lieu, modeTarif, prixUnitaire, notes, semaineRef } = payload;

    if (!clientId || !startAt || !endAt || !modeTarif || !prixUnitaire) {
      return { status: 400, error: "Missing required fields" };
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { status: 400, error: "Invalid datetime" };
    }

    if (endDate <= startDate) {
      return { status: 400, error: "End datetime must be after start datetime" };
    }

    const diff = (endDate - startDate) / (1000 * 60 * 60);

    const heuresTotal = diff;
    const montant = modeTarif === "horaire" ? heuresTotal * prixUnitaire : prixUnitaire;

    const workLog = await prisma.workLog.create({
      data: {
        clientId,
        startAt: startDate,
        endAt: endDate,
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
      orderBy: { startAt: "asc" },
    });
    return { status: 200, data: workLogs };
  } catch (error) {
    console.log("🔴 getWorkLogsBySemaine error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getDashboardStats = async (semaineRef, monthDate) => {
  try {
    const { user } = await getOrCreateUser();

    const month = new Date(monthDate);
    if (Number.isNaN(month.getTime())) {
      return { status: 400, error: "Invalid month date" };
    }

    const weeklyLogs = await prisma.workLog.findMany({
      where: {
        semaineRef,
        client: { ownerId: user.id },
      },
      include: { client: true },
      orderBy: { startAt: "asc" },
    });

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyLogs = await prisma.workLog.findMany({
      where: {
        AND: [
          { startAt: { lte: endOfMonth } },
          { endAt: { gte: startOfMonth } },
        ],
        client: { ownerId: user.id },
      },
      include: { client: true },
      orderBy: { startAt: "asc" },
    });

    return {
      status: 200,
      data: {
        weekly: weeklyLogs,
        monthly: monthlyLogs,
      },
    };
  } catch (error) {
    console.log("🔴 getDashboardStats error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const updateWorkLog = async (id, data) => {
  try {
    const { user } = await getOrCreateUser();

    const workLog = await prisma.workLog.findFirst({
      where: { id, client: { ownerId: user.id } },
    });

    if (!workLog) return { status: 404, error: "Work log not found" };

    // Recalculate heuresTotal and montant if times changed
    let heuresTotal = workLog.heuresTotal;
    let montant     = workLog.montant;

    const startAt = data.startAt ? new Date(data.startAt) : workLog.startAt;
    const endAt   = data.endAt   ? new Date(data.endAt)   : workLog.endAt;

    if (data.startAt || data.endAt) {
      heuresTotal = (endAt - startAt) / (1000 * 60 * 60);
    }

    const prixUnitaire = data.prixUnitaire !== undefined
      ? parseFloat(data.prixUnitaire)
      : workLog.prixUnitaire;

    const modeTarif = data.modeTarif || workLog.modeTarif;

    if (modeTarif === "horaire") {
      montant = heuresTotal * prixUnitaire;
    } else {
      // forfait: montant = prixUnitaire directly
      montant = prixUnitaire;
    }

    const updated = await prisma.workLog.update({
      where: { id },
      data: {
        startAt,
        endAt,
        heuresTotal,
        montant,
        prixUnitaire,
        modeTarif,
        lieu:      data.lieu      !== undefined ? data.lieu      : workLog.lieu,
        notes:     data.notes     !== undefined ? data.notes     : workLog.notes,
        semaineRef: data.semaineRef || workLog.semaineRef,
      },
      include: { client: true },
    });

    return { status: 200, data: updated };
  } catch (error) {
    console.log("🔴 updateWorkLog error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const deleteWorkLog = async (id) => {
  try {
    const { user } = await getOrCreateUser();

    const workLog = await prisma.workLog.findFirst({
      where: { id, client: { ownerId: user.id } },
    });

    if (!workLog) return { status: 404, error: "Work log not found" };

    await prisma.workLog.delete({ where: { id } });

    return { status: 200 };
  } catch (error) {
    console.log("🔴 deleteWorkLog error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};