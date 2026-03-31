"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUserAndAuthAction } from "../actions/admin-users.actions"
import { toast } from "sonner"
import { PlusCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export function CreateUserModal() {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "", // Ditambahkan
    full_name: "",
    phone_number: "",
    role: "CITIZEN"
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
       return await createUserAndAuthAction(data)
    },
    onSuccess: () => {
      toast.success("Pengguna baru berhasil ditambahkan secara sinkron (Auth + DB)")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setOpen(false)
      setFormData({ email: "", password: "", full_name: "", phone_number: "", role: "CITIZEN" })
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat pengguna")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.full_name) {
      toast.error("Format wajib diisi (Email & Nama)")
      return
    }
    createMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Pengguna Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pengguna. Sandi bersifat opsional (default: Password123! jika kosong).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input 
              id="full_name" 
              placeholder="Joko Susilo" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Account</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="joko@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Katasandi (Opsional)</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Kosongkan untuk Password123!" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon (Opsional)</Label>
            <Input 
              id="phone" 
              placeholder="08123..." 
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role Akses</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({...formData, role: val})}
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
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan Pengguna
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
