"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

export const getAllClients = async () => {
  try {
    const res = await getOrCreateUser();
    if (res.status !== 200) {
      return res;
    }
    const user = res.user;
    
    const clients = await prisma.client.findMany({
      where: {
        ownerId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { status: 200, data: clients };
  } catch (error) {
    console.log("🔴 getAllClients error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const createClient = async (payload) => {
  try {
    const { nom, email, telephone, adresse, kvknr, btwnr } = payload;

    if (!nom || !email) {
      return { status: 400, error: "Nom and email are required" };
    }

    const res = await getOrCreateUser();
    if (res.status !== 200) {
      return res;
    }
    const user = res.user;

    const client = await prisma.client.create({
      data: {
        nom,
        email,
        telephone,
        adresse,
        kvknr,
        btwnr,
        ownerId: user.id,
      },
    });

    return { status: 201, data: client };
  } catch (error) {
    console.log("🔴 createClient error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const updateClient = async (id, payload) => {
  try {
    const res = await getOrCreateUser();
    if (res.status !== 200) return res;
    const user = res.user;

    const { nom, email, telephone, adresse, kvknr, btwnr } = payload;

    // Vérification de l'existence et de l'appartenance
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient || existingClient.ownerId !== user.id) {
      return { status: 403, error: "Accès refusé. Vous n'êtes pas le propriétaire de ce client." };
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        nom,
        email,
        telephone,
        adresse,
        kvknr,
        btwnr,
      },
    });

    return { status: 200, data: client };
  } catch (error) {
    console.log("🔴 updateClient error:", error);
    return { status: 500, error: "Erreur lors de la mise à jour." };
  }
};

export const deleteClient = async (id) => {
  try {
    const res = await getOrCreateUser();
    if (res.status !== 200) return res;
    const user = res.user;

    // Vérification de l'appartenance avant suppression
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient || existingClient.ownerId !== user.id) {
      return { status: 403, error: "Accès refusé." };
    }

    await prisma.client.delete({
      where: { id },
    });
    return { status: 200, message: "Client supprimé avec succès." };
  } catch (error) {
    console.log("🔴 deleteClient error:", error);
    return { status: 500, error: "Erreur lors de la suppression." };
  }
};
