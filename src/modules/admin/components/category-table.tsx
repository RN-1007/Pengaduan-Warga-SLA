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
import { adminService } from "../services/admin.service"
import { toast } from "sonner"

export function CategoryTable({ categories, isLoading }: { categories: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => adminService.toggleCategory(id, isActive),
    onSuccess: () => {
      toast.success("Status kategori diubah")
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (err) => toast.error("Gagal mengubah status " + err.message)
  })

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat kategori...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Kategori</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Aturan SLA (Jam)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.length ? (
            categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {cat.sla_rules?.length ? cat.sla_rules.map((rule: any) => (
                      <Badge key={rule.id || rule.priority} variant="outline" className="text-xs">
                        {rule.priority}: {rule.resolution_time_hours}j
                      </Badge>
                    )) : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={cat.is_active ? 'default' : 'secondary'}>
                    {cat.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isPending}
                    onClick={() => mutate({ id: cat.id, isActive: !cat.is_active })}
                  >
                    {cat.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Belum ada kategori.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
