import { prisma } from "@/lib/prisma"

export const getOrCreateUser = async () => {
  try {
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@example.com",
        },
      });
    }

    return { status: 200, user };
  } catch (error) {
    console.error("🔴 getOrCreateUser error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
}
