// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"

// export const onAuthenticateUser = async () => {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) {
//       return { status: 403, error: "Unauthorized" }
//     }

//     const userExist = await prisma.user.findUnique({
//       where: { id: session.user.id },
//     })

//     if (!userExist) {
//       return { status: 404, error: "User not found" }
//     }

//     return { status: 200, user: userExist }
//   } catch (error) {
//     console.error("🔴 error:", error)
//     return { status: 500, error: "Internal Server Error" }
//   }
// }
