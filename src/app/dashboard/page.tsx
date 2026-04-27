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
            window.location.assign("/admin")
            break
          case "OFFICER":
            window.location.assign("/officer")
            break
          case "SUPERVISOR":
            window.location.assign("/supervisor")
            break
          case "CITIZEN":
          default:
            window.location.assign("/citizen")
            break
        }
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-bold">Memuat Dashboard...</h2>
        <div className="text-left text-xs bg-slate-100 p-4 rounded-lg font-mono text-slate-600 overflow-auto">
          <p><strong>Status:</strong> {isLoading ? 'Loading User...' : 'Loaded'}</p>
          <p><strong>User:</strong> {user ? user.email : 'None'}</p>
          <p><strong>Role:</strong> {user?.profile?.role || 'None'}</p>
        </div>
        {!isLoading && !user && (
           <p className="text-sm text-red-500">Mengarahkan ke halaman login...</p>
        )}
        {!isLoading && user && (
           <p className="text-sm text-blue-500">Mengarahkan ke halaman {user.profile?.role || 'CITIZEN'}...</p>
        )}
      </div>
    </div>
  )
}
