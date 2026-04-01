"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, BarChart2, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const links = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/scanner", label: "Scan Info", icon: Camera },
    { href: "/tracker", label: "Tracker", icon: BarChart2 },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 glassmorphism pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex justify-around items-center h-20 px-6">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <div className="relative p-2">
                <Icon
                  size={isActive ? 28 : 24}
                  className={`transition-all duration-300 relative z-10 ${
                    isActive ? "text-primary-500" : "text-slate-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Active Indicator Pulse */}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-2xl z-0"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-wide ${
                  isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400"
                }`}
              >
                {link.label}
              </span>

              {isActive && (
                <div className="absolute -top-1 w-1/2 h-[2px] bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
