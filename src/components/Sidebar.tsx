import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Zap,
  Timer,
  Calendar,
  BarChart3,
  Target,
  Award,
  Heart,
  BookOpen,
  Settings,
  MoreHorizontal,
  X,
  Bell,
  LayoutGrid,
  Droplet,
  Volume2,
  Quote,
  Sparkles,
  Plus,
  Minus,
  ShoppingBag
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastAutoSaveTime?: string;
}

export default function Sidebar({ activeTab, setActiveTab, lastAutoSaveTime }: SidebarProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [customQuote, setCustomQuote] = useState("");
  const [stagePresenceScore, setStagePresenceScore] = useState(60);
  const [showQuoteEdit, setShowQuoteEdit] = useState(false);
  const [quoteInputText, setQuoteInputText] = useState("");

  // Sync widget states with localStorage whenever widget sheet opens or storage triggers
  useEffect(() => {
    const syncWidgetData = () => {
      const savedWater = localStorage.getItem("future_artist_hydration_count");
      setWaterCount(savedWater ? parseInt(savedWater) : 0);

      const savedQuote = localStorage.getItem("future_artist_custom_motivation_quote") || "วินัยไม่ได้สร้างเสร็จในวันเดียว แต่สร้างขึ้นในทุกก้าวที่เราทำสม่ำเสมอ";
      setCustomQuote(savedQuote);

      let score = 60;
      const savedSkills = localStorage.getItem("future_artist_skill_scores");
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (typeof parsed.confidence === "number") score = parsed.confidence;
        } catch (e) {}
      }
      setStagePresenceScore(score);
    };

    if (isWidgetsOpen) {
      syncWidgetData();
    }

    window.addEventListener("storage", syncWidgetData);
    return () => window.removeEventListener("storage", syncWidgetData);
  }, [isWidgetsOpen]);

  const handleWaterChange = (change: number) => {
    const next = Math.max(0, waterCount + change);
    setWaterCount(next);
    localStorage.setItem("future_artist_hydration_count", next.toString());
    window.dispatchEvent(new Event("storage"));
  };

  const handleSaveQuote = () => {
    const trimmed = quoteInputText.trim();
    if (trimmed) {
      setCustomQuote(trimmed);
      localStorage.setItem("future_artist_custom_motivation_quote", trimmed);
      window.dispatchEvent(new Event("storage"));
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
    window.dispatchEvent(new Event("storage"));
  };

  const navItems = [
    { id: "dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
    { id: "daily-mode", label: "โหมดประจำวัน", icon: Zap },
    { id: "timer", label: "จับเวลา", icon: Timer },
    { id: "shop", label: "ร้านค้า", icon: ShoppingBag },
    { id: "calendar", label: "ปฏิทิน", icon: Calendar },
    { id: "progress", label: "ความคืบหน้า", icon: BarChart3 },
    { id: "goals", label: "เป้าหมาย", icon: Target },
    { id: "achievements", label: "ความสำเร็จ", icon: Award },
    { id: "health", label: "สุขภาพ", icon: Heart },
    { id: "diary", label: "ไดอารี่", icon: BookOpen },
    { id: "notifications", label: "การแจ้งเตือน", icon: Bell },
    { id: "settings", label: "ตั้งค่า", icon: Settings }
  ];

  // Mobile navigation split
  const primaryMobileItems = [
    { id: "dashboard", label: "หน้าหลัก", icon: LayoutDashboard },
    { id: "daily-mode", label: "โหมดประจำวัน", icon: Zap },
    { id: "timer", label: "จับเวลา", icon: Timer },
  ];

  const secondaryMobileItems = [
    { id: "shop", label: "ร้านค้า", icon: ShoppingBag },
    { id: "goals", label: "เป้าหมาย", icon: Target },
    { id: "calendar", label: "ปฏิทิน", icon: Calendar },
    { id: "progress", label: "ความคืบหน้า", icon: BarChart3 },
    { id: "achievements", label: "ความสำเร็จ", icon: Award },
    { id: "health", label: "สุขภาพ", icon: Heart },
    { id: "diary", label: "ไดอารี่", icon: BookOpen },
    { id: "notifications", label: "การแจ้งเตือน", icon: Bell },
    { id: "settings", label: "ตั้งค่า", icon: Settings }
  ];

  const isSecondaryActive = secondaryMobileItems.some((item) => item.id === activeTab);

  const handleMobileTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Desktop Left Sidebar: elegant and slim-to-wide */}
      <aside 
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 z-20 py-6 px-4"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <img 
            src="https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png" 
            alt="Future Artist Logo" 
            className="w-10 h-10 rounded-[12px] object-cover shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none text-white">Future Artist</h1>
            <p className="text-[10px] text-blue-300 font-medium tracking-wide uppercase mt-1">Notification Engine</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[20px] text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white text-gray-950 font-semibold shadow-xl shadow-white/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & 1-Second Auto Save Live Status */}
        <div className="pt-4 border-t border-white/5 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>บันทึกอัตโนมัติทุก 1วิ: {lastAutoSaveTime || "กำลังทำงาน..."}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">FUTURE ARTIST V1.0.0</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar: sleek, high-performance, 100% rounded-full capsule bar with beautiful premium GLASS styling */}
      <nav 
        id="mobile-navigation"
        className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-gradient-to-b from-white/[0.14] to-white/[0.03] backdrop-blur-[40px] border border-white/[0.18] z-30 flex items-center justify-around px-2 rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.7)] transform-gpu will-change-transform transition-all overflow-visible"
      >
        {primaryMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !isWidgetsOpen;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => handleMobileTabClick(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 focus:outline-none relative z-10"
            >
              <div 
                className={`p-3 rounded-full transition-all duration-300 ease-out transform-gpu flex items-center justify-center ${
                  isActive 
                    ? "bg-white text-gray-950 shadow-[0_8px_20px_rgba(255,255,255,0.4)] -translate-y-[18px] scale-110 border border-white/20" 
                    : "text-gray-400 active:scale-95"
                }`}
              >
                <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
              </div>
              <span className={`text-[9px] mt-0.5 font-medium tracking-wide transition-all duration-300 ${isActive ? "text-white font-bold opacity-100 -translate-y-[6px]" : "text-gray-400 opacity-70"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          id="nav-mobile-more"
          onClick={() => {
            setIsMoreOpen(!isMoreOpen);
            setIsWidgetsOpen(false); // Close widgets if open
          }}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-300 focus:outline-none relative z-10"
        >
          <div 
            className={`p-3 rounded-full transition-all duration-300 ease-out transform-gpu flex items-center justify-center ${
              (isMoreOpen || isSecondaryActive) && !isWidgetsOpen
                ? "bg-blue-500 text-white shadow-[0_8px_20px_rgba(59,130,246,0.4)] -translate-y-[18px] scale-110 border border-blue-400/20" 
                : "text-gray-400 active:scale-95"
            }`}
          >
            {isMoreOpen ? <X size={18} className="stroke-[2.5px]" /> : <MoreHorizontal size={18} className="stroke-[1.8px]" />}
          </div>
          <span className={`text-[9px] mt-0.5 font-medium tracking-wide transition-all duration-300 ${(isMoreOpen || isSecondaryActive) && !isWidgetsOpen ? "text-blue-300 font-bold opacity-100 -translate-y-[6px]" : "text-gray-400 opacity-70"}`}>
            {isMoreOpen ? "ปิด" : "เพิ่มเติม"}
          </span>
        </button>
      </nav>

      {/* Modern, glassmorphic bottom drawer overlay using Framer Motion */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop blur & fade */}
            <motion.div
              id="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-20 transform-gpu"
            />

            {/* Bottom sliding panel */}
            <motion.div
              id="mobile-drawer-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed bottom-22 left-4 right-4 z-25 bg-white/[0.04] backdrop-blur-[24px] p-5 pb-6 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-[28px] flex flex-col gap-4 transform-gpu will-change-transform"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <span className="text-xs font-mono tracking-wider text-blue-400 uppercase font-semibold">
                  ฟีเจอร์เพิ่มเติม
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  แตะเพื่อเข้าใช้งานเครื่องมือ
                </span>
              </div>

              {/* Grid of options */}
              <div className="grid grid-cols-3 gap-2.5">
                {secondaryMobileItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-drawer-${item.id}`}
                      onClick={() => handleMobileTabClick(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-[18px] transition-all duration-200 transform-gpu ${
                        isActive
                          ? "bg-white text-gray-950 font-semibold shadow-xl scale-105"
                          : "bg-white/[0.04] border border-white/[0.03] text-gray-300 hover:bg-white/10 active:scale-95"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
                      <span className="text-[10px] mt-1.5 text-center font-medium line-clamp-1 w-full">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern, glassmorphic widgets drawer overlay using Framer Motion */}
      <AnimatePresence>
        {isWidgetsOpen && (
          <>
            {/* Backdrop blur & fade */}
            <motion.div
              id="mobile-widgets-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWidgetsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40 transform-gpu"
            />

            {/* Bottom sliding panel */}
            <motion.div
              id="mobile-widgets-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="md:hidden fixed bottom-22 left-4 right-4 z-50 bg-gradient-to-b from-white/[0.12] to-white/[0.03] backdrop-blur-[40px] p-5 pb-6 border border-white/[0.18] shadow-[0_24px_50px_rgba(0,0,0,0.8)] rounded-[32px] flex flex-col gap-4 max-h-[70vh] overflow-y-auto transform-gpu will-change-transform"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <LayoutGrid size={16} className="animate-pulse" />
                  </div>
                  <span className="text-sm font-display font-extrabold text-white tracking-tight uppercase">
                    ระบบวิดเจ็ต GLASS อัจฉริยะ
                  </span>
                </div>
                <button
                  id="close-widgets-btn"
                  onClick={() => setIsWidgetsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Grid of Widgets */}
              <div className="space-y-4">
                
                {/* 1. Hydration tracker widget */}
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                      <Droplet size={14} className="animate-bounce text-cyan-400" />
                      <span>ผิวพรรณ & ไฮเดรชัน (Water Cup)</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">เป้าหมาย: 8 แก้ว</span>
                  </div>

                  <div className="my-2.5 flex items-baseline gap-1">
                    <span className="text-3xl font-display font-black text-white">{waterCount}</span>
                    <span className="text-xs text-gray-400">/ 8 แก้ว</span>
                  </div>

                  {/* Progress visual cup indicator */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-3">
                    <div 
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (waterCount / 8) * 100)}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWaterChange(-1)}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition-colors text-xs font-extrabold flex items-center justify-center cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      onClick={() => handleWaterChange(1)}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-400 text-gray-950 hover:bg-cyan-300 transition-colors text-xs font-extrabold flex items-center justify-center cursor-pointer shadow-md shadow-cyan-400/20"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                {/* 2. Audio Chime widget */}
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
                      <Volume2 size={14} />
                      <span>บอร์ดคอร์ดเสียงกระตุ้นความตื่นตัว (Audio Box)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-1.5">
                    <button
                      onClick={() => {
                        try {
                          new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav").play();
                        } catch (_) {}
                      }}
                      className="py-2 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                    >
                      ยินดี
                    </button>
                    <button
                      onClick={() => {
                        try {
                          new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav").play();
                        } catch (_) {}
                      }}
                      className="py-2 text-[10px] font-semibold bg-white/5 hover:bg-violet-500/10 border border-white/10 rounded-lg text-gray-300 hover:text-violet-300 transition-all cursor-pointer"
                    >
                      สำเร็จ
                    </button>
                  </div>
                </div>

                {/* 3. Motivation board widget */}
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Quote size={13} />
                      <span>คำขวัญสร้างแรงบันดาลใจวันนี้</span>
                    </span>
                    <button
                      onClick={() => {
                        setQuoteInputText(customQuote);
                        setShowQuoteEdit(!showQuoteEdit);
                      }}
                      className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      {showQuoteEdit ? "ยกเลิก" : "แก้ไข"}
                    </button>
                  </div>

                  {showQuoteEdit ? (
                    <div className="space-y-1.5 my-2">
                      <input
                        type="text"
                        value={quoteInputText}
                        onChange={(e) => setQuoteInputText(e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                        maxLength={100}
                        placeholder="เขียนคำขวัญของคุณ..."
                      />
                      <button
                        onClick={handleSaveQuote}
                        className="w-full py-1.5 bg-amber-400 text-gray-950 font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        บันทึกคำขวัญ
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300 italic font-medium leading-relaxed my-2.5">
                      "{customQuote}"
                    </p>
                  )}
                </div>

                {/* 4. Stage Presence slider widget */}
                <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-yellow-400" />
                      <span>ระดับเสน่ห์เวที (Stage Presence Aura)</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">
                      {stagePresenceScore} / 100
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={stagePresenceScore}
                    onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 bg-white/5 rounded-lg appearance-none h-1 my-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>ตื่นเต้น</span>
                    <span>พร้อมเปิดตัว!</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
