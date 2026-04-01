import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriScan",
  description: "AI-Powered Nutrition & Diet Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans selection:bg-primary-500/30">
        {children}
      </body>
    </html>
  );
}
