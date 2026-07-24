import { useState, useEffect } from "react";
import { 
  Flame, 
  CalendarDays, 
  Sparkles, 
  Crown, 
  Award, 
  Activity, 
  Mic, 
  Dumbbell, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Info,
  Droplet,
  Volume2,
  Plus,
  Minus,
  Quote,
  LayoutGrid,
  Eye,
  EyeOff,
  Check
} from "lucide-react";
import { DailyModeType, DAILY_MODES_CONFIG, UserProfile, AppSettings, DayProgress, getXpRequiredForLevel, LEVEL_UNLOCKS } from "../types";
import { getLevelTitle, getTodayDateString } from "../hooks/useAppState";
import { playChime } from "../utils/audio";
import DailySummaryCard from "./DailySummaryCard";

interface DashboardProps {
  profile: UserProfile;
  settings: AppSettings;
  history: DayProgress[];
  activeMissions: any[];
  selectedModeToday: DailyModeType;
  setActiveTab: (tab: string) => void;
  saveMyStreak: () => { success: boolean; message: string };
}

export default function Dashboard({
  profile,
  settings,
  history,
  activeMissions,
  selectedModeToday,
  setActiveTab,
  saveMyStreak
}: DashboardProps) {
  const todayStr = getTodayDateString();
  const today = new Date();

  // --- Interactive PWA Widget System State ---
  const [widgetsActive, setWidgetsActive] = useState<{
    hydration: boolean;
    soundChime: boolean;
    motivation: boolean;
    stagePresence: boolean;
  }>(() => {
    const saved = localStorage.getItem("future_artist_dashboard_widgets_active");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { hydration: true, soundChime: true, motivation: true, stagePresence: true };
  });

  const [waterCount, setWaterCount] = useState<number>(() => {
    const saved = localStorage.getItem("future_artist_hydration_count");
    return saved ? parseInt(saved) : 0;
  });

  const [customQuote, setCustomQuote] = useState<string>(() => {
    return localStorage.getItem("future_artist_custom_motivation_quote") || "วินัยไม่ได้สร้างเสร็จในวันเดียว แต่สร้างขึ้นในทุกก้าวที่เราทำสม่ำเสมอ";
  });
  const [showQuoteEdit, setShowQuoteEdit] = useState(false);
  const [quoteInputText, setQuoteInputText] = useState("");

  const [stagePresenceScore, setStagePresenceScore] = useState<number>(() => {
    const saved = localStorage.getItem("future_artist_skill_scores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.confidence === "number") return parsed.confidence;
      } catch (e) {}
    }
    return 60;
  });

  const [runningInPWA, setRunningInPWA] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                         (window.navigator as any).standalone === true ||
                         document.referrer.includes("android-app://");
    setRunningInPWA(isStandalone);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedWater = localStorage.getItem("future_artist_hydration_count");
      if (savedWater) setWaterCount(parseInt(savedWater));

      const savedQuote = localStorage.getItem("future_artist_custom_motivation_quote");
      if (savedQuote) setCustomQuote(savedQuote);

      const savedSkills = localStorage.getItem("future_artist_skill_scores");
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (typeof parsed.confidence === "number") setStagePresenceScore(parsed.confidence);
        } catch (e) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleWidget = (key: keyof typeof widgetsActive) => {
    setWidgetsActive(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("future_artist_dashboard_widgets_active", JSON.stringify(next));
      return next;
    });
  };

  const handleWaterChange = (change: number) => {
    setWaterCount(prev => {
      const next = Math.max(0, prev + change);
      localStorage.setItem("future_artist_hydration_count", next.toString());
      return next;
    });
    playChime("click");
  };

  const handleSaveQuote = () => {
    const trimmed = quoteInputText.trim();
    if (trimmed) {
      setCustomQuote(trimmed);
      localStorage.setItem("future_artist_custom_motivation_quote", trimmed);
    }
    setShowQuoteEdit(false);
  };

  const handleConfidenceChange = (val: number) => {
    setStagePresenceScore(val);
    const saved = localStorage.getItem("future_artist_skill_scores");
    let parsed: any = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) {}
    }
    parsed.confidence = val;
    localStorage.setItem("future_artist_skill_scores", JSON.stringify(parsed));
  };

  // --- Countdown Calculations ---
  // 1. Days left of year
  const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
  const diffTime = yearEnd.getTime() - today.getTime();
  const daysLeftInYear = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // 2. Days left before birthday
  let daysToBirthday = 0;
  if (profile.birthday) {
    const bday = new Date(profile.birthday);
    const bMonth = bday.getMonth();
    const bDate = bday.getDate();
    const bdayThisYear = new Date(today.getFullYear(), bMonth, bDate);
    if (bdayThisYear.getTime() < today.getTime() - 86400000) {
      // birthday already passed this year, look at next year
      bdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    const bDiff = bdayThisYear.getTime() - today.getTime();
    daysToBirthday = Math.max(0, Math.ceil(bDiff / (1000 * 60 * 60 * 24)));
  }

  // 3. Days until target
  let daysToTarget = 0;
  if (settings.targetEndDate) {
    const targetDate = new Date(settings.targetEndDate);
    const tDiff = targetDate.getTime() - today.getTime();
    daysToTarget = Math.max(0, Math.ceil(tDiff / (1000 * 60 * 60 * 24)));
  }

  // --- Today's Completion ---
  const todayProgress = history.find(h => h.date === todayStr);
  const totalMissionsCount = activeMissions.length;
  const completedMissionsCount = activeMissions.filter(m => m.completed).length;
  const completedPercent = totalMissionsCount > 0 
    ? Math.round((completedMissionsCount / totalMissionsCount) * 100) 
    : 0;

  // --- Monthly Summary calculations ---
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthLogs = history.filter(h => h.date.startsWith(currentMonthStr) && h.completed);
  const daysTrainedThisMonth = currentMonthLogs.length;

  let totalMinutes = 0;
  let danceMinutes = 0;
  let singMinutes = 0;
  let exerciseMinutes = 0;

  currentMonthLogs.forEach(log => {
    const config = DAILY_MODES_CONFIG[log.modeType];
    if (config) {
      config.missions.forEach(m => {
        totalMinutes += m.durationMinutes;
        const nameLower = m.name.toLowerCase();
        if (nameLower.includes("dance") || nameLower.includes("เต้น")) {
          danceMinutes += m.durationMinutes;
        }
        if (nameLower.includes("sing") || nameLower.includes("ร้อง")) {
          singMinutes += m.durationMinutes;
        }
        if (
          nameLower.includes("exercise") || 
          nameLower.includes("ออกกำลังกาย") || 
          nameLower.includes("stretch") || 
          nameLower.includes("plank")
        ) {
          exerciseMinutes += m.durationMinutes;
        }
      });
    }
  });

  const totalHours = (totalMinutes / 60).toFixed(1);
  const danceHours = (danceMinutes / 60).toFixed(1);
  const singHours = (singMinutes / 60).toFixed(1);
  const exerciseHours = (exerciseMinutes / 60).toFixed(1);

  // --- Streaks Motivational Slogans ---
  const getStreakSlogan = (streak: number) => {
    if (streak >= 365) return { text: "Future Artist", sub: "คุณคู่ควรกับตำแหน่งดาวเด่นระดับสากล!" };
    if (streak >= 100) return { text: "Monster Mode!", sub: "วินัยระดับปีศาจ ไม่มีอะไรหยุดคุณได้!" };
    if (streak >= 30) return { text: "Amazing!", sub: "30 วันแห่งการพัฒนาที่น่าทึ่ง!" };
    if (streak >= 7) return { text: "One Week!", sub: "ยอดเยี่ยม! สัปดาห์แรกผ่านไปอย่างสวยงาม" };
    if (streak >= 1) return { text: "Keep Going!", sub: "ก้าวแรกที่มั่นคง เริ่มฝึกฝนต่อไปในทุกๆ วัน" };
    return { text: "No Streak", sub: "เริ่มต้นเลือกโหมดวันนี้เพื่อสร้างประวัติวินัย!" };
  };

  const streakSlogan = getStreakSlogan(profile.currentStreak);

  // Level & XP Formula System
  const reqXpForCurrentLevel = getXpRequiredForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.xp / reqXpForCurrentLevel) * 100));
  const coinsCount = profile.coins ?? 100;

  // Next level unlock lookup
  const nextUnlockLevel = Object.keys(LEVEL_UNLOCKS)
    .map(Number)
    .filter(lvl => lvl > profile.level)
    .sort((a, b) => a - b)[0];
  const nextUnlockInfo = nextUnlockLevel ? LEVEL_UNLOCKS[nextUnlockLevel] : null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Brand Greeting Hero Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight">
            สวัสดี, <span className="text-blue-400">{profile.nickname}</span> ✨
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            พร้อมสำหรับการยกระดับตัวเองสู่การเป็น “Future Artist” วันนี้แล้วหรือยัง?
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-gray-500 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full self-start md:self-center">
          <CalendarDays size={14} className="text-blue-400" />
          <span>วันที่ {today.toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* 1. Countdown Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">วันเหลือในปีนี้</span>
            <div className="w-7 h-7 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
              <CalendarDays size={14} className="text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-extrabold text-white">{daysLeftInYear} <span className="text-xs font-normal text-gray-400">วัน</span></p>
            <p className="text-[10px] text-gray-500 mt-1">สู้เพื่อความฝันให้ถึงวันสุดท้ายของปี</p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
        </div>

        <div className="glass-panel rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">วันก่อนถึงวันเกิด</span>
            <div className="w-7 h-7 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles size={14} className="text-yellow-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-extrabold text-white">{daysToBirthday} <span className="text-xs font-normal text-gray-400">วัน</span></p>
            <p className="text-[10px] text-gray-500 mt-1">อายุจะขึ้นปีใหม่ด้วยฝีมือที่เก่งขึ้น!</p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl" />
        </div>

        <div className="glass-panel rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">วันสู่วันเดบิวต์ / เป้าหมาย</span>
            <div className="w-7 h-7 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
              <Crown size={14} className="text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-display font-extrabold text-white">{daysToTarget} <span className="text-xs font-normal text-gray-400">วัน</span></p>
            <p className="text-[10px] text-gray-500 mt-1">เป้าหมายเดบิวต์: {settings.targetEndDate}</p>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
        </div>
      </div>

      {/* 2. Interactive PWA Widget System (ระบบวิดเจ็ตศิลปินอัจฉริยะ) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-blue-400" size={20} />
            <h3 className="font-display font-extrabold text-lg text-white">
              ระบบวิดเจ็ตอัจฉริยะ <span className="text-xs font-mono font-normal text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full ml-1.5">PWA Widgets</span>
            </h3>
          </div>
          <button
            id="toggle-widget-config"
            onClick={() => {
              setShowWidgetConfig(!showWidgetConfig);
              playChime("click");
            }}
            className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            {showWidgetConfig ? "เสร็จสิ้น" : "⚙️ ปรับแต่งวิดเจ็ต"}
          </button>
        </div>

        {/* Widget Customizer Toggle Panel */}
        {showWidgetConfig && (
          <div className="glass-panel rounded-[24px] p-5 border border-dashed border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {(["hydration", "soundChime", "motivation", "stagePresence"] as const).map((key) => {
              const label = key === "hydration" ? "💧 เติมน้ำดื่ม" 
                          : key === "soundChime" ? "🎵 บอร์ดคอร์ดเสียง" 
                          : key === "motivation" ? "✍️ คำขวัญบันดาลใจ" 
                          : "✨ ออร่าเวที";
              return (
                <button
                  key={key}
                  id={`config-widget-${key}`}
                  onClick={() => toggleWidget(key)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                    widgetsActive[key]
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span>{label}</span>
                  {widgetsActive[key] ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              );
            })}
          </div>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          
          {/* Widget 1: Hydration Tracker */}
          {widgetsActive.hydration && (
            <div className="bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-[24px] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-[168px] border border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.5)] group transition-all duration-300 hover:border-white/[0.22] hover:shadow-[0_15px_45px_rgba(0,0,0,0.65)] hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <Droplet size={14} className="animate-bounce" />
                  <span>ผิวพรรณ & ไฮเดรชัน (Water Cup)</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">เป้าหมาย: 8 แก้ว</span>
              </div>

              <div className="my-2 flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-white">{waterCount}</span>
                <span className="text-xs text-gray-400">/ 8 แก้ว</span>
              </div>

              {/* Progress visual cup indicator */}
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterCount / 8) * 100)}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="water-dec"
                  onClick={() => handleWaterChange(-1)}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors text-xs font-extrabold flex items-center justify-center cursor-pointer"
                >
                  <Minus size={13} />
                </button>
                <button
                  id="water-inc"
                  onClick={() => handleWaterChange(1)}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-400 text-gray-950 hover:bg-cyan-300 transition-colors text-xs font-extrabold flex items-center justify-center cursor-pointer shadow-md shadow-cyan-400/20"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-cyan-400/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
            </div>
          )}

          {/* Widget 2: Chime Sound Board */}
          {widgetsActive.soundChime && (
            <div className="bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-[24px] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-[168px] border border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/[0.22] hover:shadow-[0_15px_45px_rgba(0,0,0,0.65)] hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
                  <Volume2 size={14} />
                  <span>ทดสอบคอร์ดเสียงวินัย (Audio Box)</span>
                </span>
                <span className="text-[9px] font-mono text-violet-400/80 uppercase">Hifi Audio</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 my-2">
                <button
                  id="sound-success"
                  onClick={() => playChime("success")}
                  className="py-1 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                >
                  🛎️ ยินดี
                </button>
                <button
                  id="sound-complete"
                  onClick={() => playChime("complete")}
                  className="py-1 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                >
                  🌟 สำเร็จ
                </button>
                <button
                  id="sound-click"
                  onClick={() => playChime("click")}
                  className="py-1 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                >
                  ⚡ คลิก
                </button>
                <button
                  id="sound-warning"
                  onClick={() => playChime("warning")}
                  className="py-1 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                >
                  ⚠️ คำเตือน
                </button>
              </div>

              <span className="text-[9px] text-gray-500 leading-none">
                * ใช้เสียงสร้างปฏิกิริยาตื่นตัวในระบบวินัยและการแจ้งเตือน
              </span>
            </div>
          )}

          {/* Widget 3: Trainee Motivation Board */}
          {widgetsActive.motivation && (
            <div className="bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-[24px] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-[168px] border border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.5)] group transition-all duration-300 hover:border-white/[0.22] hover:shadow-[0_15px_45px_rgba(0,0,0,0.65)] hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Quote size={13} />
                  <span>คำขวัญแรงบันดาลใจวันนี้</span>
                </span>
                <button
                  id="edit-quote-btn"
                  onClick={() => {
                    setQuoteInputText(customQuote);
                    setShowQuoteEdit(!showQuoteEdit);
                    playChime("click");
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  {showQuoteEdit ? "ยกเลิก" : "✏️ แก้ไข"}
                </button>
              </div>

              {showQuoteEdit ? (
                <div className="space-y-1.5 my-1">
                  <input
                    type="text"
                    value={quoteInputText}
                    onChange={(e) => setQuoteInputText(e.target.value)}
                    className="w-full text-[11px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-400 font-medium"
                    maxLength={100}
                    placeholder="เขียนคำขวัญของคุณ..."
                  />
                  <button
                    id="save-quote-btn"
                    onClick={handleSaveQuote}
                    className="w-full py-1 bg-amber-400 text-gray-950 font-bold rounded-md text-[10px] hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    บันทึกคำขวัญ
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-300 italic font-medium leading-relaxed my-2 line-clamp-3">
                  "{customQuote}"
                </p>
              )}

              <span className="text-[9px] text-gray-500">
                เขียนเพื่อย้ำเตือนทัศนคติของศิลปินในตัวคุณทุกเช้า
              </span>
            </div>
          )}

          {/* Widget 4: Stage Presence / Confidence Aura */}
          {widgetsActive.stagePresence && (
            <div className="bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-[24px] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between h-[168px] border border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.5)] group transition-all duration-300 hover:border-white/[0.22] hover:shadow-[0_15px_45px_rgba(0,0,0,0.65)] hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span>ระดับเสน่ห์เวที (Stage Presence)</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500 font-bold">
                  {stagePresenceScore >= 85 ? "🔥 Debut Ready" : stagePresenceScore >= 60 ? "⭐ Rising" : "Beginner"}
                </span>
              </div>

              <div className="my-2 space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-gray-400 text-[10px]">ระดับความมั่นใจวันนี้</span>
                  <span className="font-mono text-white font-bold text-sm">{stagePresenceScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stagePresenceScore}
                  onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-400 border border-white/5"
                />
              </div>

              <div className="bg-emerald-400/5 rounded-lg p-1.5 border border-emerald-400/10 text-center">
                <span className="text-[9px] text-emerald-400 font-semibold leading-normal block">
                  {stagePresenceScore >= 85 ? "ออร่าเวทีดีเยี่ยม! พร้อมสำหรับการคัดเลือกตัวจริง" : "ปรับเพิ่มสไลเดอร์เพื่อท้าทายจินตนาการความพร้อมของคุณวันนี้"}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* If all widgets are hidden */}
        {Object.values(widgetsActive).every(val => !val) && (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-[24px] p-8 text-center text-gray-500 text-xs font-semibold">
            🚫 คุณซ่อนวิดเจ็ตทั้งหมดอยู่ แตะ "⚙️ ปรับแต่งวิดเจ็ต" ด้านบนขวาเพื่อเลือกแสดงผลวิดเจ็ตที่คุณโปรดปราน
          </div>
        )}
      </div>

      {/* Main Grid: Left Profile & Streak, Right Today's Status & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 5): User Profile & Level System */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* User Profile Card */}
          <div className="glass-panel rounded-[30px] p-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              {/* Initials-based Beautiful Avatar */}
              <div className="relative group">
                <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
                  <span className="font-display font-extrabold text-2xl text-white">
                    {profile.nickname ? profile.nickname.substring(0, 2).toUpperCase() : "FA"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-2 border-[#0d0f12] flex items-center justify-center">
                  <Crown size={10} className="text-gray-950 font-bold" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-white truncate">{profile.nickname}</h3>
                  <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-full shrink-0">
                    <span>🪙</span>
                    <span>{coinsCount}</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-400/95 font-medium flex items-center gap-1.5 mt-1">
                  <Crown size={12} />
                  <span>{getLevelTitle(profile.level)}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                  <span className="font-bold text-white">Level {profile.level}</span>
                  <span className="text-gray-600">•</span>
                  <span>{profile.xp} / {reqXpForCurrentLevel} XP</span>
                </div>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">ความก้าวหน้าเลเวล {profile.level}</span>
                <span className="text-blue-400 font-bold">{xpPercent}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 border border-white/10 rounded-full overflow-hidden p-[2px]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Coins ได้รับเมื่ออัปเวล: +{profile.level * 20} 🪙</span>
                <span className="text-amber-300">อีก {Math.max(0, reqXpForCurrentLevel - profile.xp)} XP เพื่อ Level {profile.level + 1}</span>
              </div>
            </div>

            {/* Next Level Unlock Preview */}
            {nextUnlockInfo && (
              <div className="mt-4 p-3 bg-white/5 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles size={13} />
                    <span>ปลดล็อกถัดไปที่ Level {nextUnlockLevel}:</span>
                  </div>
                  <p className="text-gray-300 font-medium text-[11px]">{nextUnlockInfo.features.join(", ")}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold">
                    +{nextUnlockInfo.coins} Coins
                  </span>
                </div>
              </div>
            )}

            {/* Streak Tracker Visual */}
            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-[20px] p-3 text-center">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">สตรีคปัจจุบัน</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <Flame size={20} className={profile.currentStreak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-500"} />
                  <span className="text-2xl font-display font-black text-white">{profile.currentStreak}</span>
                </div>
                <span className="text-[10px] text-orange-300 font-semibold mt-1 block">{streakSlogan.text}</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[20px] p-3 text-center">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">สตรีคที่ดีที่สุด</p>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <Award size={20} className="text-yellow-400" />
                  <span className="text-2xl font-display font-black text-white">{profile.bestStreak}</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">วันสถิติสูงสุดของคุณ</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 italic mt-4 px-2">
              "{streakSlogan.sub}"
            </p>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span>บันทึก Level & XP ลงฐานข้อมูลเรียบร้อยแล้ว</span>
              </span>
              <button
                id="dash-save-data-quick-btn"
                onClick={() => setActiveTab("settings")}
                className="text-[10px] font-bold text-blue-400 hover:underline cursor-pointer"
              >
                จัดการการบันทึก →
              </button>
            </div>
          </div>

          {/* Quick Shortcuts to Selection or Timer */}
          <div className="glass-panel rounded-[24px] p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">ต้องการเริ่มซ้อมเลยไหม?</h4>
              <p className="text-[11px] text-gray-400">ควบคุมและประเมินภารกิจของคุณด้วยตัวจับเวลา</p>
            </div>
            <button 
              id="goto-timer-btn"
              onClick={() => setActiveTab("timer")} 
              className="p-3 bg-white text-gray-950 rounded-[16px] hover:bg-blue-400 hover:text-white transition-all cursor-pointer shadow-lg shadow-white/5"
            >
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Right Column (Span 7): Daily Summary & Today's Mission Status & Monthly Analytics */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Summary Card (Spec #1, #2, #3, #4, #6, #7) */}
          <DailySummaryCard
            selectedModeToday={selectedModeToday}
            activeMissions={activeMissions}
            todayProgress={todayProgress}
            profile={profile}
            saveMyStreak={saveMyStreak}
            setActiveTab={setActiveTab}
          />
          
          {/* Today's Status Widget */}
          <div className="glass-panel rounded-[30px] p-6 relative overflow-hidden">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-blue-400" size={18} />
              <span>สถานะประจำวันนี้ (Today's Status)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Circle Progress Indicator */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-3">
                <div className="relative w-28 h-28">
                  {/* Outer Ring */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/5"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-500 transition-all duration-700 ease-out"
                      strokeWidth="3.5"
                      strokeDasharray={`${completedPercent}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-display font-extrabold text-white">{completedPercent}%</span>
                    <span className="text-[9px] text-gray-400 font-medium">สำเร็จ</span>
                  </div>
                </div>
              </div>

              {/* Mode Detail and Stats */}
              <div className="md:col-span-8 space-y-3.5">
                <div>
                  <span className="text-xs text-gray-400">โหมดการซ้อมวันนี้:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${DAILY_MODES_CONFIG[selectedModeToday].color}`}>
                      {DAILY_MODES_CONFIG[selectedModeToday].nameThai}
                    </span>
                    {selectedModeToday === DailyModeType.NONE && (
                      <button 
                        id="select-mode-prompt-btn"
                        onClick={() => setActiveTab("daily-mode")}
                        className="text-xs text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>เลือกโหมดเลย</span>
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/5 border border-white/10 rounded-[16px] p-2.5">
                    <p className="text-[10px] text-gray-400">ภารกิจที่ทำสำเร็จ</p>
                    <p className="text-base font-bold text-white mt-0.5 font-mono">
                      {completedMissionsCount} / {totalMissionsCount}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-[16px] p-2.5">
                    <p className="text-[10px] text-gray-400">ความสุขในการซ้อมวันนี้</p>
                    <p className="text-xs font-bold text-yellow-400 mt-1 flex items-center gap-1">
                      <span>{todayProgress && todayProgress.completed ? "🤩 ยอดเยี่ยมมาก" : selectedModeToday === DailyModeType.NONE ? "💤 ยังไม่เริ่ม" : "🔥 กำลังพยายาม"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Summary Block */}
          <div className="glass-panel rounded-[30px] p-6 relative overflow-hidden">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={18} />
              <span>สรุปผลเดือนนี้ (Monthly Summary)</span>
              <span className="text-[10px] font-mono text-gray-500 ml-auto uppercase bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {today.toLocaleString('th-TH', { month: 'long' })}
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-medium">วันที่ซ้อมสะสม</span>
                <p className="text-2xl font-display font-extrabold text-emerald-400 mt-2">{daysTrainedThisMonth} <span className="text-xs font-normal text-gray-400">วัน</span></p>
                <p className="text-[9px] text-gray-500 mt-1">เป้าหมาย: อย่างน้อย 15 วัน</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-medium">ชั่วโมงฝึกซ้อมรวม</span>
                <p className="text-2xl font-display font-extrabold text-blue-400 mt-2">{totalHours} <span className="text-xs font-normal text-gray-400">ชม.</span></p>
                <p className="text-[9px] text-gray-500 mt-1">จากประวัติสำเร็จทั้งหมด</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-medium">ความสำเร็จปลดล็อก</span>
                <p className="text-2xl font-display font-extrabold text-yellow-400 mt-2">
                  {history.length > 0 ? "1" : "0"} <span className="text-xs font-normal text-gray-400">ใบ</span>
                </p>
                <p className="text-[9px] text-gray-500 mt-1">คลังความสำเร็จศิลปิน</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-medium">XP สะสมทั้งหมด</span>
                <p className="text-2xl font-display font-extrabold text-purple-400 mt-2">{profile.xp + (profile.level - 1) * 100} <span className="text-xs font-normal text-gray-400">XP</span></p>
                <p className="text-[9px] text-gray-500 mt-1">แต้มพัฒนาของตนเอง</p>
              </div>
            </div>

            {/* Hourly breakdown charts/widgets */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <h4 className="text-xs font-semibold text-gray-300 mb-3.5">วิเคราะห์สัดส่วนเวลาฝึกซ้อมประจำเดือน</h4>
              
              <div className="space-y-3">
                {/* Dance */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <Activity size={12} className="text-cyan-400" />
                      <span>ทักษะการเต้น (Dance)</span>
                    </span>
                    <span className="text-cyan-400 font-mono font-bold">{danceHours} ชม.</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 rounded-full" 
                      style={{ width: `${Math.min(100, (parseFloat(danceHours) / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Singing */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <Mic size={12} className="text-pink-400" />
                      <span>ทักษะการร้องเพลง (Singing)</span>
                    </span>
                    <span className="text-pink-400 font-mono font-bold">{singHours} ชม.</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-400 rounded-full" 
                      style={{ width: `${Math.min(100, (parseFloat(singHours) / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Exercise */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                      <Dumbbell size={12} className="text-emerald-400" />
                      <span>ความฟิตร่างกาย (Exercise)</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">{exerciseHours} ชม.</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full" 
                      style={{ width: `${Math.min(100, (parseFloat(exerciseHours) / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic mt-3 flex items-center gap-1 leading-normal">
                <Info size={11} className="text-gray-400 shrink-0" />
                <span>อัตราการฝึกซ้อมสะสมถูกคำนวณอัตโนมัติจากภารกิจที่คุณสตรีมเวลากดสำเร็จในหมวด “จับเวลา”</span>
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
