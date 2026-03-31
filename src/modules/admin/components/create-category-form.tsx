"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { adminService } from "../services/admin.service"
import { createCategoryAction, editCategoryAction } from "../actions/admin.actions"
import { createCategorySchema, CreateCategoryFormData } from "../domain/schemas"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CreateCategoryForm({ 
  onSuccess,
  categoryId,
  initialData 
}: { 
  onSuccess?: () => void,
  categoryId?: string,
  initialData?: { name: string, description?: string }
}) {
  const queryClient = useQueryClient()
  
  const form = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    mode: "all",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending 
            ? "Menyimpan..." 
            : categoryId ? "Simpan Perubahan" : "Simpan Kategori"}
        </Button>
      </form>
    </Form>
  )
}
