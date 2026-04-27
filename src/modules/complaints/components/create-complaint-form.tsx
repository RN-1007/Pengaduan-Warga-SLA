"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createComplaintSchema, type CreateComplaintFormData } from "../domain/schemas"
import { getActiveCategoriesAction, createComplaintAction } from "../actions/complaints.actions"
import { uploadComplaintPhotoAction } from "../actions/upload.actions"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { motion, Variants } from "framer-motion"

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

export function CreateComplaintForm({
  citizenId,
  onSuccess,
}: {
  citizenId: string
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State untuk foto
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<CreateComplaintFormData>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category_id: "",
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
            citizenId,
          })
        } finally {
          setIsUploading(false)
        }
      }

      return createComplaintAction(data, citizenId, photoUrl)
    },
    onSuccess: () => {
      toast.success("Pengaduan berhasil dikirim! Kami akan segera meninjau laporan Anda.")
      queryClient.invalidateQueries({ queryKey: ["complaints", citizenId] })
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] })
      form.reset()
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

  const formVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <Form {...form}>
      <motion.form 
        variants={formVariants}
        initial="hidden"
        animate="show"
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))} 
        className="space-y-4"
      >

        {/* Kategori */}
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-slate-700">Kategori Laporan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={isCategoriesLoading} className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-white transition-colors focus:ring-blue-500/20">
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
        </motion.div>

        {/* Judul */}
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-slate-700">Judul Laporan</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Lampu jalan mati di Setiabudi"
                    className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-white transition-colors focus-visible:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Deskripsi */}
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-slate-700">Deskripsi Detail</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan secara detail mengenai masalah yang terjadi..."
                    className="rounded-xl border-slate-200 resize-none min-h-[100px] bg-slate-50/50 hover:bg-white transition-colors focus-visible:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Lokasi */}
        <motion.div variants={itemVariants}>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-slate-700">Lokasi Kejadian</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jl. Setiabudi Raya No 10, RT 05 RW 02"
                    className="rounded-xl h-11 border-slate-200 bg-slate-50/50 hover:bg-white transition-colors focus-visible:ring-blue-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        {/* ── Upload Foto ── */}
        <motion.div variants={itemVariants} className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 block">
            Foto Bukti <span className="font-normal text-slate-400">(Opsional, maks. 5MB)</span>
          </label>

          {/* Preview jika sudah ada foto */}
          {photoPreview ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
              <img
                src={photoPreview}
                alt="Preview foto"
                className="w-full max-h-56 object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-slate-900/60 backdrop-blur-md hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 backdrop-blur-[2px]">
                <p className="text-white text-sm font-medium truncate">{photoFile?.name}</p>
                <p className="text-white/70 text-xs">
                  {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ""}
                </p>
              </div>
            </motion.div>
          ) : (
            /* Area drag & drop / klik */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl py-8 px-4 flex flex-col items-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 group-hover:bg-blue-100 group-hover:border-blue-200 flex items-center justify-center transition-colors group-hover:scale-110 duration-300">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">Klik untuk upload foto pendukung</p>
                <p className="text-xs mt-1 text-slate-400 group-hover:text-blue-400">JPG, PNG, WEBP — Maks. 5MB</p>
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
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isUploading ? "Mengupload foto..." : "Mengirim laporan..."}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Kirim Laporan
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  )
}
