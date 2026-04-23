"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { authService } from "@/modules/auth/services/auth.service"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, LayoutDashboard, History, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CitizenNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  async function handleLogout() {
    await authService.logout()
    router.push('/auth/login')
  }

  const navLinks = [
    { name: "Beranda", href: "/citizen" },
    { name: "Laporan", href: "/citizen/laporan" },
    { name: "Riwayat", href: "/citizen/history" },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/citizen" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            L
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">LaporSLA</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm tracking-wide font-semibold transition-colors ${
                pathname === link.href ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* PROFILE/ACTIONS */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-3 rounded-full transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-700 leading-none mb-0.5">{user.profile?.full_name || 'Citizen'}</p>
                    <p className="text-[10px] text-slate-400 leading-none">Warga</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900">{user.profile?.full_name}</p>
                    <p className="text-xs leading-none text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar Sistem</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="md:hidden text-slate-500" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV LINKS */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-2 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === link.href ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
