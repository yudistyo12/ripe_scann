"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Command, Globe } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    if (authMode === "forgot") {
      alert("Link reset password telah dikirim ke email Anda!");
      setAuthMode("login");
    } else if (authMode === "register") {
      try {
        const usersInfo = JSON.parse(localStorage.getItem("nutriscan_users_db") || "{}");
        if (usersInfo[email]) {
          alert("Email sudah terdaftar. Silakan login.");
          return;
        }
        
        const finalName = name || "NutriUser";
        const newUser = {
          name: finalName,
          email: email,
          password: password,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalName}`
        };
        
        usersInfo[email] = newUser;
        localStorage.setItem("nutriscan_users_db", JSON.stringify(usersInfo));
        alert("Pendaftaran berhasil! Silakan login.");
        setAuthMode("login");
        setPassword("");
      } catch (err) {
        console.error("Error saving user:", err);
      }
    } else {
      try {
        const usersInfo = JSON.parse(localStorage.getItem("nutriscan_users_db") || "{}");
        const user = usersInfo[email];
        
        if (!user) {
          alert("Email belum terdaftar. Silakan daftar akun terlebih dahulu.");
          return;
        }
        
        if (user.password !== password) {
          alert("Password salah.");
          return;
        }
        
        localStorage.setItem("nutriscan_logged_in", "true");
        localStorage.setItem("nutriscan_user_name", user.name);
        localStorage.setItem("nutriscan_user_avatar", user.avatar);
        localStorage.setItem("nutriscan_user_email", user.email);
        
        router.push("/");
      } catch (err) {
        console.error("Error during login:", err);
      }
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1200));
    const finalName = provider === "google" ? "Google User" : "Email User";
    const emailStr = `${provider}@example.com`;
    
    try {
      const usersInfo = JSON.parse(localStorage.getItem("nutriscan_users_db") || "{}");
      if (!usersInfo[emailStr]) {
          usersInfo[emailStr] = {
              name: finalName,
              email: emailStr,
              password: "",
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
          };
          localStorage.setItem("nutriscan_users_db", JSON.stringify(usersInfo));
      }
      
      localStorage.setItem("nutriscan_logged_in", "true");
      localStorage.setItem("nutriscan_user_name", usersInfo[emailStr].name);
      localStorage.setItem("nutriscan_user_avatar", usersInfo[emailStr].avatar);
      localStorage.setItem("nutriscan_user_email", usersInfo[emailStr].email);
    } catch (err) {
      console.error(err);
    }
    
    setIsLoading(false);
    router.push("/");
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl -ml-32 -mt-32"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -mr-32 -mb-32"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-glow p-4 mb-4 flex items-center justify-center border border-card-border hover:scale-105 transition-transform">
            <img src="/logo.png" alt="RipeScan Logo" className="w-full h-full object-contain" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {authMode === "login" ? "RipeScan" : authMode === "register" ? "Daftar Akun" : "Reset Password"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
            {authMode === "login" 
              ? "Masuk untuk melanjutkan perjalanan sehatmu" 
              : authMode === "register" 
                ? "Mulai hidup lebih sehat dengan RipeScan hari ini"
                : "Masukkan email Anda untuk menerima link reset"}
          </p>
        </div>

        <div className="bg-white dark:bg-card border border-card-border rounded-3xl p-8 shadow-soft">
          <form onSubmit={handleAuth} className="space-y-5">
            {authMode === "register" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Command size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            {authMode !== "forgot" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    required
                  />
                </div>
              </motion.div>
            )}

            {authMode === "login" && (
              <div className="flex justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-brand text-white font-bold py-4 rounded-2xl shadow-glow hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {authMode === "login" ? "Masuk Sekarang" : authMode === "register" ? "Daftar Akun" : "Kirim Link Reset"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {authMode !== "login" && (
                <button 
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="w-full text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
                >
                    Kembali ke Login
                </button>
            )}
          </form>

          {authMode !== "forgot" && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-card px-3 text-slate-400 font-bold">Atau lanjut dengan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3.5 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Globe size={20} className="text-red-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Google</span>
                </button>
                <button 
                  onClick={() => handleSocialLogin("email")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3.5 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Command size={20} className="text-slate-900 dark:text-white" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</span>
                </button>
              </div>
            </>
          )}
        </div>

        {authMode === "login" && (
          <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Belum punya akun?{" "}
            <button 
              onClick={() => setAuthMode("register")}
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              Daftar Gratis
            </button>
          </p>
        )}
      </motion.div>
    </main>
  );
}
