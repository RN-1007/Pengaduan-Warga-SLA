"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createComplaintSchema, type CreateComplaintFormData } from "../domain/schemas"
import { getActiveCategoriesAction, updateComplaintAction } from "../actions/complaints.actions"
import { uploadComplaintPhotoAction } from "../actions/upload.actions"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, X, Loader2, Send } from "lucide-react"

// ─── Convert File → base64 string ────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function EditComplaintForm({
  complaint,
  onSuccess,
}: {
  complaint: any
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State untuk foto
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(complaint.photo_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<CreateComplaintFormData>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: complaint.title || "",
      description: complaint.description || "",
      location: complaint.location || "",
      category_id: complaint.category_id || "",
    },
  })

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["complaint-categories"],
    queryFn: () => getActiveCategoriesAction(),
  })

  const mutation = useMutation({
    mutationFn: async (data: CreateComplaintFormData) => {
      let photoUrl: string | undefined = undefined

      // Upload foto jika ada — via server action (service role, auto-create bucket)
      if (photoFile) {
        setIsUploading(true)
        try {
          const base64 = await fileToBase64(photoFile)
          photoUrl = await uploadComplaintPhotoAction({
            base64,
            fileName: photoFile.name,
            mimeType: photoFile.type,
            citizenId: complaint.citizen_id,
          })
        } finally {
          setIsUploading(false)
        }
      }

      return updateComplaintAction(complaint.id, data, photoUrl)
    },
    onSuccess: () => {
      toast.success("Pengaduan berhasil diperbarui!")
      queryClient.invalidateQueries({ queryKey: ["complaint", complaint.id] })
      queryClient.invalidateQueries({ queryKey: ["complaints", complaint.citizen_id] })
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] })
      setPhotoFile(null)
      setPhotoPreview(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat pengaduan")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB")
      return
    }
    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WEBP)")
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const isPending = mutation.isPending || isUploading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">

        {/* Kategori */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-slate-700">Kategori Laporan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isCategoriesLoading} className="rounded-xl h-10 border-slate-200">
                    <SelectValue placeholder="— Pilih Kategori —" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>Memuat kategori...</SelectItem>
                  ) : categories?.length ? (
                    categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Kategori belum tersedia</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Judul */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-slate-700">Judul Laporan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Lampu jalan mati di Setiabudi"
                  className="rounded-xl h-10 border-slate-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deskripsi */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-slate-700">Deskripsi Detail</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan secara detail mengenai masalah yang terjadi..."
                  className="rounded-xl border-slate-200 resize-none min-h-[90px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lokasi */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-slate-700">Lokasi Kejadian</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jl. Setiabudi Raya No 10, RT 05 RW 02"
                  className="rounded-xl h-10 border-slate-200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Upload Foto ── */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 block">
            Foto Bukti <span className="font-normal text-slate-400">(Opsional, maks. 5MB)</span>
          </label>

          {/* Preview jika sudah ada foto */}
          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={photoPreview}
                alt="Preview foto"
                className="w-full max-h-48 object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 bg-slate-900/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                <p className="text-white text-xs font-medium truncate">{photoFile?.name}</p>
                <p className="text-white/70 text-xs">
                  {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ""}
                </p>
              </div>
            </div>
          ) : (
            /* Area drag & drop / klik */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 px-4 flex flex-col items-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Klik untuk upload foto</p>
                <p className="text-xs mt-0.5">JPG, PNG, WEBP — Maks. 5MB</p>
              </div>
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold mt-2 shadow-sm shadow-blue-600/20"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUploading ? "Mengupload foto..." : "Mengirim laporan..."}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
