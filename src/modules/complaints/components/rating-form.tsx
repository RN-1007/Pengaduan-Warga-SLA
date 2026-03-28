"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ratingService } from "../services/rating.service"
import { createRatingSchema, CreateRatingFormData } from "../domain/rating.schema"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { StarIcon } from "lucide-react"

export function RatingForm({ complaintId, citizenId, onSuccess }: { complaintId: string, citizenId: string, onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  
  const form = useForm<CreateRatingFormData>({
    resolver: zodResolver(createRatingSchema),
    defaultValues: {
      score: 5,
      feedback: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateRatingFormData) => ratingService.submitRating(complaintId, citizenId, data),
    onSuccess: () => {
      toast.success("Terima kasih atas penilaian Anda!")
      queryClient.invalidateQueries({ queryKey: ['rating', complaintId] })
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(`Gagal mengirim rating: ${error.message}`)
    }
  })

  function onSubmit(values: CreateRatingFormData) {
    mutate(values)
  }

  const currentScore = form.watch("score")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pencapaian Resolusi (Bintang 1-5)</FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${
                        star <= currentScore ? 'text-yellow-500' : 'text-slate-300'
                      }`}
                    >
                      <StarIcon className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Komentar Tambahan</FormLabel>
              <FormControl>
                <Textarea placeholder="Berikan feedback tentang pelayanan penyelesaian masalah..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Mengirim..." : "Kirim Rating"}
        </Button>
      </form>
    </Form>
  )
}
