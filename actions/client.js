export const getAllClients = async () => {
  try {
    const clients = await prisma.client.findMany({
      where: {
        ownerId: checkUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (clients.length === 0) {
      return { status: 404, error: "No clients found" };
    }

    return { status: 200, data: clients };
  } catch (error) {
    console.log("🔴 getAllClients error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const createClient = async (payload) => {
  try {
    const { name, email, phone, logoUrl } = payload;

    if (!name) {
      return { status: 400, error: "Name is required" };
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        logoUrl,
        ownerId: checkUser.id,
      },
    });

    return { status: 201, data: client };
  } catch (error) {
    console.log("🔴 createClient error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};