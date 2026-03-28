"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { authService } from "@/modules/auth/services/auth.service"

export default function DashboardRouterPage() {
  const router = useRouter()
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/login")
      } else {
        const role = user.profile?.role || "CITIZEN"
        switch (role) {
          case "ADMIN":
            router.push("/admin")
            break
          case "OFFICER":
            router.push("/officer")
            break
          case "SUPERVISOR":
            router.push("/supervisor")
            break
          case "CITIZEN":
          default:
            router.push("/citizen")
            break
        }
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Memuat dashboard...</div>
    </div>
  )
}
