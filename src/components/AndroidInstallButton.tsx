import React, { useState } from "react";
import { Download, Smartphone, CheckCircle, Info, Share2, PlusSquare, ArrowRight } from "lucide-react";
import { usePWAInstallPrompt, isPWAInstalled } from "../utils/detectPWA";

interface AndroidInstallButtonProps {
  className?: string;
  onSuccess?: () => void;
}

export default function AndroidInstallButton({ className = "", onSuccess }: AndroidInstallButtonProps) {
  const { isInstalled, isInstallable, promptInstall } = usePWAInstallPrompt();
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (isInstallable) {
      setIsInstalling(true);
      const success = await promptInstall();
      setIsInstalling(false);
      if (success && onSuccess) {
        onSuccess();
      }
    } else {
      // Fallback: Show Android PWA instructions
      setShowAndroidGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-semibold ${className}`}>
        <CheckCircle size={16} />
        <span>คุณได้ติดตั้ง Future Artist เรียบร้อยแล้ว</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm ${className}`}
      >
        <Smartphone size={18} />
        <Download size={16} className={isInstalling ? "animate-bounce" : ""} />
        <span>{isInstalling ? "กำลังดำเนินการ..." : "ติดตั้ง Future Artist สำหรับ Android (PWA)"}</span>
      </button>

      {showAndroidGuide && (
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Info size={15} /> วิธีติดตั้ง PWA บน Chrome / Android
            </span>
            <button 
              onClick={() => setShowAndroidGuide(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300">
            หากไม่เห็นป๊อปอัพติดตั้ง สามารถทำตามขั้นตอนต่อไปนี้:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>กดปุ่มเมนู <strong>3 จุด (⋮)</strong> มุมขวาบนของเบราว์เซอร์ Chrome</li>
            <li>เลือก <strong>"เพิ่มลงในหน้าจอหลัก"</strong> (Add to Home Screen) หรือ <strong>"ติดตั้งแอป"</strong></li>
            <li>กดกดยืนยัน <strong>"ติดตั้ง"</strong> แอปจะถูกสร้างบนหน้าจอหลักทันที</li>
          </ol>
        </div>
      )}
    </div>
  );
}
