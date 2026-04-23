"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "../domain/schemas"
import { authService } from "../services/auth.service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"

export function RegisterForm({ onToggleForm, onSuccessRegister }: { onToggleForm?: () => void, onSuccessRegister?: () => void }) {
  const router = useRouter()
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", phone_number: "" },
  })
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    try {
      await authService.register(data)
      toast.success("Registrasi berhasil! Silakan login.")
      if (onSuccessRegister) {
        onSuccessRegister()
      } else {
        router.push("/auth/login")
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal melakukan registrasi")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 mt-8 sm:mt-0">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Bergabung Bersama Kami</h1>
        <p className="text-slate-500 text-sm sm:text-base">Lengkapi data diri Anda untuk hak akses pelaporan publik.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Ahmad Subarjo" className="h-12 bg-slate-50/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Nomor Telepon (WhatsApp)</FormLabel>
                <FormControl>
                  <Input placeholder="08123456789" className="h-12 bg-slate-50/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Alamat Email</FormLabel>
                <FormControl>
                  <Input placeholder="anda@contoh.com" type="email" className="h-12 bg-slate-50/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Kata Sandi</FormLabel>
                <FormControl>
                  <Input placeholder="Buat sandi yang kuat" type="password" className="h-12 bg-slate-50/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold mt-2" type="submit" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Buat Akun Citizens"}
          </Button>
        </form>
      </Form>
      
      <p className="text-sm text-center text-slate-500 pt-4">
         Sudah terdaftar?{" "}
         {onToggleForm ? (
           <button type="button" onClick={onToggleForm} className="text-indigo-600 font-semibold hover:underline">Masuk sekarang</button>
         ) : (
           <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">Masuk sekarang</Link>
         )}
      </p>
    </div>
  )
}
