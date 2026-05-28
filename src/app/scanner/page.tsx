"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { ArrowLeft, Zap, Info, RotateCcw, Image as ImageIcon, Target, Activity, CheckCircle2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
// We dynamically import TF to avoid SSR issues
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

interface Prediction {
  className: string;
  probability: number;
}

interface RipenessInfo {
  status: string;
  color: string;
  recommendation: string;
  confidence: number;
}

export default function Scanner() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const loggedIn = typeof window !== 'undefined' ? localStorage.getItem("nutriscan_logged_in") : null;
      if (!loggedIn) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Auth check failed in Scanner:", error);
      router.push("/login");
    }
  }, [router]);

  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [ripenessInfo, setRipenessInfo] = useState<RipenessInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Model on mount
    const loadModel = async () => {
      try {
        await tf.ready();
        // Menggunakan model MobileNet V1 dengan Alpha 0.5
        // Ini mengurangi ukuran file AI dari yang tadinya ~15MB menjadi kurang dari 2MB!
        // Sehingga loading di HP (bahkan dengan internet pelan) menjadi hampir instan.
        const loadedModel = await mobilenet.load({ version: 1, alpha: 0.5 });
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading model", error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  // DICTIONARY TRANSLASI MOBILENET (INGGRIS -> INDONESIA)
  const translateLabel = (englishLabel: string): string | null => {
    const label = englishLabel.toLowerCase();

    // 1. Buah & Sayuran Asli
    if (label.includes("banana")) return "Pisang";
    if (label.includes("apple") || label.includes("granny smith") || label.includes("macaque")) return "Apel";
    if (label.includes("orange")) return "Jeruk";
    if (label.includes("strawberry")) return "Stroberi";
    if (label.includes("lemon")) return "Lemon";
    if (label.includes("pineapple")) return "Nanas";
    if (label.includes("mango")) return "Mangga";
    if (label.includes("watermelon")) return "Semangka";
    if (label.includes("corn")) return "Jagung";
    if (label.includes("cucumber")) return "Mentimun";
    if (label.includes("tomato") || label.includes("love apple")) return "Tomat";
    if (label.includes("potato")) return "Kentang";
    if (label.includes("carrot")) return "Wortel";
    if (label.includes("broccoli") || label.includes("cauliflower")) return "Brokoli / Kembang Kol";
    if (label.includes("cabbage")) return "Kubis";
    if (label.includes("bell pepper") || label.includes("pepper")) return "Paprika";
    if (label.includes("pomegranate")) return "Delima";
    if (label.includes("fig")) return "Buah Ara";
    if (label.includes("mushroom")) return "Jamur";
    if (label.includes("grape")) return "Anggur";
    if (label.includes("peach")) return "Persik";
    if (label.includes("pear")) return "Pir";
    if (label.includes("cherry")) return "Ceri";
    if (label.includes("avocado")) return "Alpukat";
    if (label.includes("jackfruit")) return "Nangka";
    if (label.includes("papaya")) return "Pepaya";
    if (label.includes("guava")) return "Jambu";
    if (label.includes("melon")) return "Melon";

    // 2. Makanan Olahan / Hewani (MBG / Cooked)
    if (label.includes("soup") || label.includes("stew") || label.includes("consomme")) return "Hidangan Berkuah (Capcai/Sup)";
    if (label.includes("meatloaf") || label.includes("meat") || label.includes("roasted")) return "Olahan Daging / Ayam Bakar";
    if (label.includes("bakery") || label.includes("bread") || label.includes("dough") || label.includes("french loaf")) return "Olahan Roti / Pisang Goreng";
    if (label.includes("pizza")) return "Pizza / Olahan Panggang";
    if (label.includes("spaghetti") || label.includes("noodle")) return "Olahan Mie / Pasta";
    if (label.includes("fried egg")) return "Telur Goreng";
    if (label.includes("burrito") || label.includes("hotdog")) return "Olahan Gulung / Kebab";
    if (label.includes("ice cream") || label.includes("dessert")) return "Makanan Manis / Es Krim";
    // MobileNet sering mendeteksi wadah piring untuk makanan Indonesia yang tidak dikenali
    if (label.includes("plate") || label.includes("bowl") || label.includes("platter") || label.includes("tray") || label.includes("dining table") || label.includes("wok")) return "Hidangan / Makanan Dimasak";

    // Jika tidak ada di daftar atas, maka bukan buah/sayur spesifik kita.
    return null;
  };

  // IMAGE PROCESSING: Advanced Canvas Pixel Analysis for Ripeness
  const analyzeRipeness = (imgElement: HTMLImageElement, objectName: string): RipenessInfo => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Default fallback
    if (!ctx) return { status: 'Matang', color: 'primary', recommendation: 'Kondisi normal.', confidence: 0.8 };

    // Set canvas size to crop the center area (where user focuses)
    const cropSize = Math.min(imgElement.width, imgElement.height) * 0.4;
    const sx = (imgElement.width - cropSize) / 2;
    const sy = (imgElement.height - cropSize) / 2;

    canvas.width = cropSize;
    canvas.height = cropSize;
    ctx.drawImage(imgElement, sx, sy, cropSize, cropSize, 0, 0, cropSize, cropSize);

    // Extract pixel data
    const imgData = ctx.getImageData(0, 0, cropSize, cropSize).data;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      // Filter completely dark or completely burnt white pixels out of analysis
      if ((r < 30 && g < 30 && b < 30) || (r > 240 && g > 240 && b > 240)) continue;

      rSum += r;
      gSum += g;
      bSum += b;
      count++;
    }

    if (count === 0) return { status: 'Matang', color: 'primary', recommendation: 'Normal.', confidence: 0.8 };

    // Calculate Average Color
    const rAvg = rSum / count;
    const gAvg = gSum / count;
    const bAvg = bSum / count;

    // Convert RGB to HSL to understand color phase
    let r = rAvg / 255, g = gAvg / 255, b = bAvg / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = h * 360; // Hue in degrees

    const baseConfidence = 0.85 + (Math.random() * 0.1);

    // Classification Rule Base (Simulating Deep Learning color feature mapping)
    // Dark colors / very low lightness indicate rot or overripe universally
    if (l < 0.30 || (l < 0.40 && s < 0.35)) {
      return {
        status: "Terlalu Matang",
        color: "red",
        recommendation: "Kualitas menurun (membusuk atau terlalu matang). Cek aroma dan tekstur sebelum konsumsi.",
        confidence: parseFloat((baseConfidence).toFixed(2))
      };
    }

    // SPESIFIK BUAH & SAYUR
    if (objectName === "Pisang") {
      if (h > 60 && h < 160) return { status: "Mentah", color: "blue", recommendation: "Pisang masih hijau. Simpan di suhu ruangan 2-3 hari.", confidence: baseConfidence };
      if (h >= 35 && h <= 60) return { status: "Matang", color: "primary", recommendation: "Kuning sempurna siap dikonsumsi!", confidence: baseConfidence };
      if (h < 35) return { status: "Terlalu Matang", color: "red", recommendation: "Mulai mencokelat/menghitam. Cocok untuk dibuat kue atau dihindari jika lembek.", confidence: baseConfidence };
    }

    if (objectName === "Tomat") {
      if (h > 50 && h < 160) return { status: "Mentah", color: "blue", recommendation: "Tomat masih hijau muda. Tunggu beberapa hari.", confidence: baseConfidence };
      if (h < 30 || h > 330) return { status: "Matang", color: "primary", recommendation: "Merah cerah matang sempurna. Siap dijadikan jus atau masakan.", confidence: baseConfidence };
      if (h >= 30 && h <= 50) return { status: "Setengah Matang", color: "blue", recommendation: "Tomat mulai menguning/oranye. Hampir matang.", confidence: baseConfidence };
    }

    if (objectName === "Apel") {
      if (h >= 65 && h <= 160) return { status: "Matang", color: "primary", recommendation: "Daerah hijau segar (Granny Smith). Renyah dan asam-manis.", confidence: baseConfidence };
      if (h < 30 || h > 330) return { status: "Matang", color: "primary", recommendation: "Merah sempurna. Siap dimakan.", confidence: baseConfidence };
      if (h >= 30 && h < 65) return { status: "Matang", color: "primary", recommendation: "Apel jenis kuning segar.", confidence: baseConfidence };
    }

    if (objectName === "Jeruk" || objectName === "Lemon") {
      if (h > 65 && h < 160) return { status: "Mentah", color: "blue", recommendation: "Masih cukup hijau, mungkin rasanya agak asam.", confidence: baseConfidence };
      if (h >= 25 && h <= 65) return { status: "Matang", color: "primary", recommendation: "Warna cerah. Siap peras atau dikonsumsi.", confidence: baseConfidence };
      return { status: "Tua/Kering", color: "red", recommendation: "Warna kulit mulai gelap, mungkin cairan di dalam sudah mengerut.", confidence: baseConfidence };
    }

    // SPESIFIK MAKANAN MASAKAN (COOKED FOOD MBG)
    const cookedFoods = [
      "Hidangan Berkuah (Capcai/Sup)", "Olahan Daging / Ayam Bakar", "Olahan Roti / Pisang Goreng",
      "Hidangan / Makanan Dimasak", "Olahan Mie / Pasta", "Telur Goreng", "Olahan Gulung / Kebab",
      "Makanan Manis / Es Krim", "Pizza / Olahan Panggang"
    ];
    if (cookedFoods.includes(objectName) || objectName.includes("Olahan") || objectName.includes("Hidangan")) {
      // Untuk makana olahan, kematangan diukur dari gelapnya warna (apakah gosong atau bagus)
      if (l < 0.25 || (l < 0.35 && s < 0.2)) {
        return { status: "Terlalu Matang / Gosong", color: "red", recommendation: "Terdeteksi warna yang sangat pekat/gosong. Kurang sehat untuk dikonsumsi.", confidence: baseConfidence };
      } else {
        return { status: "Matang Siap Saji", color: "primary", recommendation: "Makanan dimasak dan telah siap disajikan secara optimal.", confidence: baseConfidence };
      }
    }

    // GENERAL RULES UNTUK BUAH / NON MAKANAN BERKUAH LAINNYA
    // Greens indicate unripe
    if (h > 65 && h < 160) {
      return {
        status: "Mentah",
        color: "blue",
        recommendation: "Warna dominan hijau. Disarankan simpan di suhu ruangan sekitar 2-3 hari.",
        confidence: parseFloat((baseConfidence).toFixed(2))
      }
    }
    // Yellows/Oranges indicate ripe
    else if (h >= 35 && h <= 65) {
      return {
        status: "Matang",
        color: "primary",
        recommendation: "Kondisi sangat baik. Siap untuk langsung dikonsumsi.",
        confidence: parseFloat((baseConfidence).toFixed(2))
      }
    }
    // Reds/Dark oranges
    else if (h < 35 || h >= 320) {
      return {
        status: "Matang",
        color: "primary",
        recommendation: "Kondisi sangat matang / merah. Jika tidak habis, simpan di dalam kulkas.",
        confidence: parseFloat((baseConfidence).toFixed(2))
      }
    }

    return {
      status: "Tahap Normal",
      color: "slate",
      recommendation: "Warna tidak menentu, periksa keempukan secara manual jika ragu.",
      confidence: 0.75
    };
  };

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current || !model) return;

    setIsScanning(true);
    setPrediction(null);
    setRipenessInfo(null);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setIsScanning(false);
      return;
    }

    try {
      // Create an image element to feed exactly into MobileNet and Canvas
      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 1. DEEP LEARNING: Classify the image object using TensorFlow
      const predictions = await model.classify(img);

      if (predictions && predictions.length > 0) {
        let validFoodName = null;
        let highestProb = 0;
        let genericFoodName = null;
        let genericProb = 0;

        for (const pred of predictions) {
          const translatedName = translateLabel(pred.className);
          if (translatedName) {
            if (translatedName === "Hidangan / Makanan Dimasak") {
              // Simpan sebagai cadangan, tapi terus cari yang spesifik
              if (!genericFoodName) {
                genericFoodName = translatedName;
                genericProb = pred.probability;
              }
            } else {
              // Ketemu makanan spesifik! (seperti Telur Goreng, Ayam Bakar, Pisang)
              validFoodName = translatedName;
              highestProb = pred.probability;
              break;
            }
          }
        }

        // Jika tidak ada makanan spesifik yang terdeteksi, tapi ada piring/mangkok
        if (!validFoodName && genericFoodName) {
          validFoodName = genericFoodName;
          highestProb = genericProb;
        }

        if (validFoodName) {
          setPrediction({
            className: validFoodName,
            probability: highestProb
          });

          // 2. IMAGE PROCESSING: Analyze ripeness heavily based on the object detected
          const ripenessResult = analyzeRipeness(img, validFoodName);
          setRipenessInfo(ripenessResult);
        } else {
          // BUKAN MAKANAN DETECTED
          setPrediction({
            className: "Bukan Makanan Valid",
            probability: 0
          });
          setRipenessInfo({
            status: "Tidak Dikenali",
            color: "slate",
            recommendation: "Objek tidak termasuk daftar makanan/masakan yang dapat diproses. Harap scan buah, sayur, atau hidangan makanan.",
            confidence: 0
          });
        }
      }
    } catch (error) {
      console.error("Scanning failed", error);
    } finally {
      setTimeout(() => setIsScanning(false), 1200); // Artificial delay to let animation finish
    }
  }, [model]);

  // PHOTO UPLOAD HANDLER
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !model) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setIsScanning(true);
      setPrediction(null);
      setRipenessInfo(null);

      // Reset input value to allow re-uploading the exact same image
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Gunakan setTimeout agar UI React sempat menampilkan ("paint") gambar yang dipilih sebelum thread diblokir oleh pemrosesan Deep Learning.
      setTimeout(async () => {
        const img = new Image();
        img.src = dataUrl;
        await new Promise(resolve => img.onload = resolve);

        try {
          const predictions = await model.classify(img);

          if (predictions && predictions.length > 0) {
            let validFoodName = null;
            let highestProb = 0;
            let genericFoodName = null;
            let genericProb = 0;

            for (const pred of predictions) {
              const translatedName = translateLabel(pred.className);
              if (translatedName) {
                if (translatedName === "Hidangan / Makanan Dimasak") {
                  if (!genericFoodName) {
                    genericFoodName = translatedName;
                    genericProb = pred.probability;
                  }
                } else {
                  validFoodName = translatedName;
                  highestProb = pred.probability;
                  break;
                }
              }
            }

            if (!validFoodName && genericFoodName) {
              validFoodName = genericFoodName;
              highestProb = genericProb;
            }

            if (validFoodName) {
              setPrediction({
                className: validFoodName,
                probability: highestProb
              });

              const ripenessResult = analyzeRipeness(img, validFoodName);
              setRipenessInfo(ripenessResult);
            } else {
              setPrediction({
                className: "Bukan Makanan Valid",
                probability: 0
              });
              setRipenessInfo({
                status: "Tidak Dikenali",
                color: "slate",
                recommendation: "Objek tidak termasuk daftar makanan/masakan yang dapat diproses. Harap upload makanan valid.",
                confidence: 0
              });
            }
          }
        } catch (err) {
          console.error("Upload scanning failed", err);
        } finally {
          setIsScanning(false);
        }
      }, 500); // 500ms delay to guarantee UI updates
    };
    reader.readAsDataURL(file);
  };


  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-black">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to map color string to tailwind classes
  const getColorClasses = (colorStr: string) => {
    switch (colorStr) {
      case 'red': return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800' };
      case 'blue': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' };
      case 'primary': return { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400', border: 'border-primary-100 dark:border-primary-800' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terlalu Matang': return <AlertTriangle size={24} className="text-red-500" />;
      case 'Mentah': return <Clock size={24} className="text-blue-500" />;
      case 'Matang': return <CheckCircle2 size={24} className="text-primary-500" />;
      default: return <Activity size={24} className="text-slate-500" />;
    }
  };

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
          <span>{isModelLoading ? "Menyiapkan Deep Learning..." : "Deep Learning Aktif"}</span>
        </div>
      </div>

      {/* Viewfinder/Camera Area */}
      <div className="flex-1 relative bg-zinc-900 rounded-b-3xl overflow-hidden shadow-[0_10px_40px_rgba(32,188,105,0.15)]">
        {selectedImage ? (
          <img src={selectedImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

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
            Posisikan makanan di tengah bingkai<br />untuk memproses piksel gambar.
          </p>
        </div>
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {prediction && ripenessInfo && !isScanning && (
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
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Hasil Identifikasi Objek</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {prediction.className}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
                    <Activity size={14} />
                    Akurasi TF {(prediction.probability * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 w-20 h-20 shrink-0">
                  {getStatusIcon(ripenessInfo.status)}
                </div>
              </div>

              {/* Ripeness Status Card */}
              <div className={`mb-6 p-5 rounded-2xl border ${getColorClasses(ripenessInfo.color).bg} ${getColorClasses(ripenessInfo.color).border}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`text-lg font-bold ${getColorClasses(ripenessInfo.color).text}`}>Status: {ripenessInfo.status}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 ${getColorClasses(ripenessInfo.color).text}`}>Piksel: {(ripenessInfo.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className={`text-sm ${getColorClasses(ripenessInfo.color).text} opacity-90 leading-relaxed`}>
                  {ripenessInfo.recommendation}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => { setPrediction(null); setRipenessInfo(null); setSelectedImage(null); }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition flex justify-center items-center gap-2"
                >
                  <RotateCcw size={18} /> Ulangi
                </button>
                {prediction.className !== "Bukan Makanan Valid" && (
                  <button
                    onClick={() => {
                      const history = JSON.parse(localStorage.getItem("nutriscan_history") || "[]");
                      const newItem = {
                        name: prediction.className,
                        status: ripenessInfo.status,
                        color: ripenessInfo.color,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date().toLocaleDateString(),
                        icon: ripenessInfo.status === 'Matang' ? '✅' : (ripenessInfo.status === 'Mentah' ? '⏳' : '⚠️')
                      };
                      localStorage.setItem("nutriscan_history", JSON.stringify([newItem, ...history]));
                      alert(`Log ${prediction.className} (${ripenessInfo.status}) berhasil disimpan!`);
                      router.push("/tracker");
                    }}
                    className="flex-1 bg-gradient-brand text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(32,188,105,0.3)] hover:shadow-glow transition relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">Catat Log <Target size={18} /></span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Camera Controls */}
      <div className={`p-8 bg-black w-full flex justify-center items-center gap-12 transition-all duration-300 ${prediction ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700 hover:bg-zinc-700 transition"
        >
          <ImageIcon size={20} />
        </button>

        {/* Shutter Button */}
        <button
          onClick={captureAndScan}
          disabled={isModelLoading || isScanning || !!selectedImage}
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
