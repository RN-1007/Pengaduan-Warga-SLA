"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { complaintsService } from "../services/complaints.service"
import { ComplaintStatus } from "@/types/database.types"
import { toast } from "sonner"

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

export function AdminComplaintTable({ complaints, isLoading }: { complaints: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status, priority }: { id: string, status: ComplaintStatus, priority?: any }) => 
      complaintsService.updateStatus(id, { status: status as any, priority }),
    onSuccess: () => {
      toast.success("Status laporan berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui status")
    }
  })

  function handleUpdateStatus(id: string, status: ComplaintStatus, priority?: any) {
    statusMutation.mutate({ id, status, priority })
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pelapor</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : complaints?.length ? (
            complaints.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.users?.full_name}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.complaint_categories?.name}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'VERIFIED' ? 'default' : c.status === 'SUBMITTED' ? 'secondary' : 'outline'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {c.priority ? (
                    <Badge variant={c.priority === 'EMERGENCY' ? 'destructive' : 'default'}>
                      {c.priority}
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi Laporan</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {c.status === 'SUBMITTED' && (
                        <>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'VERIFIED', 'MEDIUM')}>
                            Kustom Prioritas MEDIUM & Verifikasi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'VERIFIED', 'HIGH')}>
                            Kustom Prioritas HIGH & Verifikasi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'CLOSED')}>
                            Tolak (Tutup) Laporan
                          </DropdownMenuItem>
                        </>
                      )}
                      {(c.status === 'VERIFIED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS') && (
                        <>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'ASSIGNED')}>
                            Tandai Assigned
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}>
                            Tandai Selesai (Resolved)
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
             <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
