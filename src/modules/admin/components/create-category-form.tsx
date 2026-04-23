"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategoryAction, editCategoryAction } from "../actions/admin.actions"
import { createCategorySchema, CreateCategoryFormData } from "../domain/schemas"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock } from "lucide-react"

interface InitialData {
  name: string;
  description?: string;
  sla_low?: number;
  sla_medium?: number;
  sla_high?: number;
  sla_emergency?: number;
}

export function CreateCategoryForm({
  onSuccess,
  categoryId,
  initialData
}: {
  onSuccess?: () => void,
  categoryId?: string,
  initialData?: InitialData
}) {
  const queryClient = useQueryClient()

  const form = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    mode: "all",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      sla_low: initialData?.sla_low ?? 72,
      sla_medium: initialData?.sla_medium ?? 48,
      sla_high: initialData?.sla_high ?? 24,
      sla_emergency: initialData?.sla_emergency ?? 6,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateCategoryFormData) =>
      categoryId ? editCategoryAction(categoryId, data) : createCategoryAction(data),
    onSuccess: () => {
      toast.success(categoryId ? "Kategori diperbarui" : "Kategori berhasil dibuat")
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      form.reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Gagal membuat kategori: ${error.message}`)
    }
  })

  function onSubmit(values: CreateCategoryFormData) {
    mutate(values)
  }

  const slaFields = [
    { name: "sla_low" as const, label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { name: "sla_medium" as const, label: "Medium", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    { name: "sla_high" as const, label: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { name: "sla_emergency" as const, label: "Emergency", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="pr-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kategori</FormLabel>
                <FormControl>
                  <Input placeholder="Misal: Jalan Rusak" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Deskripsi mengenai kategori ini..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SLA Configuration */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 leading-none">Waktu SLA</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Batas penyelesaian per prioritas (jam)</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {slaFields.map((sla) => (
                <FormField
                  key={sla.name}
                  control={form.control}
                  name={sla.name}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${sla.bg} ${sla.color} ${sla.border} border`}>
                          {sla.label}
                        </span>
                        <FormControl>
                          <div className="relative w-full">
                            <Input
                              type="number"
                              min={1}
                              className="h-9 text-sm text-center pr-9 bg-white"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium pointer-events-none">
                              jam
                            </span>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage className="text-[10px] text-center" />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center pr-5">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Menyimpan..."
              : categoryId ? "Simpan Perubahan" : "Simpan Kategori"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
