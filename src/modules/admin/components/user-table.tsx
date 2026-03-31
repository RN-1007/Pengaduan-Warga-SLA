"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminUsersService } from "../services/admin-users.service"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

export function UserTable({ users, isLoading }: { users: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => 
      adminUsersService.updateUserRole(userId, role),
    onSuccess: async () => {
      toast.success("Role pengguna berhasil diperbarui")
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      await queryClient.refetchQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui role")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminUsersService.deleteUser(userId),
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus pengguna. (Kemungkinan masih ada data laporan terkait)")
    }
  })

  function handleRoleChange(userId: string, newRole: string) {
    roleMutation.mutate({ userId, role: newRole })
  }

  function handleDeleteUser(userId: string, name: string) {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${name}? Tindakan ini tidak bisa dibatalkan.`)) {
      deleteMutation.mutate(userId)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'
      case 'SUPERVISOR': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer'
      case 'OFFICER': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer' // CITIZEN
    }
  }

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead className="font-semibold text-slate-600">Nama Pengguna</TableHead>
            <TableHead className="font-semibold text-slate-600">Email</TableHead>
            <TableHead className="font-semibold text-slate-600">No. Telepon</TableHead>
            <TableHead className="font-semibold text-slate-600">Role Saat Ini</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Memuat data pengguna...
                </div>
              </TableCell>
            </TableRow>
          ) : users?.length ? (
            users.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900">{u.full_name}</TableCell>
                <TableCell className="text-slate-500">{u.email}</TableCell>
                <TableCell className="text-slate-500">{u.phone_number || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger disabled={roleMutation.isPending || deleteMutation.isPending} className="focus:outline-none">
                      <Badge className={`font-semibold transition-colors ${getRoleBadgeColor(u.role)}`} variant="outline">
                        {u.role}
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Ubah Role Pengguna</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleRoleChange(u.id, 'CITIZEN')} disabled={u.role === 'CITIZEN'}>Citizen</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleRoleChange(u.id, 'OFFICER')} disabled={u.role === 'OFFICER'}>Officer</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleRoleChange(u.id, 'SUPERVISOR')} disabled={u.role === 'SUPERVISOR'}>Supervisor</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleRoleChange(u.id, 'ADMIN')} disabled={u.role === 'ADMIN'}>Admin</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteUser(u.id, u.full_name)}
                      disabled={deleteMutation.isPending}
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
             <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                Tidak ada data pengguna ditemukan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
