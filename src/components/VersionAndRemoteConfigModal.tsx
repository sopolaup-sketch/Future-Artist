import React, { useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertOctagon, Layers, ArrowUpCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export const LOCAL_APP_VERSION = "2.5.0";

export interface RemoteConfigData {
  maintenance: boolean;
  maintenanceMessage?: string;
  aiCoach?: boolean;
  danceMode?: boolean;
  newTraining?: boolean;
  minAppVersion?: string;
  latestAppVersion?: string;
  announcement?: string;
}

export interface VersionData {
  version: string;
  buildNumber?: number;
  minVersion?: string;
  title?: string;
  changelog?: string[];
}

interface VersionAndRemoteConfigModalProps {
  onConfigLoaded?: (config: RemoteConfigData) => void;
}

export default function VersionAndRemoteConfigModal({ onConfigLoaded }: VersionAndRemoteConfigModalProps) {
  const [hasNewVersion, setHasNewVersion] = useState<boolean>(false);
  const [remoteVersion, setRemoteVersion] = useState<VersionData | null>(null);
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfigData | null>(null);
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const checkVersionAndConfig = async () => {
      try {
        // Add cache-busting timestamp to fetch latest config from server
        const cacheBuster = `?t=${Date.now()}`;
        
        // Fetch Version Info
        const resVer = await fetch(`/version.json${cacheBuster}`).catch(() => null);
        if (resVer && resVer.ok) {
          const verData: VersionData = await resVer.json();
          setRemoteVersion(verData);

          // Compare versions (if server version is higher or different)
          if (verData.version && verData.version !== LOCAL_APP_VERSION) {
            setHasNewVersion(true);
            setShowVersionModal(true);
          }
        }

        // Fetch Remote Config Info
        const resConf = await fetch(`/remote-config.json${cacheBuster}`).catch(() => null);
        if (resConf && resConf.ok) {
          const confData: RemoteConfigData = await resConf.json();
          setRemoteConfig(confData);
          if (onConfigLoaded) {
            onConfigLoaded(confData);
          }
          if (confData.latestAppVersion && confData.latestAppVersion !== LOCAL_APP_VERSION) {
            setHasNewVersion(true);
            setShowVersionModal(true);
          }
        }
      } catch (err) {
        console.warn("[Version/RemoteConfig] Check failed:", err);
      }
    };

    checkVersionAndConfig();
  }, [onConfigLoaded]);

  const handleUpdateApp = () => {
    setIsUpdating(true);
    // Reload page to pull fresh JS/CSS assets from Vercel
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  // 1. Maintenance Screen
  if (remoteConfig?.maintenance) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d0f12] flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 text-center border border-amber-500/30 shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertOctagon size={36} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <ShieldAlert size={12} />
              <span>โหมดปรับปรุงระบบ (Maintenance Mode)</span>
            </div>
            <h2 className="text-xl font-bold text-white">ระบบกำลังปรับปรุงเซิร์ฟเวอร์</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {remoteConfig.maintenanceMessage || "ระบบ Future Artist กำลังปรับปรุงเซิร์ฟเวอร์ชั่วคราวเพื่อประสิทธิภาพสูงสุด กรุณาลองใหม่อีกครั้งในภายหลัง"}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>ลองเชื่อมต่ออีกครั้ง</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. New Version Available Modal
  if (hasNewVersion && showVersionModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="max-w-md w-full glass-panel rounded-3xl p-6 border border-blue-500/30 shadow-2xl space-y-5 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ArrowUpCircle size={22} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-semibold">
                  Update Available
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {remoteVersion?.title || "มีระบบใหม่พร้อมใช้งาน"}
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs font-bold">
              v{remoteVersion?.version || remoteConfig?.latestAppVersion || "New"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400 shrink-0" />
              <span>เวอร์ชันปัจจุบัน: <strong className="font-mono text-gray-200">v{LOCAL_APP_VERSION}</strong> → เวอร์ชันใหม่: <strong className="font-mono text-blue-300">v{remoteVersion?.version || remoteConfig?.latestAppVersion}</strong></span>
            </p>

            {remoteVersion?.changelog && remoteVersion.changelog.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold block">มีอะไรใหม่ในเวอร์ชันนี้:</span>
                <ul className="space-y-1">
                  {remoteVersion.changelog.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setShowVersionModal(false)}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs border border-white/10 transition-all cursor-pointer"
            >
              ไว้ทีหลัง
            </button>
            <button
              onClick={handleUpdateApp}
              disabled={isUpdating}
              className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />
              <span>{isUpdating ? "กำลังอัปเดต..." : "อัปเดตระบบทันที"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
