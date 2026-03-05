import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.accountType === "business") {
    redirect("/dashboard/business")
  }

  redirect("/dashboard/client")
}