import React, { useState, useEffect } from "react";
import { Download, Smartphone, Laptop, CheckCircle, BookOpen, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { detectPlatform, PlatformInfo } from "../utils/detectPlatform";
import { isPWAInstalled, usePWAInstallPrompt } from "../utils/detectPWA";
import IOSInstallModal from "./IOSInstallModal";
import AndroidInstallButton from "./AndroidInstallButton";
import InstallGuide from "./InstallGuide";

interface InstallButtonProps {
  className?: string;
  showGuideButton?: boolean;
}

export default function InstallButton({ className = "", showGuideButton = true }: InstallButtonProps) {
  const [platform, setPlatform] = useState<PlatformInfo>({
    isIOS: false,
    isIPhone: false,
    isIPad: false,
    isAndroid: false,
    isDesktop: true,
    platformName: "Desktop"
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setIsInstalled(isPWAInstalled());
  }, []);

  const handleDownloadIpa = () => {
    const link = document.createElement("a");
    link.href = "/downloads/FutureArtist.ipa";
    link.download = "FutureArtist.ipa";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If already installed in standalone mode
  if (isInstalled) {
    return (
      <div className={`p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-200">คุณได้ติดตั้ง Future Artist แล้ว</h4>
            <p className="text-xs text-emerald-400/80 mt-0.5">แอปพลิเคชันทำงานในโหมด Standalone สมบูรณ์แบบ</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
          Installed
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Platform-Specific Main Install Trigger */}
      {platform.isIOS ? (
        <div className="space-y-2">
          <button
            onClick={() => setIsIOSModalOpen(true)}
            className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all text-sm group"
          >
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-indigo-200" />
              <div className="text-left">
                <div className="font-bold">ติดตั้ง Future Artist สำหรับ iOS</div>
                <div className="text-[11px] font-normal text-indigo-100/80">
                  รองรับ iPhone & iPad (ติดตั้งผ่าน ESign / IPA)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl group-hover:bg-white/20 transition-all text-xs">
              <span>ดาวน์โหลด</span>
              <Download size={14} />
            </div>
          </button>
        </div>
      ) : platform.isAndroid ? (
        <AndroidInstallButton />
      ) : (
        /* Desktop Fallback Options */
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Laptop size={16} className="text-indigo-400" /> ติดตั้ง Future Artist
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              Desktop Detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setIsIOSModalOpen(true)}
              className="flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-left transition-all text-xs text-slate-200"
            >
              <div>
                <div className="font-bold text-indigo-300">ดาวน์โหลดเวอร์ชัน iOS</div>
                <div className="text-[10px] text-slate-400">สำหรับ iPhone / ESign (.ipa)</div>
              </div>
              <Download size={15} className="text-indigo-400" />
            </button>

            <AndroidInstallButton />
          </div>
        </div>
      )}

      {/* Auxiliary Link for Full Guide */}
      {showGuideButton && (
        <button
          onClick={() => setIsGuideOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
        >
          <BookOpen size={14} />
          <span>ดูคู่มือการติดตั้งแอปพลิเคชันอย่างละเอียด</span>
          <ChevronRight size={13} />
        </button>
      )}

      {/* iOS Modal */}
      <IOSInstallModal
        isOpen={isIOSModalOpen}
        onClose={() => setIsIOSModalOpen(false)}
        onDownloadIpa={handleDownloadIpa}
      />

      {/* Standalone Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <InstallGuide 
              onClose={() => setIsGuideOpen(false)} 
              onDownloadIpa={handleDownloadIpa} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
