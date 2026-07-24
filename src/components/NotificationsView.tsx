import React, { useState } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import {
  Bell,
  Sparkles,
  Flame,
  Clock,
  Award,
  Target,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Shield,
  Zap,
  RefreshCw,
  XCircle,
  BellRing,
  Music,
  Activity,
  Calendar,
  Smartphone,
  Download
} from "lucide-react";
import { AppSettings } from "../types";
import { notifyLevelUp, notifyStreakMilestone } from "../services/notification";

interface NotificationEvent {
  id: string;
  time: string;
  category: string;
  title?: string;
  message: string;
  soundType: "success" | "complete" | "click" | "warning";
  targetPage?: string;
  pageName?: string;
}

interface NotificationsViewProps {
  notificationLogs: NotificationEvent[];
  activeExamMode: boolean;
  setActiveExamMode: (active: boolean) => void;
  activeVacationMode: boolean;
  setActiveVacationMode: (active: boolean) => void;
  triggerNotification: (title: string, message: string, category: string, sound?: "success" | "complete" | "click" | "warning") => void;
  clearNotificationLogs: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  subscribeToPushNotifications?: () => Promise<boolean>;
  triggerServerPush?: (title: string, message: string, url: string, category?: string) => Promise<void>;
  userId?: string;
}

export default function NotificationsView({
  notificationLogs,
  activeExamMode,
  setActiveExamMode,
  activeVacationMode,
  setActiveVacationMode,
  triggerNotification,
  clearNotificationLogs,
  settings,
  setSettings
}: NotificationsViewProps) {
  const {
    permissionStatus,
    loading,
    pendingList,
    requestPermission,
    scheduleDailyReminders,
    triggerTestNotification,
    refreshStatus,
    cancelNotification,
    cancelAllNotifications
  } = useNotificationContext();

  const [activeTab, setActiveTab] = useState<"schedule" | "logs" | "test">("schedule");
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    const success = await requestPermission();
    if (success) {
      setTestResultMsg("✅ เปิดสิทธิ์ Local Notification สำเร็จ! ได้ตั้งเวลาการแจ้งเตือนอัตโนมัติแล้ว");
    } else {
      setTestResultMsg("⚠️ Permission ถูกปฏิเสธ หรือยังไม่อนุญาตการแจ้งเตือน");
    }
  };

  const handleScheduleAll = async () => {
    const count = await scheduleDailyReminders();
    setTestResultMsg(`📅 ตั้งเวลา Local Notification อัตโนมัติ ${count} รายการสำเร็จ! (ทำงานแม้ปิดแอป)`);
  };

  const handleTestTrigger = async (title: string, body: string, category: string) => {
    const success = await triggerTestNotification(title, body, category);
    if (success) {
      setTestResultMsg(`🔔 ส่ง Local Notification "${title}" แล้ว! (จะเด้งขึ้นใน 1 วินาที)`);
      // Also log inside app history
      triggerNotification(title, body, category, "success");
    } else {
      setTestResultMsg("❌ ไม่สามารถส่ง Local Notification ได้ กรุณาเช็กสิทธิ์แจ้งเตือน");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/80 p-6 md:p-8 border border-blue-500/20 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Capacitor Local Notifications (iOS Offline Ready)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <BellRing className="w-7 h-7 text-blue-400 animate-pulse" />
              <span>การแจ้งเตือน Future Artist</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              ระบบแจ้งเตือนภายในเครื่อง (Local Notification) ทำงานโดยตรงบน iOS แม้ปิดแอป ไม่ต้องใช้ Server หรือ Apple Push (APNs)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleScheduleAll}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>เปิดใช้แจ้งเตือนประจำวัน</span>
            </button>
            <a
              href="/downloads/FutureArtist.ipa"
              download="FutureArtist.ipa"
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/40 text-slate-200 font-medium text-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ดาวน์โหลด iOS IPA</span>
            </a>
          </div>
        </div>
      </div>

      {/* Permission Status & Action Card */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl border border-slate-700/50 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              permissionStatus === "granted"
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                : permissionStatus === "denied"
                ? "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
            }`}>
              {permissionStatus === "granted" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : permissionStatus === "denied" ? (
                <XCircle className="w-7 h-7" />
              ) : (
                <Shield className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">สถานะสิทธิ์การแจ้งเตือน</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  permissionStatus === "granted"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : permissionStatus === "denied"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {permissionStatus === "granted" ? "ได้รับสิทธิ์แล้ว (Granted)" : permissionStatus === "denied" ? "ถูกปฏิเสธ (Denied)" : "รอขอสิทธิ์ (Prompt)"}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {permissionStatus === "granted"
                  ? "แอปพร้อมส่งการแจ้งเตือนประจำวัน, ผลการฝึกซ้อม, และ Achievement บน iOS แล้ว"
                  : "กรุณากดปุ่มขอสิทธิ์เพื่อให้ระบบสามารถส่งการแจ้งเตือนซ้อมและเตือนเป้าหมายประจำวัน"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {permissionStatus !== "granted" && (
              <button
                onClick={handleRequestPermission}
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95"
              >
                <Bell className="w-4 h-4" />
                <span>เปิดสิทธิ์การแจ้งเตือน</span>
              </button>
            )}
            <button
              onClick={refreshStatus}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-all"
              title="รีเฟรชสถานะ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {testResultMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-blue-200 text-xs font-medium flex items-center justify-between">
            <span>{testResultMsg}</span>
            <button onClick={() => setTestResultMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "schedule"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>ตารางแจ้งเตือนอัตโนมัติ ({pendingList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "test"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ทดสอบระบบทันที (Test Triggers)</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "logs"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ประวัติกิจกรรม ({notificationLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>ตาราง Local Notification ประจำวัน</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleScheduleAll}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>รีเซ็ตตั้งเวลาใหม่ทั้งหมด</span>
              </button>
              {pendingList.length > 0 && (
                <button
                  onClick={cancelAllNotifications}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ยกเลิกทั้งหมด</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { time: "06:00", title: "Wake Up", desc: "ตื่นได้แล้ว! ความฝันไม่ทำงานแทนเรานะ", cat: "Daily Routine" },
              { time: "06:05", title: "Wake Up Again", desc: "อีก 5 นาที = อีก 30 นาที อย่าหลอกตัวเอง!", cat: "Daily Routine" },
              { time: "06:15", title: "Get Up", desc: "ลุกจากเตียงได้แล้ว!", cat: "Daily Routine" },
              { time: "06:30", title: "Shower Time", desc: "ไปอาบน้ำกัน ศิลปินต้องดูดีตั้งแต่เช้า", cat: "Daily Routine" },
              { time: "06:45", title: "Check Bag", desc: "เช็กกระเป๋าให้ครบ อย่าลืมสมองไว้บนเตียงนะ", cat: "Daily Routine" },
              { time: "07:00", title: "Ready!", desc: "พร้อมลุยวันนี้!", cat: "Daily Routine" },
              { time: "07:10", title: "Drink Water", desc: "ดื่มน้ำ 1 แก้วก่อนออกจากบ้าน", cat: "Health" },
              { time: "07:30", title: "Travel Safe", desc: "เดินทางปลอดภัยนะ", cat: "Daily Routine" },
              { time: "08:20", title: "Before Class", desc: "อีก 10 นาทีจะเข้าเรียนแล้ว!", cat: "School" },
              { time: "08:30", title: "Class Started", desc: "ตั้งใจเรียน! EXP วิชาการกำลังรออยู่", cat: "School" },
              { time: "09:00", title: "Drink Water", desc: "ดื่มน้ำหน่อย สมองจะได้ไม่โหลดช้า", cat: "Health" },
              { time: "09:30", title: "Sit Properly", desc: "หลังตรงด้วย! อย่านั่งเป็นกุ้ง", cat: "Health" },
              { time: "10:00", title: "Don't Sleep", desc: "ถ้าง่วงให้ล้างหน้า ไม่ใช่หลับคาโต๊ะ", cat: "School" },
              { time: "10:30", title: "Keep Going", desc: "ใกล้พักกลางวันแล้ว สู้ ๆ", cat: "School" },
              { time: "10:50", title: "Lunch Incoming", desc: "อีก 10 นาทีได้กินข้าวแล้ว!", cat: "School" },
              { time: "11:00", title: "Lunch Time", desc: "พักกลางวัน! กินข้าวให้ครบนะ", cat: "School" },
              { time: "11:30", title: "Drink Water", desc: "ดื่มน้ำหลังอาหารด้วย", cat: "Health" },
              { time: "11:45", title: "Afternoon Class", desc: "เตรียมตัวเรียนคาบบ่าย!", cat: "School" },
              { time: "11:50", title: "Class Started", desc: "คาบบ่ายเริ่มแล้ว อย่าปล่อยให้ความง่วงชนะ!", cat: "School" },
              { time: "12:15", title: "🤖 Random Motivation", desc: "สุ่มเตือนให้กำลังใจ / เตือนความขี้เกียจ", cat: "Motivation" },
              { time: "12:30", title: "Afternoon Energy", desc: "เติมพลังหน่อย ยังเหลืออีกหลายคาบ", cat: "School" },
              { time: "13:00", title: "Drink Water", desc: "ดื่มน้ำกัน!", cat: "Health" },
              { time: "13:30", title: "Fighting!", desc: "เหลืออีกไม่กี่คาบแล้ว", cat: "School" },
              { time: "14:00", title: "Sleep Alert", desc: "ระบบตรวจพบความง่วงเพิ่มขึ้น 89%", cat: "School" },
              { time: "14:30", title: "Last Push", desc: "อีกนิดเดียวก็เลิกเรียนแล้ว!", cat: "School" },
              { time: "15:00", title: "Almost Done", desc: "อีก 10 นาทีเป็นอิสระ!", cat: "School" },
              { time: "15:10", title: "School Complete", desc: "ภารกิจโรงเรียนสำเร็จ! +50 EXP", cat: "School" },
              { time: "15:30", title: "Going Home", desc: "เดินทางกลับบ้านปลอดภัยนะ", cat: "Daily Routine" },
              { time: "16:00", title: "Home Time", desc: "ถึงบ้านแล้วหรือยัง?", cat: "Daily Routine" },
              { time: "16:15", title: "🤖 Random Motivation", desc: "สุ่มเตือนให้กำลังใจ / เตือนความขี้เกียจ", cat: "Motivation" },
              { time: "16:30", title: "Daily Mode", desc: "ได้เวลาเลือกโหมดของวันนี้!", cat: "Artist Training" },
              { time: "16:45", title: "Rest Time", desc: "พักสัก 15-30 นาทีได้", cat: "Daily Routine" },
              { time: "17:00", title: "Start Mission", desc: "Future Artist รอคุณอยู่!", cat: "Artist Training" },
              { time: "17:15", title: "Lazy Alert", desc: "ความขี้เกียจกำลังจะโจมตี!", cat: "Motivation" },
              { time: "17:30", title: "Warm Up", desc: "วอร์มอัป 20 นาทีได้แล้ว!", cat: "Artist Training" },
              { time: "18:00", title: "Drink Water", desc: "ดื่มน้ำกันหน่อย", cat: "Health" },
              { time: "18:15", title: "Singing Time", desc: "ไมค์ถามหาคุณอยู่", cat: "Artist Training" },
              { time: "18:30", title: "Dance Time", desc: "ได้เวลาเต้นแล้ว!", cat: "Artist Training" },
              { time: "19:00", title: "English Time", desc: "วันนี้เรียนภาษาอังกฤษหรือยัง?", cat: "Artist Training" },
              { time: "19:30", title: "Acting Time", desc: "Oscar อาจรอคุณอยู่!", cat: "Artist Training" },
              { time: "20:00", title: "Mission Check", desc: "ภารกิจวันนี้เหลืออะไรอีกไหม?", cat: "Artist Training" },
              { time: "20:30", title: "Water Check", desc: "ดื่มน้ำครบหรือยัง?", cat: "Health" },
              { time: "21:00", title: "Daily Score", desc: "ให้คะแนนตัวเองวันนี้กี่คะแนน?", cat: "Artist Training" },
              { time: "21:15", title: "Motivation", desc: "ทำได้ 1% ก็ยังดีกว่า 0%", cat: "Motivation" },
              { time: "21:30", title: "Prepare Sleep", desc: "เตรียมตัวเข้านอนได้แล้ว", cat: "Health" },
              { time: "21:45", title: "Stop Scrolling", desc: "เลิกไถมือถือได้แล้ว!", cat: "Health" },
              { time: "22:00", title: "Good Night", desc: "Good Night! พรุ่งนี้เรามาเก่งขึ้นอีก 1% กัน", cat: "Health" }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-start gap-3 hover:border-slate-700 transition-all">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 font-mono text-sm font-bold border border-blue-500/20">
                  {item.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 text-sm truncate">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-400 font-medium">{item.cat}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleTestTrigger(item.title, item.desc, item.cat)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-300 transition-all text-xs"
                  title="ทดสอบส่งเลย"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TEST TRIGGERS */}
      {activeTab === "test" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>ทดสอบการแจ้งเตือน Local Notification ทันที</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleTestTrigger("🎤 ได้เวลาซ้อมร้องเพลง!", "วอร์มกล่องเสียงและฝึกเทคนิคเสียงหลบ 20 นาทีวันนี้", "Daily Training")}
              className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 hover:border-blue-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <Music className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Daily Training</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือนซ้อมร้องเพลง</h4>
              <p className="text-xs text-slate-400 mt-1">ส่งแจ้งเตือนวอร์มเสียงและฝึกร้องเพลง</p>
            </button>

            <button
              onClick={() => handleTestTrigger("💃 ได้เวลาซ้อมเต้น!", "ทบทวนไลน์เต้นและฝึกจังหวะสเต็ปการเต้น", "Daily Training")}
              className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Daily Training</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือนซ้อมเต้น</h4>
              <p className="text-xs text-slate-400 mt-1">ส่งแจ้งเตือนฝึกเต้นและจัดระเบียบร่างกาย</p>
            </button>

            <button
              onClick={() => handleTestTrigger("🎯 เช็กเป้าหมายประจำวัน", "วันนี้ตั้งเป้าหมายซ้อมอะไรบ้าง? ทบทวนเป้าหมายกัน!", "Goal")}
              className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Goal</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือนเป้าหมายประจำวัน</h4>
              <p className="text-xs text-slate-400 mt-1">ส่งแจ้งเตือนทบทวน Daily Goals</p>
            </button>

            <button
              onClick={() => handleTestTrigger("📋 Mission ยังไม่เรียบร้อย", "อย่าปล่อยให้สตรีคขาด! เหลือภารกิจประจำวันที่ต้องเคลียร์", "Goal")}
              className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Goal</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือน Mission ค้างอยู่</h4>
              <p className="text-xs text-slate-400 mt-1">เตือนภารกิจที่ยังไม่เสร็จสิ้น</p>
            </button>

            <button
              onClick={() => {
                notifyLevelUp(5, "Debut Artist Candidate");
                triggerNotification("🎉 LEVEL UP! เลเวล 5", "ยินดีด้วย! ปลดล็อก Debut Artist Candidate", "Achievement", "complete");
                setTestResultMsg("🎉 ส่งเตือน Level Up แจ้งเตือนแล้ว!");
              }}
              className="p-4 rounded-2xl bg-slate-900/60 border border-gold-500/20 hover:border-amber-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Achievement</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือน Level Up</h4>
              <p className="text-xs text-slate-400 mt-1">จำลองเหตุการณ์เลเวลอัปศิลปิน</p>
            </button>

            <button
              onClick={() => {
                notifyStreakMilestone(7);
                triggerNotification("🔥 STREAK 7 วันรวด!", "สุดยอดมาก! ฝึกซ้อมต่อเนื่องติดต่อกัน 7 วันแล้ว", "Achievement", "complete");
                setTestResultMsg("🔥 ส่งเตือน Streak 7 วันแล้ว!");
              }}
              className="p-4 rounded-2xl bg-slate-900/60 border border-rose-500/20 hover:border-rose-500/50 text-left transition-all hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">Achievement</span>
              </div>
              <h4 className="font-bold text-white text-sm">เตือน Streak 7 วัน</h4>
              <p className="text-xs text-slate-400 mt-1">จำลองความสำเร็จการซ้อมต่อเนื่อง</p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>ประวัติกิจกรรมและการแจ้งเตือนในแอป</span>
            </h3>
            {notificationLogs.length > 0 && (
              <button
                onClick={clearNotificationLogs}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างประวัติ</span>
              </button>
            )}
          </div>

          {notificationLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-400">ยังไม่มีประวัติการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificationLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{log.title || log.category}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{log.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">{log.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
