import React, { useState } from "react";
import { X, Smartphone, Download, BookOpen, CheckCircle, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import InstallGuide from "./InstallGuide";

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadIpa?: () => void;
}

export default function IOSInstallModal({ isOpen, onClose, onDownloadIpa }: IOSInstallModalProps) {
  const [showFullGuide, setShowFullGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownloadIpa) {
      onDownloadIpa();
    } else {
      // Create element to trigger direct download
      const link = document.createElement("a");
      link.href = "/downloads/FutureArtist.ipa";
      link.download = "FutureArtist.ipa";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {showFullGuide ? (
          <div className="p-2 max-h-[85vh] overflow-y-auto">
            <InstallGuide 
              onClose={() => setShowFullGuide(false)} 
              onDownloadIpa={handleDownload} 
            />
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Smartphone size={22} />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  วิธีที่แนะนำสำหรับ iOS
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  ติดตั้ง Future Artist บน iPhone
                </h3>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="mt-5 p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  วิธีที่แนะนำ (5 ขั้นตอนง่ายๆ)
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> ESign Sideload
                </span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span><strong>ติดตั้ง ESign</strong> (หากยังไม่มีในเครื่อง)</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span><strong>ดาวน์โหลด FutureArtist.ipa</strong> ลงในอุปกรณ์</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span><strong>เปิดไฟล์ด้วย ESign</strong> และนำเข้าแอป</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    4
                  </span>
                  <span>กด <strong>Signature</strong> (เซ็นสัญญา Certificate)</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    5
                  </span>
                  <span>กด <strong>Install</strong> เพื่อเสร็จสิ้นการติดตั้ง</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all text-sm"
              >
                <Download size={18} />
                <span>[ ดาวน์โหลดแอป (.ipa) ]</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowFullGuide(true)}
                  className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold py-2.5 px-3 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 transition-all text-xs"
                >
                  <BookOpen size={15} />
                  <span>[ วิธีติดตั้ง ]</span>
                </button>

                <a
                  href="https://esign.yy338.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition-all text-xs"
                >
                  <ExternalLink size={15} />
                  <span>เว็บ ESign</span>
                </a>
              </div>
            </div>

            {/* Subtext */}
            <p className="mt-4 text-[11px] text-center text-slate-400">
              รองรับ iPhone & iPad ทุกรุ่น (iOS 14.0+)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
