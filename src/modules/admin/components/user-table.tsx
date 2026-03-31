"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminUsersService } from "../services/admin-users.service"
import { toast } from "sonner"
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
import { deleteUserAndAuthAction, editUserAction } from "../actions/admin-users.actions"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserTable({ users, isLoading }: { users: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()
  const [userToDelete, setUserToDelete] = React.useState<{ id: string, name: string } | null>(null)
  
  const [editingUser, setEditingUser] = React.useState<any | null>(null)
  const [editForm, setEditForm] = React.useState({ full_name: "", phone_number: "", role: "CITIZEN", password: "" })

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
    mutationFn: (userId: string) => deleteUserAndAuthAction(userId),
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus secara permanen (Auth & DB)")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus pengguna: " + error.message)
    }
  })

  const editMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => editUserAction(data.id, data.payload),
    onSuccess: () => {
      toast.success("Informasi pengguna berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditingUser(null)
    },
    onError: (err: any) => toast.error("Gagal mengupdate pengguna: " + err.message)
  })

  function handleRoleChange(userId: string, newRole: string) {
    roleMutation.mutate({ userId, role: newRole })
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    editMutation.mutate({
      id: editingUser.id,
      payload: {
        full_name: editForm.full_name,
        phone_number: editForm.phone_number,
        role: editForm.role,
        password: editForm.password ? editForm.password : undefined
      }
    })
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
                  <div className="flex justify-end items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditingUser(u)
                        setEditForm({ full_name: u.full_name || "", phone_number: u.phone_number || "", role: u.role || "CITIZEN", password: "" })
                      }}
                      disabled={deleteMutation.isPending || editMutation.isPending}
                      title="Edit Pengguna"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setUserToDelete({ id: u.id, name: u.full_name })}
                      disabled={deleteMutation.isPending || editMutation.isPending}
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

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete?.name}</strong>? 
              Tindakan ini akan menghapus akses login miliknya secara permanen dan tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={deleteMutation.isPending}>
              Batal
            </Button>
            <Button variant="destructive" onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui profil dan akses pengguna. (Sandi opsional, isi jika ingin mengubahnya)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Nama Lengkap</Label>
              <Input 
                id="edit_full_name" 
                value={editForm.full_name}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">No. Telepon</Label>
              <Input 
                id="edit_phone" 
                value={editForm.phone_number}
                onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Role Akses</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(val) => setEditForm({...editForm, role: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZEN">Citizen (Warga)</SelectItem>
                  <SelectItem value="OFFICER">Officer (Petugas)</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="edit_password">Katasandi Baru (Opsional)</Label>
              <Input 
                id="edit_password" 
                type="password" 
                placeholder="Biarkan kosong jika tidak diubah" 
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={editMutation.isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={editMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {editMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
