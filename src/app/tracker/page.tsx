"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Calendar as Cal, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: 'Sen', cal: 1800, max: 2000 },
  { name: 'Sel', cal: 2100, max: 2000 },
  { name: 'Rab', cal: 1950, max: 2000 },
  { name: 'Kam', cal: 1600, max: 2000 },
  { name: 'Jum', cal: 2150, max: 2000 },
  { name: 'Sab', cal: 1240, max: 2000 },
  { name: 'Min', cal: 0, max: 2000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const over = val > 2000;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg">
        <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
        <p className={`text-sm font-semibold ${over ? 'text-red-500' : 'text-primary-500'}`}>
          {val} kcal
        </p>
      </div>
    );
  }
  return null;
};

export default function Tracker() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("nutriscan_logged_in");
    if (!loggedIn) {
      router.push("/login");
    } else {
      const storedHistory = JSON.parse(localStorage.getItem("nutriscan_history") || "[]");
      setHistory(storedHistory);
      
      // Calculate today's calories
      const today = new Date().toLocaleDateString();
      const todayCals = storedHistory
        .filter((item: any) => item.date === today)
        .reduce((sum: number, item: any) => sum + item.cal, 0);
      setTodayCalories(todayCals);
      
      setIsAuthorized(true);
    }
  }, [router]);

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
          <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Statistik Nutrisi</h1>
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
                  <TrendingUp size={16}/> Rata-rata Mingguan
                </h2>
                <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-900 dark:text-white">{todayCalories || "0"}</span>
                 <span className="text-slate-400 font-medium font-sm">kcal/hari ini</span>
                </div>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-2xl text-xs font-bold border border-primary-100 dark:border-primary-800/50">
                Aman 👍
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="cal" radius={[6, 6, 6, 6]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cal > entry.max ? '#ef4444' : (entry.cal === 0 ? '#e2e8f0' : '#20bc69')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Recommendation Alert */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-brand rounded-2xl p-5 shadow-glow mb-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="relative z-10 flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">💡</span>
               </div>
               <div>
                  <h4 className="font-bold text-lg mb-1">Rekomendasi AI</h4>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Asupan protein kamu minggu ini sedikit di bawah target. Cobalah menambahkan telur rebus atau dada ayam pada menu sarapan besok!
                  </p>
               </div>
            </div>
          </motion.div>

          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Log Hari Ini</h3>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white dark:bg-card border border-card-border p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-3xl">{item.icon || "🍴"}</span>
                    <CheckCircle2 size={16} className="absolute bottom-1 right-1 text-primary-400 fill-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Cal size={12}/> {item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary-600 dark:text-primary-400 text-lg">{item.cal}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kkal</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-100/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-medium italic">Belum ada riwayat makan hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Navigation />
    </>
  );
}
