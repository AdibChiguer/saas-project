import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const getOrCreateUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      // Fallback: si pas de session (mode démo/dev), on prend le premier admin ou on le crée
      let user = await prisma.user.findFirst({
        where: { email: "admin@example.com" }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "admin@example.com",
            name: "Admin User",
            Sofinummer: "000000000",
            telephone: "0000000000",
            adresse: "Default Address",
          },
        });
      }
      return { status: 200, user };
    }

    // Si session active, on récupère les vraies infos de l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { status: 404, error: "Utilisateur de session non trouvé en base" };
    }

    return { status: 200, user };
  } catch (error) {
    console.error("🔴 getOrCreateUser error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
}
