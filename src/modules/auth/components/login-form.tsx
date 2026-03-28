"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "../domain/schemas"
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

export function LoginForm({ onToggleForm }: { onToggleForm?: () => void }) {
  const router = useRouter()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      await authService.login(data)
      toast.success("Login berhasil!")
      window.location.href = "/dashboard"
    } catch (error: any) {
      toast.error(error.message || "Email atau password salah")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang</h1>
        <p className="text-slate-500">Masukkan kredensial Anda untuk masuk ke sistem pelaporan.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                  <Input placeholder="••••••••" type="password" className="h-12 bg-slate-50/50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-semibold" type="submit" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk Sekarang"}
          </Button>
        </form>
      </Form>
      
      <p className="text-sm text-center text-slate-500 pt-4">
         Belum memiliki akun warga?{" "}
         {onToggleForm ? (
           <button type="button" onClick={onToggleForm} className="text-blue-600 font-semibold hover:underline">Daftar di sini</button>
         ) : (
           <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">Daftar di sini</Link>
         )}
      </p>
    </div>
  )
}
