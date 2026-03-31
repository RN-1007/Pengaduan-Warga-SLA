"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createComplaintSchema, type CreateComplaintFormData } from "../domain/schemas"
import { getActiveCategoriesAction, createComplaintAction } from "../actions/complaints.actions"
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

export function CreateComplaintForm({ 
  citizenId, 
  onSuccess 
}: { 
  citizenId: string, 
  onSuccess?: () => void 
}) {
  const queryClient = useQueryClient()
  
  const form = useForm<CreateComplaintFormData>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      location: "", 
      category_id: "" 
    },
  })

  // Fetch Categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['complaint-categories'],
    queryFn: () => getActiveCategoriesAction()
  })

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: CreateComplaintFormData) => 
      // Using Server Action to bypass RLS for inserting complaints
      createComplaintAction(data, citizenId, undefined),
    onSuccess: () => {
      toast.success("Pengaduan berhasil dibuat!")
      queryClient.invalidateQueries({ queryKey: ['complaints', citizenId] })
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] })
      form.reset()
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat pengaduan")
    }
  })

  function onSubmit(data: CreateComplaintFormData) {
    mutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Laporan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isCategoriesLoading}>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Laporan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Lampu jalan mati di Setiabudi" {...field} />
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
              <FormLabel>Deskripsi Detail</FormLabel>
              <FormControl>
                <Textarea placeholder="Jelaskan secara detail mengenai masalah..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokasi Kejadian</FormLabel>
              <FormControl>
                <Input placeholder="Jl. Setiabudi Raya No 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full mt-4" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Mengirim..." : "Kirim Laporan"}
        </Button>

      </form>
    </Form>
  )
}
