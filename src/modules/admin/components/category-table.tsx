"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { toggleCategoryAction, deleteCategoryAction } from "../actions/admin.actions"
import { Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CreateCategoryForm } from "./create-category-form"
import { Loader2 } from "lucide-react"

export function CategoryTable({ categories, isLoading }: { categories: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()
  const [editingCat, setEditingCat] = useState<any | null>(null)
  const [deletingCat, setDeletingCat] = useState<any | null>(null)

  const { mutate: toggleMutate, isPending: isToggling } = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => toggleCategoryAction(id, isActive),
    onSuccess: () => {
      toast.success("Status kategori diubah")
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (err) => toast.error("Gagal mengubah status " + err.message)
  })

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus")
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeletingCat(null)
    },
    onError: (err) => toast.error("Gagal menghapus kategori: " + err.message)
  })

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat kategori...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%] pl-4">Nama Kategori</TableHead>
            <TableHead className="w-[45%]">Deskripsi</TableHead>
            <TableHead className="w-[20%] text-right pr-4">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.length ? (
            categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium text-slate-900 pl-4">{cat.name}</TableCell>
                <TableCell className="text-slate-600">{cat.description || '-'}</TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-full"
                      onClick={() => setEditingCat(cat)}
                      disabled={isDeleting || isToggling}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-full"
                      onClick={() => setDeletingCat(cat)}
                      disabled={isDeleting || isToggling}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-px h-5 bg-slate-200 mx-1.5"></div>
                    <button
                      disabled={isToggling || isDeleting}
                      onClick={() => toggleMutate({ id: cat.id, isActive: !cat.is_active })}
                      className={`
                        w-24 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                        ${cat.is_active 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300" 
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600"}
                      `}
                    >
                      {cat.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Belum ada kategori.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editingCat} onOpenChange={(open) => !open && setEditingCat(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>
              Perbarui informasi nama dan deskripsi kategori.
            </DialogDescription>
          </DialogHeader>
          {editingCat && (
            <CreateCategoryForm 
              categoryId={editingCat.id} 
              initialData={{ name: editingCat.name, description: editingCat.description }} 
              onSuccess={() => setEditingCat(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCat} onOpenChange={(open) => !open && setDeletingCat(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori <strong>{deletingCat?.name}</strong> secara permanen?
              Tindakan ini mungkin akan memengaruhi laporan yang sudah terkait dengan kategori ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletingCat(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={() => deletingCat && deleteMutate(deletingCat.id)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Hapus Permanen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
