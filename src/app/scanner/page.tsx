"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { ArrowLeft, Zap, Info, RotateCcw, Image as ImageIcon, Target } from "lucide-react";
import Link from "next/link";
// We dynamically import TF to avoid SSR issues
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

interface Prediction {
  className: string;
  probability: number;
}

export default function Scanner() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("nutriscan_logged_in");
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<{ cal: number; pro: number; carb: number; fat: number } | null>(null);

  useEffect(() => {
    // Load Model on mount
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading model", error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const getDummyNutrition = (foodName: string) => {
    // Simple pseudo-random mock logic based on the string length/characters for demonstration
    // In production, this would query Firebase/Edamam/FatSecret API
    const hash = foodName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const absHash = Math.abs(hash);
    
    return {
      cal: 100 + (absHash % 400),
      pro: 5 + (absHash % 30),
      carb: 10 + (absHash % 50),
      fat: 2 + (absHash % 25),
    };
  };

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current || !model) return;

    setIsScanning(true);
    setPrediction(null);
    setNutritionInfo(null);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setIsScanning(false);
      return;
    }

    try {
      // Create an image element to feed exactly into MobileNet
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Classify the image
      const predictions = await model.classify(img);
      
      if (predictions && predictions.length > 0) {
        // Find best match, replace comma-separated synonyms with main word
        const bestPred = predictions[0];
        const mainClass = bestPred.className.split(',')[0].trim();
        
        setPrediction({
           className: mainClass.charAt(0).toUpperCase() + mainClass.slice(1),
           probability: bestPred.probability
        });
        setNutritionInfo(getDummyNutrition(mainClass));
      }
    } catch (error) {
      console.error("Scanning failed", error);
    } finally {
      setTimeout(() => setIsScanning(false), 1000); // Artificial delay to let animation finish
    }
  }, [model]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-black">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white relative overflow-hidden">
      {/* Top Nav */}
      <div className="absolute top-0 w-full z-50 flex items-center justify-between p-6">
        <Link href="/">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform">
            <ArrowLeft size={24} className="text-white" />
          </div>
        </Link>
        <div className="flex bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-semibold text-primary-400 gap-2 items-center shadow-lg">
          {isModelLoading ? (
             <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
          ) : (
             <Zap size={16} className="text-primary-500 fill-primary-500" />
          )}
          <span>{isModelLoading ? "Memuat AI..." : "AI Ready"}</span>
        </div>
      </div>

      {/* Viewfinder/Camera Area */}
      <div className="flex-1 relative bg-zinc-900 rounded-b-3xl overflow-hidden shadow-[0_10px_40px_rgba(32,188,105,0.15)]">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Framing Overlay overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
            {/* Darken surrounding area */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            
            {/* Clear center focus square */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 relative bg-transparent z-20">
               {/* Corner Brackets */}
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl shadow-glow"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl shadow-glow"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl shadow-glow"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl shadow-glow"></div>

               {/* Scanning Laser Animation */}
               {isScanning && (
                 <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute left-0 right-0 h-1 bg-primary-500 shadow-[0_0_20px_#20bc69] z-30" 
                 />
               )}
            </div>

            <p className="mt-8 text-white/80 font-medium tracking-wide z-20 text-center px-8">
              Posisikan makanan di tengah bingkai<br/>untuk deteksi akurat.
            </p>
        </div>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {prediction && nutritionInfo && !isScanning && (
          <motion.div 
             initial={{ y: "100%", opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: "100%", opacity: 0 }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             className="absolute bottom-0 w-full z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]"
          >
             <div className="p-8">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                
                <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                        {prediction.className}
                     </h3>
                     <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold">
                        <Zap size={14} className="fill-primary-500" /> 
                        Akurasi {(prediction.probability * 100).toFixed(1)}%
                     </div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-700">
                      <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{nutritionInfo.cal}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kkal</p>
                   </div>
                </div>

                {/* Macro Nutrients */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
                     <p className="font-black text-blue-600 dark:text-blue-400 text-xl">{nutritionInfo.pro}g</p>
                     <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider">Protein</p>
                   </div>
                   <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl text-center">
                     <p className="font-black text-orange-600 dark:text-orange-400 text-xl">{nutritionInfo.carb}g</p>
                     <p className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider">Karbo</p>
                   </div>
                   <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-center">
                     <p className="font-black text-red-600 dark:text-red-400 text-xl">{nutritionInfo.fat}g</p>
                     <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider">Lemak</p>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setPrediction(null); setNutritionInfo(null); }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition flex justify-center items-center gap-2"
                  >
                    <RotateCcw size={18} /> Ulangi
                  </button>
                  <button 
                    onClick={() => {
                      const history = JSON.parse(localStorage.getItem("nutriscan_history") || "[]");
                      const newItem = {
                        name: prediction.className,
                        cal: nutritionInfo.cal,
                        pro: nutritionInfo.pro,
                        carb: nutritionInfo.carb,
                        fat: nutritionInfo.fat,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date().toLocaleDateString(),
                        icon: "🍴" 
                      };
                      localStorage.setItem("nutriscan_history", JSON.stringify([newItem, ...history]));
                      alert(`${prediction.className} berhasil disimpan ke Tracker!`);
                      router.push("/tracker");
                    }}
                    className="flex-1 bg-gradient-brand text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(32,188,105,0.3)] hover:shadow-glow transition relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">Simpan Makanan <Target size={18}/></span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Camera Controls */}
      <div className={`p-8 bg-black w-full flex justify-center items-center gap-12 transition-all duration-300 ${prediction ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>
         <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700 hover:bg-zinc-700 transition">
            <ImageIcon size={20} />
         </button>

         {/* Shutter Button */}
         <button 
            onClick={captureAndScan}
            disabled={isModelLoading || isScanning}
            className="w-20 h-20 rounded-full border-[6px] border-primary-500 p-1 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
         >
            <div className={`bg-primary-500 rounded-full w-full h-full shadow-[0_0_20px_#20bc69] ${isScanning ? 'animate-pulse scale-90' : 'scale-100'} transition-transform`} />
         </button>

         <Link href="/tracker">
            <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700 hover:bg-zinc-700 transition">
               <Info size={20} />
            </button>
         </Link>
      </div>

    </div>
  );
}
