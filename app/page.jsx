import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to login page for authentication
  redirect("/auth/login")
}
