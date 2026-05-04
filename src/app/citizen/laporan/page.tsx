"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth.service'
import { getActiveCategoriesAction } from '@/modules/complaints/actions/complaints.actions'
import { PlusCircle, ArrowRight, Camera, MapPin, FileText, Shield, Clock, ChevronDown, CheckCircle2, AlertTriangle, Zap } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { CreateComplaintForm } from '@/modules/complaints/components/create-complaint-form'
import { SLA_RESOLUTION_HOURS } from '@/types/database.types'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { ShinyText } from '@/components/ui/shiny-text'


export default function CitizenLaporanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  const { data: categories } = useQuery({
    queryKey: ['active-categories'],
    queryFn: () => getActiveCategoriesAction()
  })

  const containerV: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemV: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  }

  const tips = [
    { icon: Camera, title: "Sertakan Foto Bukti", desc: "Foto yang jelas mempercepat verifikasi hingga 2x lebih cepat.", color: "blue" },
    { icon: MapPin, title: "Lokasi yang Akurat", desc: "Tuliskan alamat lengkap agar petugas dapat menemukan titik masalah.", color: "emerald" },
    { icon: FileText, title: "Deskripsi Detail", desc: "Jelaskan kronologi, dampak, dan kondisi terkini secara ringkas.", color: "violet" },
  ]

  const faqs = [
    { q: "Berapa lama laporan saya ditanggapi?", a: "Setiap laporan terikat SLA berdasarkan kategori dan prioritas. Waktu tercepat adalah 6 jam untuk kondisi darurat." },
    { q: "Bisakah saya melacak status laporan?", a: "Ya, buka menu 'Riwayat' di navbar untuk melihat status dan timeline perkembangan laporan Anda." },
    { q: "Apa yang terjadi jika laporan melewati batas SLA?", a: "Laporan otomatis dieskalasi ke Supervisor dan statusnya dinaikkan menjadi prioritas Darurat untuk penanganan segera." },
    { q: "Apakah laporan saya bisa ditolak?", a: "Laporan yang tidak valid, duplikat, atau tidak memiliki bukti pendukung dapat ditolak oleh Admin dengan alasan tertulis." },
  ]

  const colorMap: Record<string, { bg: string, text: string, iconBg: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", iconBg: "bg-violet-100" },
  }

  return (
    <div className="w-full">


      {/* ══════ NEW SPLIT HERO ══════ */}
      <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 px-6 min-h-[80vh] flex items-center overflow-hidden bg-slate-50/30">
        {/* Abstract Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Content: Text & CTA */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerV}
              className="text-left"
            >
              <motion.div variants={itemV}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-blue-700 text-sm font-semibold mb-6 border border-slate-200 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-blue-600" /> <ShinyText text="Layanan Pengaduan Cepat 24/7" className="text-blue-700" />
              </motion.div>

              <motion.h1 variants={itemV}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Jangan didiamkan, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                  laporkan sekarang.
                </span>
              </motion.h1>

              <motion.p variants={itemV}
                className="text-lg text-slate-500 max-w-lg mb-8 leading-relaxed">
                Saluran resmi pelaporan masalah fasilitas umum dan infrastruktur. Setiap laporan yang masuk akan segera diproses sesuai Service Level Agreement (SLA) yang transparan.
              </motion.p>

              <motion.div variants={itemV}
                className="flex flex-col sm:flex-row items-start gap-4">
                <Button onClick={() => setIsDialogOpen(true)} size="lg"
                  className="rounded-2xl h-14 px-8 text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 duration-300">
                  <PlusCircle className="w-5 h-5" /> Buat Pengaduan
                </Button>
                <a href="#panduan">
                  <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-base border-slate-200 bg-white hover:bg-slate-50 group transition-all duration-300 hover:scale-105 shadow-sm">
                    Lihat Panduan <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </motion.div>
            </motion.div>

            {/* Right Content: Floating Visuals */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center h-[550px]"
            >
              <div className="relative w-full max-w-md">

                {/* Floating Card 1: Status */}
                <motion.div
                  animate={{ y: [-12, 12, -12], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute z-30 top-12 -right-8 p-5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 w-64"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Status Laporan</div>
                      <div className="text-sm font-bold text-slate-800">Sedang Diproses</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: "66%" }} transition={{ duration: 1.5, delay: 1 }}
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full"
                    />
                  </div>
                </motion.div>

                {/* Floating Card 2: SLA Guarantee */}
                <motion.div
                  animate={{ y: [15, -15, 15], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute z-20 bottom-16 -left-12 p-5 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 w-72"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-800">SLA Terjamin</div>
                      <div className="text-sm text-slate-500">Maks. penyelesaian 24 Jam</div>
                    </div>
                  </div>
                </motion.div>

                {/* Main Center UI Mockup */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-[340px] mx-auto bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden"
                >
                  <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="p-6">
                    <div className="w-full h-36 bg-slate-100 rounded-xl mb-6 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="w-20 h-3 bg-slate-200 rounded-full mb-2" />
                        <div className="w-full h-8 bg-slate-50 rounded-lg border border-slate-100" />
                      </div>
                      <div>
                        <div className="w-24 h-3 bg-slate-200 rounded-full mb-2" />
                        <div className="w-full h-20 bg-slate-50 rounded-lg border border-slate-100" />
                      </div>
                      <div className="w-full h-10 bg-blue-600 rounded-lg mt-2 flex items-center justify-center">
                        <div className="w-24 h-3 bg-white/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Subtle fade at the bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════ TIPS MELAPOR ══════ */}
      <section id="panduan" className="py-24 px-6 bg-slate-50/50 border-y border-slate-100 scroll-mt-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-4 border border-indigo-100">
              <CheckCircle2 className="w-3 h-3" /> Panduan Warga
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Tips Melapor yang Efektif</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Laporan yang lengkap akan diproses lebih cepat dan tepat sasaran.</p>
          </motion.div>

          <motion.div variants={containerV} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, i) => {
              const c = colorMap[tip.color]
              return (
                <motion.div key={i} variants={itemV} whileHover={{ y: -6 }}>
                  <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.15)" className="p-8 group h-full cursor-default">
                    <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />
                    <div className={`relative z-10 w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <tip.icon className={`w-7 h-7 ${c.text}`} />
                    </div>
                    <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-2">{tip.title}</h3>
                    <p className="relative z-10 text-sm text-slate-500 leading-relaxed">{tip.desc}</p>
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════ KATEGORI TERSEDIA ══════ */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold mb-4 border border-amber-100">
              <AlertTriangle className="w-3 h-3" /> Kategori Pengaduan
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Apa yang Bisa Dilaporkan?</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Pilih kategori yang sesuai saat membuat laporan agar proses verifikasi lebih cepat.</p>
          </motion.div>

          <motion.div variants={containerV} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories || []).slice(0, 3).map((cat: any) => {
              const slaRules = cat.sla_rules || []
              const emergencyHours = slaRules.find((r: any) => r.priority === 'EMERGENCY')?.resolution_time_hours || SLA_RESOLUTION_HOURS.EMERGENCY
              return (
                <motion.div key={cat.id} variants={itemV} whileHover={{ y: -4, scale: 1.02 }}>
                  <SpotlightCard className="p-5 group h-full cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-3">{cat.description || 'Kategori pengaduan warga'}</p>
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit border border-amber-100">
                      <Clock className="w-2.5 h-2.5" /> SLA Tercepat: {emergencyHours}j
                    </div>
                  </SpotlightCard>
                </motion.div>
              )
            })}

            {/* Kartu Lainnya */}
            <motion.div variants={itemV} whileHover={{ y: -4, scale: 1.02 }}>
              <SpotlightCard className="p-5 group h-full cursor-default">
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-700 transition-colors">Lainnya</h4>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-3">Masalah lain yang tidak tercantum dalam kategori di atas</p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full w-fit border border-slate-200">
                  <Clock className="w-2.5 h-2.5" /> SLA Default: {SLA_RESOLUTION_HOURS.EMERGENCY}j
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════ SLA EXPLAINER ══════ */}
      <section className="py-24 px-6 bg-slate-50/50 border-y border-slate-100 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold mb-4 border border-emerald-100">
              <Shield className="w-3 h-3" /> Jaminan Layanan
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Jaminan Waktu Penanganan</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Setiap tingkat prioritas memiliki batas waktu yang ketat, diawasi sistem secara otomatis.</p>
          </motion.div>

          <motion.div variants={containerV} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: "Low", hours: SLA_RESOLUTION_HOURS.LOW, desc: "Non-mendesak", color: "emerald", emoji: "🟢" },
              { label: "Medium", hours: SLA_RESOLUTION_HOURS.MEDIUM, desc: "Mengganggu", color: "yellow", emoji: "🟡" },
              { label: "High", hours: SLA_RESOLUTION_HOURS.HIGH, desc: "Berdampak luas", color: "orange", emoji: "🟠" },
              { label: "Emergency", hours: SLA_RESOLUTION_HOURS.EMERGENCY, desc: "Bahaya langsung", color: "red", emoji: "🔴" },
            ].map((p) => (
              <motion.div key={p.label} variants={itemV} whileHover={{ y: -4 }}>
                <SpotlightCard className="p-6 text-center group h-full cursor-default" spotlightColor="rgba(16, 185, 129, 0.1)">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{p.emoji}</div>
                  <h4 className="font-bold text-slate-900 mb-1">{p.label}</h4>
                  <p className="text-3xl font-extrabold text-slate-900 mb-1">{p.hours}<span className="text-base font-medium text-slate-400 ml-1">jam</span></p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Pertanyaan Umum</h2>
            <p className="text-slate-500">Hal-hal yang sering ditanyakan seputar pelaporan.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-slate-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div initial={false} animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="relative py-24 px-6 overflow-hidden z-10">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.15),_transparent_50%)]" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }}
          className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            <ShinyText text="Siap Membuat Laporan?" className="text-white" shimmerWidth={150} />
          </h2>
          <p className="text-slate-400 mb-8 text-lg">Setiap laporan Anda berkontribusi pada lingkungan yang lebih baik.</p>
          <Button onClick={() => setIsDialogOpen(true)} size="lg"
            className="rounded-full h-14 px-10 text-base bg-white text-slate-900 hover:bg-slate-100 shadow-2xl shadow-white/10 font-bold group hover:scale-105 transition-all duration-300">
            <PlusCircle className="w-5 h-5 mr-2" /> Buat Pengaduan Sekarang
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* ══════ MODAL ══════ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[560px] max-h-[85vh] overflow-y-auto z-[9999] bg-white/95 backdrop-blur-xl border-slate-200 p-5 md:p-8 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-slate-900">Buat Pengaduan Baru</DialogTitle>
            <DialogDescription className="text-sm md:text-base text-slate-500 px-5 pl-1">Isi form dengan informasi sejelas mungkin. Sertakan foto bukti untuk mempercepat penanganan.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {user && <CreateComplaintForm citizenId={user.id} onSuccess={() => setIsDialogOpen(false)} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}