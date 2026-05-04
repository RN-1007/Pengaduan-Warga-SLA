"use client"

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, Activity, Users, SendToBack, MapPin } from "lucide-react";
import RippleCursor from "@/components/ui/ripple-cursor";
import RotatingText from "@/components/ui/rotating-text";

export default function CitizenLandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden font-sans w-full">
      {/* Background Decor */}
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 min-h-[80vh] flex items-center justify-center">

        {/* Floating Images Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Image 1 - Jalan Rusak */}
          <div
            className="absolute top-[10%] left-[-5%] md:left-[5%] lg:left-[10%] w-32 h-40 md:w-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl opacity-60 mix-blend-multiply -rotate-6 animate-in fade-in slide-in-from-bottom-10 duration-1000"
          >
            <img src="https://images.unsplash.com/photo-1584467735815-f778f274e296?q=80&w=800" alt="Jalan Rusak" className="object-cover w-full h-full" />
          </div>

          {/* Image 2 - Tumpukan Sampah */}
          <div
            className="absolute top-[25%] right-[-5%] md:right-[5%] lg:right-[10%] w-36 h-36 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl opacity-50 mix-blend-multiply rotate-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both"
          >
            <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800" alt="Sampah Menumpuk" className="object-cover w-full h-full" />
          </div>

          {/* Image 3 - Banjir Kontras */}
          <div
            className="absolute hidden md:block bottom-[10%] left-[20%] w-40 h-32 rounded-3xl overflow-hidden shadow-xl opacity-50 mix-blend-multiply rotate-6 animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-both"
          >
            <img src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800" alt="Banjir" className="object-cover w-full h-full grayscale" />
          </div>

          {/* Image 4 - Polusi/Fasilitas Rusak */}
          <div
            className="absolute hidden lg:block bottom-[15%] right-[25%] w-48 h-32 rounded-2xl overflow-hidden shadow-xl opacity-40 mix-blend-multiply -rotate-3 animate-in fade-in duration-1000 delay-500 fill-mode-both"
          >
            <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800" alt="Lingkungan Kumuh" className="object-cover w-full h-full" />
          </div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Sistem Pintar Berbasis Waktu Layanan
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] flex flex-col items-center justify-center text-center px-2"
          >
            <span>Suara Anda didengar,</span>
            <div className="flex justify-center mt-3 overflow-hidden h-[90px] sm:h-[100px] md:h-[110px] w-full">
              <RotatingText
                texts={['Kota Membaik.', 'Solusi Dikejar.', 'Laporan Lancar.', 'Langsung Kelar.']}
                mainClassName="text-blue-600 overflow-hidden py-1 md:py-2 justify-center text-center"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
                splitBy="characters"
                auto
                loop
              />
            </div>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Platform pelaporan warga modern yang menjamin respons cepat dengan Service Level Agreement (SLA). Pantau tiap progres secara transparan hingga tuntas.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/citizen/laporan">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center gap-2">
                Buat Laporan Sekarang <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/citizen/history">
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base border-slate-200 hover:bg-slate-50">
                Lacak Status Laporan
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            {[
              { id: 1, label: "Laporan Terselesaikan", value: "10K+" },
              { id: 2, label: "Tingkat Respons SLA", value: "98.5%" },
              { id: 3, label: "Rata-rata Penanganan", value: "< 24 Jam" },
              { id: 4, label: "Petugas Aktif", value: "500+" },
            ].map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Mengapa Menggunakan LaporSLA?</h2>
          <p className="text-slate-500">Dibangun dengan standar keamanan tingkat tinggi dan alur kepastian waktu pengerjaan untuk kenyamanan pengaduan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="md:col-span-2 col-span-1 border border-slate-200 bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none -mr-10 -mt-10 group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-[0.08] transition-all duration-700 origin-center">
              <Clock className="w-64 h-64 text-blue-900" />
            </div>
            <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="relative z-10 text-2xl font-semibold mb-3 group-hover:text-blue-950 transition-colors duration-300">Garansi Waktu SLA</h3>
            <p className="relative z-10 text-slate-500 max-w-md leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
              Setiap kategori pengaduan terikat dengan batas waktu (SLA) yang ketat. Laporan yang ditunda akan secara otomatis dieskalasi ke tingkat Supervisor untuk penanganan prioritas (Darurat).
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden col-span-1 border border-slate-200 bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-200 transition-all duration-500 hover:-translate-y-1 group"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10 w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="relative z-10 text-xl font-semibold mb-3 group-hover:text-green-950 transition-colors duration-300">Timeline Transparan</h3>
            <p className="relative z-10 text-slate-500 leading-relaxed text-sm group-hover:text-slate-600 transition-colors duration-300">
              Lacak status laporan Anda secara real-time—mulai dari masuk, diverifikasi, sedang diproses oleh petugas lapangan, hingga selesai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden col-span-1 border border-slate-800 bg-slate-900 text-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-1 group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-10 group-hover:scale-110 group-hover:-translate-x-4 transition-all duration-700 pointer-events-none">
              <ShieldCheck className="w-48 h-48 text-indigo-300" />
            </div>
            <div className="relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/50 group-hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="relative z-10 text-xl font-semibold mb-3 group-hover:text-indigo-100 transition-colors duration-300">Verifikasi Berlapis</h3>
            <p className="relative z-10 text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors duration-300">
              Semua laporan diperiksa validitasnya di panel Administrator sebelum diterjunkan ke petugas. Bebas dari spam dan penumpukan tugas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 col-span-1 border border-slate-200 bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500 hover:-translate-y-1 flex flex-col sm:flex-row gap-8 items-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-indigo-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex-1 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-indigo-950 transition-colors duration-300">Feedback Langsung</h3>
              <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                Evaluasi kinerja petugas penyedia fasilitas dan infrastruktur dengan memberikan rating secara langsung setelah keluhan Anda berhasil ditangani sistem.
              </p>
            </div>
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 p-6 relative overflow-hidden group-hover:border-indigo-100 group-hover:shadow-inner transition-all duration-500">
              {/* Decorative Abstract Star Rating Graph */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-transparent group-hover:from-indigo-200/50 transition-colors duration-500" />
              <div className="flex gap-1 relative z-10 group-hover:scale-110 transition-transform duration-500">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    viewport={{ once: false, amount: 0.2 }}
                    className="group-hover:-translate-y-1 transition-transform duration-300"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <svg className="w-8 h-8 text-yellow-400 drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-16">Alur Pengaduan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] w-[75%] h-0.5 bg-slate-200 z-0" />
            {/* Mobile Vertical Line */}
            <div className="md:hidden absolute top-[2rem] bottom-[4rem] left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 z-0" />

            {[
              { title: "Tulis Laporan", icon: MapPin, desc: "Sertakan foto, lokasi, dan detail masalah secara lengkap." },
              { title: "Verifikasi", icon: ShieldCheck, desc: "Laporan diverifikasi oleh Administrator dan diteruskan ke Petugas." },
              { title: "Penanganan", icon: SendToBack, desc: "Petugas berada di lapangan untuk memproses perbaikan/solusi." },
              { title: "Selesai", icon: React.Fragment, isCheck: true, desc: "Masalah tuntas, warga bisa memberi review atas pengerjaannya." }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{
                  y: { type: "spring", stiffness: 300, damping: 20 },
                  opacity: { delay: index * 0.15 }
                }}
                viewport={{ once: false, amount: 0.2 }}
                className="relative flex flex-col items-center cursor-default group"
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center z-10 mb-6 text-slate-700 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:shadow-md transition-all duration-300">
                  {step.isCheck ? (
                    <div className="w-full h-full rounded-full bg-green-500 text-white flex items-center justify-center group-hover:bg-green-400 transition-colors duration-300">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="relative z-10 bg-slate-50 py-1 flex flex-col items-center">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                  <p className="text-sm text-slate-500 px-4 group-hover:text-slate-700 transition-colors">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900 text-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Mulai Laporkan Keluhan Anda!</h2>
          <p className="text-lg text-slate-400 mb-10">Platform akan langsung meneruskan keluhan Anda ke pihak yang berwajib dengan panduan sistem poin SLA yang terukur secara real-time.</p>
          <Link href="/citizen/laporan">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto">
              Laporkan Masalah <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
