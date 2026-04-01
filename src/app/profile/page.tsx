"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Settings, Bell, ChevronRight, LogOut, Heart, Activity, Camera, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Profile() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("NutriUser");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userAvatar, setUserAvatar] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("nutriscan_logged_in");
    if (!loggedIn) {
      router.push("/login");
    } else {
      const storedName = localStorage.getItem("nutriscan_user_name") || "NutriUser";
      setUserName(storedName);
      setEditNameValue(storedName);
      setUserEmail(localStorage.getItem("nutriscan_user_email") || "user@example.com");
      setUserAvatar(localStorage.getItem("nutriscan_user_avatar") || `https://api.dicebear.com/7.x/avataaars/svg?seed=NutriUser`);
      setIsAuthorized(true);
    }
  }, [router]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserAvatar(base64String);
        localStorage.setItem("nutriscan_user_avatar", base64String);
        
        try {
          const usersInfo = JSON.parse(localStorage.getItem("nutriscan_users_db") || "{}");
          if (userEmail && usersInfo[userEmail]) {
            usersInfo[userEmail].avatar = base64String;
            localStorage.setItem("nutriscan_users_db", JSON.stringify(usersInfo));
          }
        } catch (err) {}
      };
      reader.readAsDataURL(file);
    }
  };

  const saveName = () => {
    setUserName(editNameValue);
    localStorage.setItem("nutriscan_user_name", editNameValue);
    setIsEditingName(false);
    
    try {
      const usersInfo = JSON.parse(localStorage.getItem("nutriscan_users_db") || "{}");
      if (userEmail && usersInfo[userEmail]) {
        usersInfo[userEmail].name = editNameValue;
        localStorage.setItem("nutriscan_users_db", JSON.stringify(usersInfo));
      }
    } catch (err) {}
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
      <main className="flex-1 overflow-x-hidden pb-24 bg-slate-50 dark:bg-background min-h-[100dvh]">
        <header className="sticky top-0 w-full z-40 glassmorphism px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                <ArrowLeft size={20} className="text-slate-800 dark:text-white" />
              </div>
            </Link>
            <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Profil Saya</h1>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            <Settings size={22} />
          </button>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-10"
          >
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover"/>
              </div>
              <label 
                htmlFor="avatar-upload-icon"
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500 rounded-full border-4 border-white dark:border-background flex items-center justify-center text-white shadow-soft hover:scale-110 active:scale-90 transition-all cursor-pointer"
              >
                 <Camera size={16} />
                 <input 
                   id="avatar-upload-icon" 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handleAvatarUpload} 
                 />
              </label>
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input 
                  type="text" 
                  value={editNameValue} 
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-[150px]"
                  autoFocus
                />
                <button 
                  onClick={saveName}
                  className="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditingName(false);
                    setEditNameValue(userName);
                  }}
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 group">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userName}</h2>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-primary-500 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            
            <p className="text-slate-500 dark:text-slate-400 font-medium">{userEmail}</p>
            <label 
              htmlFor="avatar-upload-btn"
              className="mt-4 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Ganti Foto
              <input 
                 id="avatar-upload-btn" 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleAvatarUpload} 
               />
            </label>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.4, delay: 0.1 }}
               className="bg-white dark:bg-card border border-card-border p-5 rounded-3xl shadow-soft"
            >
               <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mb-3">
                  <Heart size={20} className="fill-red-500" />
               </div>
               <p className="font-medium text-slate-500 dark:text-slate-400 text-sm mb-1">Target Harian</p>
               <p className="text-2xl font-bold text-slate-800 dark:text-white">2,000 <span className="text-sm text-slate-400 font-medium">kcal</span></p>
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.4, delay: 0.2 }}
               className="bg-white dark:bg-card border border-card-border p-5 rounded-3xl shadow-soft"
            >
               <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center mb-3">
                  <Activity size={20} />
               </div>
               <p className="font-medium text-slate-500 dark:text-slate-400 text-sm mb-1">Berat Badan</p>
               <p className="text-2xl font-bold text-slate-800 dark:text-white">65.4 <span className="text-sm text-slate-400 font-medium">kg</span></p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-card border border-card-border rounded-3xl overflow-hidden shadow-soft"
          >
            {[
              { icon: User, label: "Edit Profil" },
              { icon: Bell, label: "Notifikasi Pengingat" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <item.icon size={20} />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            ))}
            <div className="w-full">
              <button 
                onClick={() => {
                  localStorage.removeItem("nutriscan_logged_in");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border-t border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                      <LogOut size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-red-500">Keluar</span>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Navigation />
    </>
  );
}
