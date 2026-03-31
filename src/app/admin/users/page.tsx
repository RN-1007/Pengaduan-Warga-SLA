"use client"

import { useQuery } from '@tanstack/react-query'
import { adminUsersService } from '@/modules/admin/services/admin-users.service'
import { UserTable } from '@/modules/admin/components/user-table'
import { UsersIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersService.getAllUsers()
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
          <UsersIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Lihat daftar pengguna dan atur hak akses (role) ke sistem.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        <div className="p-6">
          <UserTable users={users || []} isLoading={isLoading} />
        </div>
      </motion.div>
    </div>
  )
}
