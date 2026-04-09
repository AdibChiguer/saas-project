"use server";

import { prisma } from "@/lib/prisma";

export const createNote = async (payload) => {
  try {
    const { clientId, description, date, weekNumber, items } = payload;

    if (!clientId) {
      return { status: 400, error: "clientId is required" };
    }

    if (!items || items.length === 0) {
      return { status: 400, error: "At least one item required" };
    }

    // SECURITY: ensure client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        ownerId: checkUser.id,
      },
    });

    if (!client) {
      return { status: 404, error: "Client not found" };
    }

    const note = await prisma.note.create({
      data: {
        description,
        date: new Date(date),
        weekNumber,
        ownerId: checkUser.id,
        clientId,
        items: {
          create: items.map((item) => ({
            code: item.code,
            description: item.description,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalUnits: item.totalUnits,
            totalUnitPrice: item.totalUnitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
        client: true,
      },
    });

    return { status: 201, data: note };
  } catch (error) {
    console.log("🔴 createNote error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};
