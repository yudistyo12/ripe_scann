"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Calendar as Cal, CheckCircle2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: 'Sen', scans: 4, ripe: 2, unripe: 1, overripe: 1 },
  { name: 'Sel', scans: 6, ripe: 4, unripe: 2, overripe: 0 },
  { name: 'Rab', scans: 2, ripe: 1, unripe: 1, overripe: 0 },
  { name: 'Kam', scans: 7, ripe: 5, unripe: 1, overripe: 1 },
  { name: 'Jum', scans: 5, ripe: 3, unripe: 2, overripe: 0 },
  { name: 'Sab', scans: 8, ripe: 6, unripe: 0, overripe: 2 },
  { name: 'Min', scans: 0, ripe: 0, unripe: 0, overripe: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg">
        <p className="font-bold text-slate-800 dark:text-white mb-2">{label} - {dataObj.scans} Pemindaian</p>
        <div className="space-y-1 text-xs font-semibold">
           <p className="text-primary-500">✅ Matang: {dataObj.ripe}</p>
           <p className="text-blue-500">⏳ Mentah: {dataObj.unripe}</p>
           <p className="text-red-500">⚠️ Terlalu Matang: {dataObj.overripe}</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function Tracker() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [todayScans, setTodayScans] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("nutriscan_logged_in");
    if (!loggedIn) {
      router.push("/login");
    } else {
      const storedHistory = JSON.parse(localStorage.getItem("nutriscan_history") || "[]");
      setHistory(storedHistory);
      
      const today = new Date().toLocaleDateString();
      const todayItems = storedHistory.filter((item: any) => item.date === today);
      setTodayScans(todayItems.length);
      
      setIsAuthorized(true);
    }
  }, [router]);

  const handleDelete = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    localStorage.setItem("nutriscan_history", JSON.stringify(newHistory));
    
    // Update top chart / metric instantly
    const today = new Date().toLocaleDateString();
    const todayItems = newHistory.filter((item: any) => item.date === today);
    setTodayScans(todayItems.length);
  };


  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-background">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <>
      <main className="flex-1 overflow-x-hidden pb-24 bg-slate-50 dark:bg-background min-h-screen">
        <header className="sticky top-0 w-full z-40 glassmorphism px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition">
              <ArrowLeft size={20} className="text-slate-800 dark:text-white" />
            </div>
          </Link>
          <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Inventaris & Statistik</h1>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          
          {/* Main Dashboard Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-card border border-card-border rounded-3xl p-6 shadow-soft mb-6"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2 mb-1">
                  <BarChart3 size={16}/> Pemindaian Minggu Ini
                </h2>
                <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-900 dark:text-white">{todayScans}</span>
                 <span className="text-slate-400 font-medium text-sm">item hari ini</span>
                </div>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-2xl text-xs font-bold border border-primary-100 dark:border-primary-800/50 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Aktif
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="scans" radius={[6, 6, 6, 6]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.scans === 0 ? '#e2e8f0' : '#20bc69'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div> Matang
               </div>
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div> Mentah
               </div>
               <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div> Busuk
               </div>
            </div>
          </motion.div>

          {/* AI Recommendation Alert */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-indigo-600 rounded-2xl p-5 shadow-glow mb-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10 flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">⚠️</span>
               </div>
               <div>
                  <h4 className="font-bold text-lg mb-1">Peringatan AI</h4>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Terdapat 2 item yang dipindai 3 hari lalu dengan status 'Matang'. Segera konsumsi sebelum membusuk!
                  </p>
               </div>
            </div>
          </motion.div>

          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Log Inventaris</h3>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item, i) => {
                const isOverripe = item.status === 'Terlalu Matang';
                const isRipe = item.status === 'Matang';
                
                return (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3, delay: i * 0.05 }}
                   className="bg-white dark:bg-card border border-card-border p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                 >
                   <div className={`w-16 h-16 rounded-xl overflow-hidden relative flex items-center justify-center border ${
                     isOverripe ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/50' : 
                     (isRipe ? 'bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-900/50' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50')
                   }`}>
                     <span className="text-3xl">{item.icon || "🔍"}</span>
                   </div>
                   <div className="flex-1">
                     <h4 className="font-bold text-slate-800 dark:text-white text-lg">{item.name}</h4>
                     <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Cal size={12}/> {item.date} {item.time}</p>
                   </div>
                   <div className="text-right flex flex-col items-end gap-2">
                     <button 
                       onClick={() => handleDelete(i)}
                       className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                     >
                       <Trash2 size={16} />
                     </button>
                     <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isOverripe ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        (isRipe ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400')
                     }`}>
                        {item.status}
                     </div>
                   </div>
                 </motion.div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-slate-100/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-medium italic">Belum ada makanan yang dipindai.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Navigation />
    </>
  );
}
