import { auth } from "@/auth"

export async function requireAdmin() {
  const session = await auth()

  if (!session?.user?.email) {
    return { type: "unauthorized" as const }
  }

  const adminsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ""
  const adminList = adminsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const email = session.user.email.toLowerCase()

  if (!adminList.includes(email)) {
    return { type: "forbidden" as const }
  }

  return { type: "ok" as const, session }
}
