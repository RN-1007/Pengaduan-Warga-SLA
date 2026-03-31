import { Metadata } from 'next';
import { OfficerUpdatesBoard } from '@/modules/complaints/components/officer-updates-board';

export const metadata: Metadata = {
  title: 'Update Progress | LaporSLA',
  description: 'Catat dan perbarui progres pengaduan citizens.',
};

export default function OfficerUpdatesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-screen">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          Update <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Progres</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Kelola tugas pengaduan yang ditugaskan kepada Anda. Berikan update terkini agar citizen dapat memantau proses penyelesaian secara transparan.
        </p>
      </div>

      <div className="p-1 rounded-3xl bg-gradient-to-br from-slate-200/50 to-slate-100/20 shadow-sm">
         <div className="bg-slate-50/80 backdrop-blur-xl rounded-[22px] p-6 lg:p-8 shadow-inner border border-white/50">
            <OfficerUpdatesBoard />
         </div>
      </div>
    </div>
  );
}
