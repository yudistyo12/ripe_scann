"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, ArrowRight, Zap, Target, History } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState("");
  const [todayCalories, setTodayCalories] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Basic Auth Check
    const loggedIn = localStorage.getItem("nutriscan_logged_in");
    if (!loggedIn) {
      router.push("/login");
    } else {
      setUserName(localStorage.getItem("nutriscan_user_name") || "User");
      setUserAvatar(localStorage.getItem("nutriscan_user_avatar") || `https://api.dicebear.com/7.x/avataaars/svg?seed=User`);
      
      const storedHistory = JSON.parse(localStorage.getItem("nutriscan_history") || "[]");
      setHistory(storedHistory.slice(0, 3)); // Only show last 3
      
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
      <main className="flex-1 overflow-x-hidden pb-24 bg-slate-50 dark:bg-background min-h-[100dvh]">
        {/* Header / Top Nav area */}
        <header className="fixed top-0 w-full z-50 glassmorphism px-6 py-4 flex justify-between items-center sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-none">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-glow border border-card-border p-1.5">
              <img src="/logo.png" alt="NutriScan Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400">
              NutriScan
            </h1>
          </div>
          <Link href="/profile" className="block outline-none hover:scale-105 transition-transform active:scale-95">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm relative">
               <img src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" className="w-full h-full object-cover"/>
            </div>
          </Link>
        </header>

        {/* Padding trick for fixed header on mobile */}
        <div className="h-20 sm:hidden bg-background"></div>

        <div className="max-w-7xl mx-auto px-6 pt-6 sm:pt-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">
              Selamat Datang Kembali, {userName.split(' ')[0]} 👋
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Satu Langkah Menuju <br />
              <span className="text-gradient">Hidup Sehat.</span>
            </h3>
          </motion.div>

          {/* Calorie Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-card border border-card-border rounded-3xl p-6 shadow-soft mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Kalori Hari Ini</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{todayCalories}</span>
                  <span className="text-slate-500 font-medium">/ 2,000 kcal</span>
                </div>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Target size={12} />
                Sisa 760
              </div>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todayCalories / 2000) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-brand rounded-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5 relative z-10">
              <div className="text-center">
                <p className="text-slate-400 text-xs font-medium mb-1">Protein</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">45g</p>
              </div>
              <div className="text-center border-x border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 text-xs font-medium mb-1">Karbo</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">120g</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs font-medium mb-1">Lemak</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">32g</p>
              </div>
            </div>
          </motion.div>

          {/* Main Action - Scanner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/scanner" className="block w-full">
              <div className="group relative bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 overflow-hidden flex items-center justify-between shadow-soft">
                <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h4 className="text-white text-xl font-bold mb-1 group-hover:drop-shadow-md">Scan Makanan</h4>
                  <p className="text-slate-400 group-hover:text-white/90 text-sm max-w-[200px] transition-colors">
                    Deteksi kalori dan nutrisi hanya dengan kamera AI.
                  </p>
                </div>
                
                <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300">
                  <Camera size={26} className="text-white group-hover:text-primary-600 transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Fast Actions / History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 dark:text-white">Riwayat Terakhir</h4>
              <Link href="/tracker" className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center hover:underline">
                Lihat Semua <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-card border border-card-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                        {item.icon || "🍴"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{item.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600 dark:text-primary-400">{item.cal} kcal</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-400 text-sm">Belum ada aktivitas hari ini.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Navigation />
    </>
  );
}
