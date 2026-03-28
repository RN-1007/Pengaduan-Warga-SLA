"use client"

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/modules/admin/services/admin.service'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CategoryTable } from '@/modules/admin/components/category-table'
import { CreateCategoryForm } from '@/modules/admin/components/create-category-form'

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories()
  });

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori & SLA</h1>
          <p className="text-muted-foreground mt-1">Kelola jenis kategori layanan dan aturan waktu respon maksimalnya.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="bg-card flex-1 shadow-sm rounded-lg flex flex-col">
        <div className="p-6">
          <CategoryTable categories={categories || []} isLoading={isLoading} />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Buat Kategori Baru</DialogTitle>
            <DialogDescription>
              Tambahkan kategori masalah baru beserta aturan SLA-nya.
            </DialogDescription>
          </DialogHeader>
          <CreateCategoryForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
