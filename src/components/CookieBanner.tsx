import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Check, Settings, X, Info, Database, BarChart3, Bell, Lock, RefreshCw } from "lucide-react";
import { playChime } from "../utils/audio";

export interface CookiePreferences {
  accepted: boolean;
  timestamp: string;
  necessary: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "future_artist_cookie_consent_v1";

const DEFAULT_PREFERENCES: CookiePreferences = {
  accepted: false,
  timestamp: "",
  necessary: true,
  analytics: true,
  functional: true,
  marketing: true
};

interface CookieBannerProps {
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  forceOpenModal = false,
  onCloseModal
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to read cookie consent state:", e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [showBanner, setShowBanner] = useState<boolean>(() => !preferences.accepted);
  const [showModal, setShowModal] = useState<boolean>(forceOpenModal);
  const [activeTab, setActiveTab] = useState<"preferences" | "policy">("preferences");

  useEffect(() => {
    if (forceOpenModal) {
      setShowModal(true);
    }
  }, [forceOpenModal]);

  const savePreferences = (updated: CookiePreferences) => {
    const finalPref = {
      ...updated,
      accepted: true,
      necessary: true,
      timestamp: new Date().toISOString()
    };
    setPreferences(finalPref);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPref));
    } catch (e) {
      console.warn("Failed to save cookie consent state:", e);
    }
    setShowBanner(false);
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  const handleAcceptAll = () => {
    playChime("click");
    savePreferences({
      accepted: true,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true
    });
  };

  const handleAcceptNecessary = () => {
    playChime("click");
    savePreferences({
      accepted: true,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false
    });
  };

  const handleSaveCustom = () => {
    playChime("click");
    savePreferences(preferences);
  };

  const handleToggleCategory = (key: keyof Omit<CookiePreferences, "accepted" | "timestamp" | "necessary">) => {
    playChime("click");
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      {/* 1. Bottom Floating Cookie Consent Banner */}
      {showBanner && !showModal && (
        <div 
          id="cookie-consent-banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#181825]/95 border border-purple-500/30 backdrop-blur-xl rounded-2xl shadow-2xl p-5 text-white animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shrink-0 shadow-md">
              <Cookie size={22} className="animate-spin-slow" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-white">นโยบายคุกกี้และการจัดเก็บข้อมูล</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  PDPA & Privacy
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                เราใช้คุกกี้และเทคโนโลยีการจัดเก็บข้อมูลเพื่อบันทึกสถานะการฝึกซ้อม เชื่อมต่อฐานข้อมูล Cloud (Firebase: <span className="font-mono text-purple-300">spy-for</span>) และวิเคราะห์สถิติเพื่อพัฒนาแอปพลิเคชัน
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2">
            <button
              id="cookie-accept-all-btn"
              onClick={handleAcceptAll}
              className="w-full sm:flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>ยอมรับทั้งหมด</span>
            </button>
            <button
              id="cookie-necessary-only-btn"
              onClick={handleAcceptNecessary}
              className="w-full sm:w-auto py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              คุกกี้จำเป็นเท่านั้น
            </button>
            <button
              id="cookie-settings-btn"
              onClick={() => {
                playChime("click");
                setShowModal(true);
              }}
              className="w-full sm:w-auto py-2 px-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium text-xs rounded-xl border border-purple-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Settings size={13} />
              <span>ตั้งค่า</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Detailed Cookie Preference Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-gradient-to-b from-[#181825] to-[#11111b] border border-purple-500/30 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl relative overflow-hidden text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl">
                  <Cookie size={24} />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    ศูนย์จัดการคุกกี้และความเป็นส่วนตัว
                  </h3>
                  <p className="text-xs text-purple-200/80 font-medium">
                    Cookie & Privacy Preference Management Center
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playChime("click");
                  setShowModal(false);
                  if (onCloseModal) onCloseModal();
                }}
                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  playChime("click");
                  setActiveTab("preferences");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "preferences"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Settings size={14} />
                <span>การตั้งค่าคุกกี้ (Preferences)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playChime("click");
                  setActiveTab("policy");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "policy"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Info size={14} />
                <span>นโยบายคุกกี้ (Cookie Policy)</span>
              </button>
            </div>

            {/* Tab 1: Preferences Selection */}
            {activeTab === "preferences" ? (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {/* 1. Necessary Cookies */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
                      <Lock size={16} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-mono">
                          เสมอ
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                        จำเป็นสำหรับการทำงานพื้นฐานของแอปพลิเคชัน การรักษาความปลอดภัย และการซิงค์ข้อมูลลงฐานข้อมูล Firebase (<span className="font-mono text-purple-300">spy-for.firebaseapp.com</span>)
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold shrink-0">
                    เปิดใช้งาน
                  </div>
                </div>

                {/* 2. Analytics Cookies */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl shrink-0">
                      <BarChart3 size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">คุกกี้เพื่อการวิเคราะห์ (Analytics & Performance)</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                        วัดผลสถิติการใช้งาน Google Analytics (<span className="font-mono text-blue-300">G-4CZPM05HR4</span>) เพื่อนำมาปรับปรุงฟีเจอร์และประสิทธิภาพแอป
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCategory("analytics")}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                      preferences.analytics ? "bg-purple-600" : "bg-white/10"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      preferences.analytics ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* 3. Functional Cookies */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
                      <Database size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">คุกกี้เพื่อฟังก์ชันและการจดจำ (Functional Preferences)</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                        จดจำการตั้งค่าโหมดการซ้อม เสียงแจ้งเตือน ธีมหน้าจอ และแคชคำนวนเกรดประจำสัปดาห์
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCategory("functional")}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                      preferences.functional ? "bg-purple-600" : "bg-white/10"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      preferences.functional ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* 4. Marketing & Notification Cookies */}
                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-xl shrink-0">
                      <Bell size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">คุกกี้สำหรับการแจ้งเตือนพุช (Push Notifications & OneSignal)</span>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-light">
                        อนุญาตให้รับแจ้งเตือนเตือนสติการทำภารกิจรายวันและการอัปเดตสตรีคผ่าน Service Worker & Web Push
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCategory("marketing")}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                      preferences.marketing ? "bg-purple-600" : "bg-white/10"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      preferences.marketing ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            ) : (
              /* Tab 2: Policy Explanation */
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 text-xs text-gray-300 leading-relaxed bg-black/30 border border-white/10 p-4 rounded-2xl font-light">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-purple-400" />
                    <span>นโยบายความเป็นส่วนตัวและการจัดเก็บข้อมูล</span>
                  </h4>
                  <p>
                    แอปพลิเคชัน Future Artist ให้ความสำคัญสูงสุดต่อสิทธิ์ความเป็นส่วนตัวของคุณ ข้อมูลทั้งหมดของคุณจะถูกจัดเก็บอย่างปลอดภัยผ่าน Firebase Firestore Database (<span className="font-mono text-purple-300">spy-for</span>)
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                  <h5 className="font-bold text-white">การใช้ LocalStorage และ Session:</h5>
                  <p>
                    เราใช้ LocalStorage บนเบราว์เซอร์ของคุณเพื่อสำรองสแนปชอตข้อมูลการซ้อม บันทึกไดอารี่ และความก้าวหน้าตราเกียรติยศ เพื่อให้แอปสามารถทำงานในโหมดออฟไลน์ได้โดยไม่สูญหาย
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                  <h5 className="font-bold text-white">สิทธิ์การยกเลิกและการถอนความยินยอม:</h5>
                  <p>
                    คุณสามารถเข้ามาปรับเปลี่ยน หรือยกเลิกความยินยอมการใช้งานคุกกี้และคลังจัดเก็บข้อมูลเมื่อใดก็ได้ผ่านเมนู <span className="font-bold text-purple-300">"ตั้งค่า (Settings)"</span> ในแอปพลิเคชัน
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} />
                <span>ยอมรับคุกกี้ทั้งหมด</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full sm:w-auto py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/10 transition-all cursor-pointer"
              >
                บันทึกการตั้งค่าที่เลือก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
