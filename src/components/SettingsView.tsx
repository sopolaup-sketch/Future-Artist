import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Smartphone, 
  Trash2, 
  Database, 
  CheckCircle, 
  Clock, 
  Volume2, 
  UserPlus, 
  Lock,
  Compass,
  Sparkles,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Cookie,
  ShieldCheck,
  Type
} from "lucide-react";
import { UserProfile, AppSettings } from "../types";
import { playChime } from "../utils/audio";
import InstallButton from "./InstallButton";

interface SettingsViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  seedMockData: () => void;
  resetAllData: () => void;
  userId: string;
  syncStatus: "idle" | "syncing" | "success" | "error";
  lastSyncedAt: string;
  syncMessage: string;
  importDataFromCloud: (key: string) => Promise<boolean>;
  triggerManualSync: () => Promise<void>;
  reloadAppAndFetchData?: () => Promise<void>;
  onOpenCookieModal?: () => void;
}

export default function SettingsView({
  profile,
  setProfile,
  settings,
  setSettings,
  seedMockData,
  resetAllData,
  userId,
  syncStatus,
  lastSyncedAt,
  syncMessage,
  importDataFromCloud,
  triggerManualSync,
  onOpenCookieModal
}: SettingsViewProps) {
  // Local Form states
  const [nickname, setNickname] = useState(profile.nickname);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [age, setAge] = useState(profile.age);
  const [targetDate, setTargetDate] = useState(settings.targetEndDate);
  const [isSaved, setIsSaved] = useState(false);

  // Cloud Sync auxiliary states
  const [importKeyInput, setImportKeyInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  const handleFullSaveData = async () => {
    playChime("complete");
    await triggerManualSync();
    setManualSaveSuccess(true);
    setTimeout(() => setManualSaveSuccess(false), 4000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    playChime("click");
  };

  const handleImport = async () => {
    if (!importKeyInput.trim()) {
      alert("กรุณากรอก Sync Key ก่อนทำรายการ");
      return;
    }
    if (confirm("การนำเข้าข้อมูลจะเขียนทับข้อมูลทั้งหมดที่คุณมีอยู่ในปัจจุบัน คุณต้องการดำเนินการต่อหรือไม่?")) {
      const success = await importDataFromCloud(importKeyInput);
      if (success) {
        setImportKeyInput("");
      }
    }
  };

  // Manage Notification state
  const handleToggleNotifications = async () => {
    const nextVal = !settings.notificationsEnabled;
    setSettings(prev => ({ ...prev, notificationsEnabled: nextVal }));
    playChime("click");

    if (nextVal && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Future Artist 🚀", {
          body: "เปิดใช้งานระบบการแจ้งเตือนศิลปินรายวันแล้ว!",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically calculate age based on birthday
    let calculatedAge = age;
    if (birthday) {
      const bday = new Date(birthday);
      const today = new Date();
      calculatedAge = today.getFullYear() - bday.getFullYear();
      const monthDiff = today.getMonth() - bday.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bday.getDate())) {
        calculatedAge--;
      }
    }

    setProfile(p => ({
      ...p,
      nickname,
      birthday,
      age: Math.max(12, calculatedAge)
    }));

    setSettings(s => ({
      ...s,
      targetEndDate: targetDate
    }));

    setIsSaved(true);
    playChime("success");
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Notification simulators for high fidelity demonstration
  const simulateNotification = (type: "morning" | "after_school" | "training" | "forgot" | "sleep" | "smart_warning" | "smart_lazy") => {
    playChime("success");
    
    let title = "";
    let body = "";

    switch (type) {
      case "morning":
        title = "🌅 Good Morning! (06.00)";
        body = "สวัสดีตอนเช้า! เตรียมร่างกายให้สดชื่น ดื่มน้ำ และมุ่งมั่นสู่เป้าหมายชีวิตวันนี้กันนะ";
        break;
      case "after_school":
        title = "🎒 กลับจากโรงเรียนแล้วนะ (16.30)";
        body = "ยินดีต้อนรับกลับบ้าน! พักผ่อนเหนื่อยๆ แล้วอย่าลืมเลือกโหมดการซ้อมวันนี้ในระบบล่ะ";
        break;
      case "training":
        title = "🔥 ถึงเวลาพัฒนาตนเองแล้ว! (18.00)";
        body = "เวลาซ้อมเต้น วอร์มสายเสียง และทบทวนท่าเริ่มขึ้นแล้ว มาเข้าห้องจับเวลากันเลย";
        break;
      case "forgot":
        title = "⚠️ ยังไม่ได้ทำภารกิจเลยนะ (21.00)";
        body = "วันนี้คุณยังไม่ได้เริ่มต้นซ้อมเลยนะ แนะนำให้เลือก Lazy Day ซัก 15 นาทีก็ดีนะ";
        break;
      case "sleep":
        title = "💤 นอนหลับพักผ่อนนะ (22.00)";
        body = "ได้เวลาชาร์จพลังงานสายเสียงและผ่อนคลายกล้ามเนื้อแล้ว อย่าลืมนอนนะศิลปินคนเก่ง";
        break;
      case "smart_warning":
        title = "💡 Smart Alarm: วันนี้ยังไม่ได้เลือกโหมด";
        body = "วันนี้คุณยังไม่ได้เริ่มต้นเส้นทางฝึกฝนเลยนะ แค่เปิดดูโหมดความฝันก็ยินดีแล้ว";
        break;
      case "smart_lazy":
        title = "⚡ Smart Alarm: ใช้ Lazy Day ครบโควตา!";
        body = "คุณค่อนข้างพักเยอะไปหน่อยในช่วงนี้ ลองหันกลับมาซ้อมซัก 5-15 นาทีเพื่อไม่สตรีคหลุดก้าวใหม่กันดีกว่า";
        break;
    }

    if ("Notification" in window && Notification.permission === "granted" && settings.notificationsEnabled) {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else {
      // Inline visual alert fallback
      alert(`[SIMULATED NOTIFICATION]\n${title}\n${body}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Settings className="text-gray-400" size={26} />
          <span>การจัดการระบบและการตั้งค่า (Settings View)</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          แก้ไขโปรไฟล์ผู้ใช้ ตั้งค่าจำลองการแจ้งเตือน PWA และบันทึกข้อมูลส่วนกลางทั้งระบบในที่เดียว
        </p>
      </div>

      {/* Primary Save System Data Card */}
      <div className="glass-panel rounded-[30px] p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-black/40 to-blue-950/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 shrink-0">
              <Database size={26} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <span>บันทึกข้อมูลทั้งระบบ (Save System Data)</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Firestore & Local Unified
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                บันทึกระดับเลเวล XP สตรีค โควตาโหมดประจำวัน ประวัติการซ้อม เป้าหมาย และการตั้งค่าทั้งหมดลงในฐานข้อมูลส่วนกลาง (<strong className="text-emerald-300">Unified Global Database</strong>)
              </p>
            </div>
          </div>

          <button
            id="save-all-system-data-btn"
            onClick={handleFullSaveData}
            disabled={syncStatus === "syncing"}
            className="w-full md:w-auto px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            <span>💾 บันทึกข้อมูลทันที (Save Data Now)</span>
          </button>
        </div>

        {manualSaveSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs py-3 px-4 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <span>บันทึกข้อมูลเรียบร้อยแล้ว! ข้อมูลของคุณได้รับการจัดเก็บทั้งบนเครื่องและฐานข้อมูลส่วนกลางอย่างปลอดภัย</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>ฐานข้อมูลส่วนกลาง: <strong className="text-white">เชื่อมต่อเรียบร้อย ({userId})</strong></span>
          </div>
          {lastSyncedAt && (
            <span>บันทึกล่าสุดเมื่อ: <strong className="text-emerald-300">{lastSyncedAt}</strong></span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Profile settings & Alarm, Right PWA installation checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Span 7: Profile Edit & Simulation Alarm */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Display & Mobile Font Size Scale Card */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Type size={18} className="text-purple-400" />
              <span>ปรับขนาดตัวอักษรสำหรับมือถือ (Mobile Font Size)</span>
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              เลือกขนาดข้อความที่เหมาะกับสายตาและหน้าจอมือถือของคุณ เพื่อให้อ่านง่ายและพอดีกับทุกลายละเอียดในแอป
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                id="font-scale-normal-btn"
                onClick={() => {
                  setSettings(s => ({ ...s, fontScale: "normal" }));
                  playChime("click");
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  (settings.fontScale || "normal") === "normal"
                    ? "bg-white text-gray-950 font-extrabold border-white shadow-xl scale-[1.02]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 active:scale-95"
                }`}
              >
                <div className="text-xs font-bold">ปกติ</div>
                <div className="text-[10px] opacity-75 mt-0.5">Default (100%)</div>
              </button>

              <button
                type="button"
                id="font-scale-large-btn"
                onClick={() => {
                  setSettings(s => ({ ...s, fontScale: "large" }));
                  playChime("click");
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  settings.fontScale === "large"
                    ? "bg-white text-gray-950 font-extrabold border-white shadow-xl scale-[1.02]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 active:scale-95"
                }`}
              >
                <div className="text-sm font-bold">ใหญ่</div>
                <div className="text-[10px] opacity-75 mt-0.5">Large (+8%)</div>
              </button>

              <button
                type="button"
                id="font-scale-xlarge-btn"
                onClick={() => {
                  setSettings(s => ({ ...s, fontScale: "xlarge" }));
                  playChime("click");
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  settings.fontScale === "xlarge"
                    ? "bg-white text-gray-950 font-extrabold border-white shadow-xl scale-[1.02]"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 active:scale-95"
                }`}
              >
                <div className="text-base font-bold">ใหญ่พิเศษ</div>
                <div className="text-[10px] opacity-75 mt-0.5">XL (+16%)</div>
              </button>
            </div>
          </div>

          {/* Profile Edit Card */}
          <div className="glass-panel rounded-[30px] p-6">
            <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-300" />
              <span>ข้อมูลโปรไฟล์ศิลปินในฝัน</span>
            </h3>

            {isSaved && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs py-2.5 px-4 rounded-[16px] mb-4">
                ✓ บันทึกข้อมูลและประมวลผลอายุคำนวณเรียบร้อยแล้ว!
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">ชื่อเล่น / นามปากกา</label>
                  <input
                    id="settings-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">วันเกิด (ใช้คำนวณถอยหลัง)</label>
                  <input
                    id="settings-birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full p-3 bg-[#161a22] border border-white/10 rounded-[16px] text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">เป้าหมายเดบิวต์ / ปลายปี</label>
                  <input
                    id="settings-target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-3 bg-[#161a22] border border-white/10 rounded-[16px] text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">อายุศิลปิน (คำนวณออโต้)</label>
                  <div className="w-full p-3 bg-white/3 border border-white/5 rounded-[16px] text-sm text-gray-500 select-none">
                    {profile.age} ปี (ช่วงวัยพัฒนา 15-20 ปี)
                  </div>
                </div>
              </div>

              <button
                id="save-profile-btn"
                type="submit"
                className="w-full py-3 bg-white text-gray-950 hover:bg-blue-400 hover:text-white rounded-[16px] text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/5"
              >
                บันทึกการแก้ไขโปรไฟล์
              </button>
            </form>
          </div>

          {/* Browser Notification Simulator Panel */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Bell size={18} className="text-yellow-400" />
                <span>จำลองการแจ้งเตือน (Notification Simulator)</span>
              </h3>
              
              {/* Toggle switch for browser alert setting */}
              <button
                id="toggle-browser-notif"
                onClick={handleToggleNotifications}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.notificationsEnabled ? "bg-emerald-500" : "bg-gray-800"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.notificationsEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-normal">
              เปิดใช้อุปกรณ์จำลองกระตุ้นวินัยศิลปิน และทดสอบความพึงพอใจการยิง Notification ได้ทันที:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                id="sim-notif-06"
                onClick={() => simulateNotification("morning")}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[16px] text-[11px] font-medium text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-gray-500">06.00</span>
                <span>Good Morning!</span>
              </button>
              
              <button
                id="sim-notif-16"
                onClick={() => simulateNotification("after_school")}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[16px] text-[11px] font-medium text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-gray-500">16.30</span>
                <span>กลับบ้านเลือกโหมด</span>
              </button>

              <button
                id="sim-notif-18"
                onClick={() => simulateNotification("training")}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[16px] text-[11px] font-medium text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-gray-500">18.00</span>
                <span>ถึงเวลาซ้อมเต้น!</span>
              </button>

              <button
                id="sim-notif-21"
                onClick={() => simulateNotification("forgot")}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[16px] text-[11px] font-medium text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-gray-500">21.00</span>
                <span>วันนี้ยังไม่ซ้อม</span>
              </button>

              <button
                id="sim-notif-22"
                onClick={() => simulateNotification("sleep")}
                className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[16px] text-[11px] font-medium text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-gray-500">22.00</span>
                <span>นอนพักผ่อนนะ</span>
              </button>

              <button
                id="sim-notif-smart-lazy"
                onClick={() => simulateNotification("smart_lazy")}
                className="p-2.5 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 text-orange-300 rounded-[16px] text-[11px] font-bold text-left flex flex-col justify-between h-20 cursor-pointer transition-all"
              >
                <span className="font-mono text-orange-400">Smart Alert</span>
                <span>Lazy เกิน 2 วัน</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Span 5: PWA Checklist & Seed / Danger Zones */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PWA / iOS ESign Installation Card */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Smartphone size={18} className="text-blue-400" />
              <span>ติดตั้ง Future Artist บนอุปกรณ์มือถือ</span>
            </h3>

            <InstallButton />

            <div className="space-y-3.5 pt-2 border-t border-white/10">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white">บน iOS (iPhone & iPad)</h4>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                    ดาวน์โหลดไฟล์ <code className="text-indigo-300">FutureArtist.ipa</code> แล้วติดตั้งผ่านแอป ESign พร้อมเซ็นใบรับรองตามคู่มือ
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white">บน Android (Chrome PWA)</h4>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                    กดปุ่มติดตั้ง Android ด้านบน หรือเปิดสัญลักษณ์ <strong>สามจุด (⋮)</strong> แล้วเลือก <strong>เพิ่มไปยังหน้าจอหลัก</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cloud SQL / Firebase Upgrade Preview */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4 border border-blue-500/15 bg-blue-500/5 relative overflow-hidden">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Cloud size={18} className="text-blue-400" />
              <span>ระบบซิงค์ทุกอุปกรณ์เป็นบัญชีเดียว (Unified Global Sync)</span>
            </h3>
            
            <p className="text-xs text-gray-300 leading-normal">
              แอปพลิเคชันได้รับการตั้งค่าให้<strong>เชื่อมต่อเป็นบัญชีเดียวกันในทุกอุปกรณ์โดยอัตโนมัติ!</strong> ข้อมูลตารางเรียน สถิติ เส้นทางศิลปิน และสุขภาพจะซิงค์แบบเรียลไทม์ข้ามแพลตฟอร์มผ่าน <strong>Firebase Cloud Firestore</strong>
            </p>

            {/* Sync Key Display */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>รหัสซิงค์ส่วนกลาง (Global Sync Key)</span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">แชร์ทุกอุปกรณ์</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white tracking-wider flex-1 bg-black/30 p-2.5 rounded-[12px] text-center">
                  {userId}
                </span>
                <button
                  id="copy-sync-key-btn"
                  onClick={handleCopyKey}
                  className="p-3 bg-white/10 hover:bg-white/15 text-white rounded-[12px] transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                  title="คัดลอกรหัสซิงค์"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal mt-1">
                💡 ทุกอุปกรณ์ มือถือ แท็บเล็ต และคอมพิวเตอร์ของคุณจะเชื่อมต่อเข้าหากันโดยตรง เพื่อแบ่งปันตารางเรียนและความสำเร็จร่วมกันแบบเรียลไทม์!
              </p>
            </div>

            {/* Sync Status Info */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  syncStatus === "syncing" ? "bg-amber-400 animate-pulse" :
                  syncStatus === "success" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" :
                  syncStatus === "error" ? "bg-red-400" : "bg-gray-400"
                }`} />
                <span className="font-medium text-gray-300">
                  {syncMessage || "สถานะระบบปกติ"}
                </span>
              </div>
              <button
                id="manual-sync-btn"
                disabled={syncStatus === "syncing"}
                onClick={triggerManualSync}
                className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50 text-[11px]"
              >
                <RefreshCw size={12} className={syncStatus === "syncing" ? "animate-spin" : ""} />
                <span>ซิงค์ด่วน</span>
              </button>
            </div>

            {/* Import Key */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-xs font-bold text-white block">สลับไปยังบัญชีสำรองอื่น (Switch Account)</span>
              <div className="flex gap-2">
                <input
                  id="import-sync-key-input"
                  type="text"
                  placeholder="เช่น ARTIST-XXXXXX"
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-[14px] px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500/50 uppercase"
                />
                <button
                  id="import-sync-key-btn"
                  onClick={handleImport}
                  className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-4 py-2 rounded-[14px] text-xs font-bold transition-all cursor-pointer"
                >
                  เชื่อมต่อ
                </button>
              </div>
            </div>

            {lastSyncedAt && (
              <p className="text-[10px] text-gray-500 text-center">
                ซิงค์ล่าสุดเมื่อ: {lastSyncedAt}
              </p>
            )}
          </div>

          {/* Web Cookie & Privacy Preference Management Card */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4 border border-purple-500/20 bg-purple-950/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Cookie size={18} className="text-purple-400" />
                <span>นโยบายคุกกี้และความเป็นส่วนตัว (Cookie & Privacy)</span>
              </h3>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                PDPA Compliant
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              จัดการสิทธิ์การตั้งค่าคุกกี้เว็บ การวิเคราะห์ผล (<span className="font-mono text-purple-300">Firebase Analytics: G-4CZPM05HR4</span>) และแคชสำหรับบันทึกผลออฟไลน์บนเบราว์เซอร์ของคุณ
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-black/40 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>สถานะการยินยอมคุกกี้: <strong className="text-white">กำหนดค่าเรียบร้อย</strong></span>
              </div>

              <button
                id="open-cookie-settings-btn"
                onClick={() => {
                  playChime("click");
                  if (onOpenCookieModal) onOpenCookieModal();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Cookie size={14} />
                <span>จัดการการตั้งค่าคุกกี้</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Seed & Reset */}
          <div className="glass-panel rounded-[30px] p-6 border border-red-500/25 bg-red-950/5 space-y-4">
            <h3 className="font-display font-bold text-base text-red-400 flex items-center gap-2">
              <Trash2 size={18} />
              <span>เขตอันตราย (Danger Zone)</span>
            </h3>

            <p className="text-xs text-gray-400 leading-normal">
              ใช้สำหรับรีเซ็ตสถิติหรือสร้างฐานข้อมูลจำลอง (Seed) เพื่อตรวจสอบหน้าความก้าวหน้าและการทดสอบฟีเจอร์อย่างรวดเร็ว:
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                id="seed-history-btn"
                onClick={seedMockData}
                className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-bold text-xs rounded-[16px] cursor-pointer transition-all"
              >
                ⚡ จำลองประวัติข้อมูลการซ้อม 15 วัน
              </button>

              <button
                id="reset-history-btn"
                onClick={resetAllData}
                className="w-full py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/35 text-red-400 font-bold text-xs rounded-[16px] cursor-pointer transition-all"
              >
                🗑️ ลบข้อมูลทั้งหมดและเริ่มใหม่
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
