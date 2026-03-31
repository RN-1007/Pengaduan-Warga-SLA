"use client"

import { useState } from 'react'
import { PlusCircle, Tags } from 'lucide-react'
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

import { motion } from 'framer-motion'

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories()
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
             <Tags className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kategori & Kondisi SLA</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola jenis kategori layanan dan aturan waktu kedaruratannya.</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 h-11 px-5 rounded-xl">
          <PlusCircle className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
        <div className="p-6">
          <CategoryTable categories={categories || []} isLoading={isLoading} />
        </div>
      </motion.div>

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
