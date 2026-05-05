import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

/**
 * Récupère l'utilisateur actuellement connecté ou renvoie une erreur.
 * Sécurise l'accès aux données en forçant une session valide.
 */
export const getOrCreateUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return { status: 401, error: "Non authentifié. Veuillez vous connecter." };
    }

    // Récupération des infos complètes de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Optionnel : Création automatique si l'utilisateur existe dans NextAuth mais pas en base
      // Pour l'instant, on renvoie une erreur pour plus de sécurité.
      return { status: 404, error: "Profil utilisateur introuvable." };
    }

    return { status: 200, user };
  } catch (error) {
    console.error("🔴 getOrCreateUser error:", error);
    return { status: 500, error: "Erreur serveur interne." };
  }
}
