"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "@/modules/auth/components/login-form"
import { RegisterForm } from "@/modules/auth/components/register-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    
    // Check if desktop
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
      
      const params = new URLSearchParams(window.location.search)
      if (params.get('tab') === 'register') {
        setIsLogin(false)
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const toggleAuthMode = () => setIsLogin(!isLogin)

  if (!isMounted) return null // Wait for client hydration to avoid hydration mismatch with the URL params

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900 bg-slate-50 relative overflow-hidden">
      
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 min-h-[650px] relative z-10 border border-slate-100 overflow-hidden flex flex-col md:block">
        
        {/* Back to Home Link (Fully independent from sliding pane) */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[60]">
          <Link href="/" className="flex flex-row items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm group bg-white/60 backdrop-blur-md rounded-full p-1 pr-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:bg-white/90">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>

        {/* Form Area (Sliding) */}
        <motion.div 
          initial={false}
          animate={{ x: isDesktop ? (isLogin ? "0%" : "100%") : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full px-6 pt-16 pb-8 md:p-12 lg:p-16 flex flex-col items-center justify-start md:justify-center bg-white z-10 relative overflow-y-auto scrollbar-hide"
        >

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <LoginForm onToggleForm={toggleAuthMode} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <RegisterForm onToggleForm={toggleAuthMode} onSuccessRegister={() => setIsLogin(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Branding Panel (Sliding) */}
        <motion.div 
          initial={false}
          animate={{ x: isLogin ? "0%" : "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:flex absolute top-0 right-0 w-1/2 h-full overflow-hidden items-center justify-center p-14 text-center z-20 pointer-events-none"
        >
           {/* Decorative Background Elements */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 pointer-events-auto z-0" />
           <img 
               src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200" 
               alt="City Architecture" 
               className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none z-0" 
           />
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
             className="absolute -top-[60%] -right-[50%] w-[150%] h-[150%] bg-blue-400 opacity-20 rounded-[40%] blur-[80px] z-0" 
           />
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-[50%] -left-[50%] w-[120%] h-[120%] bg-indigo-900 opacity-30 rounded-[35%] blur-[60px] z-0" 
           />

           <AnimatePresence mode="wait">
             {isLogin ? (
               <motion.div
                 key="panel-login"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.05 }}
                 transition={{ duration: 0.4 }}
                 className="relative z-10 text-white space-y-8"
               >
                 <div className="w-24 h-24 bg-white/10 rounded-3xl backdrop-blur-md mx-auto flex items-center justify-center shadow-inner border border-white/20">
                   <span className="text-5xl font-bold">L</span>
                 </div>
                 <div className="space-y-4">
                   <h2 className="text-4xl font-bold tracking-tight">Selamat Datang Kembali!</h2>
                   <p className="text-blue-100 text-lg leading-relaxed max-w-sm mx-auto">
                     Lanjutkan pengaduan fasilitas umum Anda dan pantau status real-time dengan garansi SLA kami.
                   </p>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="panel-register"
                 initial={{ opacity: 0, scale: 1.05 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.4 }}
                 className="relative z-10 text-white space-y-8"
               >
                 <div className="w-24 h-24 bg-indigo-500/30 rounded-3xl backdrop-blur-md mx-auto flex items-center justify-center shadow-inner border border-white/20">
                   <span className="text-5xl font-bold">R</span>
                 </div>
                 <div className="space-y-4">
                   <h2 className="text-4xl font-bold tracking-tight">Menjadi Agen Perubahan.</h2>
                   <p className="text-blue-100 text-lg leading-relaxed max-w-sm mx-auto">
                     Langkah awal dimulai dari Anda. Buat akun sekarang untuk melaporkan masalah infrastruktur kota.
                   </p>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </motion.div>

      </div>
    </div>
  )
}
