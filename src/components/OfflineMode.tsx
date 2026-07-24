import React from "react";
import { WifiOff, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react";

interface OfflineModeProps {
  onRetry: () => void;
  isRetrying?: boolean;
  message?: string;
}

export default function OfflineMode({ onRetry, isRetrying = false, message }: OfflineModeProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f12]/95 backdrop-blur-xl flex items-center justify-center p-4 pt-safe pb-safe">
      <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 text-center border border-rose-500/20 shadow-2xl space-y-6 animate-fade-in">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <WifiOff size={40} className="animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-rose-500 text-white">
            <AlertCircle size={14} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            <ShieldAlert size={12} />
            <span>ไม่มีการเชื่อมต่ออินเทอร์เน็ต (Offline Mode)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            ไม่สามารถเชื่อมต่อระบบ Vercel ได้
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {message || "โปรดตรวจสอบการเชื่อมต่อ Wi-Fi หรือสัญญาณอินเทอร์เน็ตบนมือถือของคุณเพื่อโหลดแอป Future Artist เวอร์ชันล่าสุด"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs text-gray-400 space-y-1.5">
          <div className="flex items-center gap-2 text-gray-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>แนะนำขั้นตอนการแก้ไข:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-gray-400">
            <li>ตรวจสอบสัญญาณ Wi-Fi หรือ Cellular Data</li>
            <li>ลองปิดแล้วเปิดสวิตช์โหมดเครื่องบิน (Airplane Mode)</li>
            <li>กดปุ่ม "ลองอีกครั้ง" ด้านล่างเพื่อโหลดระบบใหม่</li>
          </ul>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
          <span>{isRetrying ? "กำลังเชื่อมต่อระบบ..." : "ลองอีกครั้ง (Retry)"}</span>
        </button>
      </div>
    </div>
  );
}
