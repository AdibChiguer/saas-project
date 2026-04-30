"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

export const createWorkLog = async (payload) => {
  try {
    const {
      clientId, startAt, endAt, lieu, modeTarif,
      prixUnitaire, notes, semaineRef,
      codes,
    } = payload;

    if (!clientId || !startAt || !endAt || !modeTarif || !prixUnitaire) {
      return { status: 400, error: "Missing required fields" };
    }

    const startDate = new Date(startAt);
    const endDate   = new Date(endAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { status: 400, error: "Invalid datetime" };
    }
    if (endDate <= startDate) {
      return { status: 400, error: "End datetime must be after start datetime" };
    }

    const heuresTotal = (endDate - startDate) / (1000 * 60 * 60);
    const montant     = modeTarif === "horaire" ? heuresTotal * prixUnitaire : prixUnitaire;

    const workLog = await prisma.workLog.create({
      data: {
        client: { connect: { id: clientId } },
        startAt: startDate,
        endAt:   endDate,
        heuresTotal,
        lieu,
        modeTarif,
        prixUnitaire,
        montant,
        notes,
        semaineRef,
        codes: codes || "",
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
    const res = await getOrCreateUser();
    if (res.status !== 200) {
      return res;
    }
    const user = res.user;

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
    const endOfMonth   = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyLogs = await prisma.workLog.findMany({
      where: {
        AND: [
          { startAt: { lte: endOfMonth } },
          { endAt:   { gte: startOfMonth } },
        ],
        client: { ownerId: user.id },
      },
      include: { client: true },
      orderBy: { startAt: "asc" },
    });

    return { status: 200, data: { weekly: weeklyLogs, monthly: monthlyLogs } };
  } catch (error) {
    console.log("🔴 getDashboardStats error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const updateWorkLog = async (id, payload) => {
  try {
    const { startAt, endAt, lieu, modeTarif, prixUnitaire, notes, codes } = payload;
    
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    const heuresTotal = (endDate - startDate) / (1000 * 60 * 60);
    const montant = modeTarif === "horaire" ? heuresTotal * prixUnitaire : prixUnitaire;

    const workLog = await prisma.workLog.update({
      where: { id },
      data: {
        startAt: startDate,
        endAt: endDate,
        heuresTotal,
        lieu,
        modeTarif,
        prixUnitaire,
        montant,
        notes,
        codes,
      },
    });
    return { status: 200, data: workLog };
  } catch (error) {
    console.log("🔴 updateWorkLog error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const deleteWorkLog = async (id) => {
  try {
    await prisma.workLog.delete({
      where: { id },
    });
    return { status: 200, message: "Log supprimé" };
  } catch (error) {
    console.log("🔴 deleteWorkLog error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getWorkLogById = async (id) => {
  try {
    const workLog = await prisma.workLog.findUnique({
      where: { id },
      include: { client: true },
    });
    return { status: 200, data: workLog };
  } catch (error) {
    console.log("🔴 getWorkLogById error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};
