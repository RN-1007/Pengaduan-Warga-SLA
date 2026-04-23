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
import { FilterBar } from "@/components/ui/filter-bar"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { getStatusStyle, getPriorityStyle } from "@/utils/status-styles"

export function AdminComplaintTable({ complaints, isLoading }: { complaints: any[], isLoading: boolean }) {
  const queryClient = useQueryClient()

  const {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    filteredData
  } = useFilteredData({
    initialData: complaints,
    searchKeys: ['title', 'users.full_name', 'complaint_categories.name', 'status', 'priority'],
  })

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
    <div className="space-y-4">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        placeholder="Cari pelapor, judul, kategori, status..."
        totalFiltered={filteredData.length}
        totalItems={complaints?.length || 0}
      />
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
              {/* <TableHead className="text-right">Aksi</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.users?.full_name}</TableCell>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.complaint_categories?.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(c.status).className}`}>
                      {getStatusStyle(c.status).label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {c.priority ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getPriorityStyle(c.priority).className}`}>
                        {getPriorityStyle(c.priority).label}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 tabular-nums text-sm">
                    {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  {/* <TableCell className="text-right">
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
                            <DropdownMenuItem onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}>
                              Tolak / Selesai Laporan
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
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery ? "Laporan tidak ditemukan." : "Tidak ada data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
