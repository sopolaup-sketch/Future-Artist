import { 
  Zap, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  UserMinus, 
  Flame, 
  Clock, 
  Info, 
  PlusCircle, 
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Bell,
  Check,
  ShieldCheck,
  Droplet,
  Moon
} from "lucide-react";
import { DailyModeType, DAILY_MODES_CONFIG } from "../types";
import { playChime } from "../utils/audio";

interface DailyModeProps {
  selectedModeToday: DailyModeType;
  selectDailyMode: (modeType: DailyModeType) => boolean;
  getQuotaCounts: () => Record<DailyModeType, number>;
  getTotalModeUsageCounts?: () => Record<DailyModeType, number>;
  checkConsecutiveLazyDays: () => boolean;
  activeExamMode?: boolean;
  toggleExamPeriod?: (enable?: boolean) => void;
}

export default function DailyMode({
  selectedModeToday,
  selectDailyMode,
  getQuotaCounts,
  getTotalModeUsageCounts,
  checkConsecutiveLazyDays,
  activeExamMode = false,
  toggleExamPeriod
}: DailyModeProps) {
  const quotasUsed = getQuotaCounts();
  const totalUsed = getTotalModeUsageCounts ? getTotalModeUsageCounts() : {};
  const today = new Date();
  const monthName = today.toLocaleString("th-TH", { month: "long" });

  const modesList = [
    { type: DailyModeType.FREE_DAY, icon: Flame, desc: "สำหรับวันว่างที่มีเวลาฝึกซ้อมจัดเต็ม 3-5 ชั่วโมง เสริมแกร่งทุกทักษะ" },
    { type: DailyModeType.NORMAL_DAY, icon: Sparkles, desc: "มาตรฐานการฝึกประจำวัน 1.5-2 ชั่วโมง ครอบคลุม เต้น ร้องเพลง การแสดง และอังกฤษ" },
    { type: DailyModeType.STUDY_DAY, icon: Clock, desc: "สำหรับวันที่มีเรียนหนัก 45-60 นาที ซ้อมเต้น ซ้อมร้อง และสะสมศัพท์อังกฤษ" },
    { type: DailyModeType.EXAM_MODE, icon: GraduationCap, desc: "โหมดสอบ (30-45 นาที/วัน) เน้นอ่านหนังสือ วอร์มเสียง ยืดเหยียด ดื่มน้ำ และนอนเร็ว รักษาสตรีคในวันสอบ" },
    { type: DailyModeType.ACTIVITY_DAY, icon: Activity, desc: "สำหรับวันที่มีกิจกรรมโรงเรียน 30 นาที ซ้อมเต้นและร้องเพลงท่อนโปรดเร็วๆ" },
    { type: DailyModeType.LAZY_DAY, icon: UserMinus, desc: "สำหรับวันที่ค่อนข้างเหนื่อยล้า 15 นาที ยืดตัว วอร์มเสียงเบาๆ คลายเคลียด" },
    { type: DailyModeType.NO_TIME_DAY, icon: AlertTriangle, desc: "สำหรับวันยุ่งสุดขีด 5 นาที แพลงก์/ยืดตัวสั้นๆ เพื่อให้วินัยสตรีคไม่ขาด" },
    { type: DailyModeType.SICK_MODE, icon: PlusCircle, desc: "สำหรับวันที่ป่วยหนัก เพื่อพักฟื้นร่างกาย ดื่มน้ำอุ่นและพักผ่อน 100%" }
  ];

  const handleSelect = (type: DailyModeType) => {
    selectDailyMode(type);
  };

  // Warning check for Lazy day consecutives
  const isLazyWarning = checkConsecutiveLazyDays();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Zap className="text-yellow-400 fill-yellow-400" size={26} />
            <span>ระบบเลือกโหมดประจำวัน (Daily Mode System)</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            เลือกโหมดการฝึกที่เหมาะกับพลังงานและเวลาของคุณในวันนี้ มีสตรีคและโควตาจำกัดในแต่ละเดือน!
          </p>
        </div>

        {/* Header Action Buttons: Exam Period Toggle + Rest Day Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="toggle-rest-day-header-btn"
            onClick={() => handleSelect(DailyModeType.SICK_MODE)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 border ${
              selectedModeToday === DailyModeType.SICK_MODE
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
            }`}
          >
            <PlusCircle size={16} className={selectedModeToday === DailyModeType.SICK_MODE ? "text-rose-400 animate-pulse" : "text-gray-400"} />
            <span>{selectedModeToday === DailyModeType.SICK_MODE ? "☕ วันหยุด/พักฟื้น (Active)" : "☕ ตั้งค่าวันหยุด (Rest Day)"}</span>
          </button>

          <button
            id="toggle-exam-period-header-btn"
            onClick={() => toggleExamPeriod && toggleExamPeriod()}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 border ${
              activeExamMode
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
            }`}
          >
            <GraduationCap size={16} className={activeExamMode ? "text-cyan-400 animate-pulse" : "text-gray-400"} />
            <span>{activeExamMode ? "🟢 ช่วงสอบ (ON)" : "⚪ สลับโหมดช่วงสอบ"}</span>
          </button>
        </div>
      </div>

      {/* Lazy Warning Alert */}
      {isLazyWarning && (
        <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-[24px] p-5 flex items-start gap-4">
          <AlertTriangle className="text-orange-400 shrink-0 mt-0.5 animate-pulse" size={24} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-orange-300">แจ้งเตือนวินัย: ใช้ Lazy Day ติดต่อกัน!</h4>
            <p className="text-xs text-gray-300">
              คุณใช้ Lazy Day เกิน 2 วันติดต่อกันแล้วนะ “ลองกลับมาเริ่มจาก 5 นาทีก็ยังดี” หรือเลือก Normal/Study Day เพื่อกระตุ้นพลังงานวันนี้!
            </p>
          </div>
        </div>
      )}

      {/* Quota Monthly Panel Overview */}
      <div className="glass-panel rounded-[30px] p-6">
        <h3 className="font-display font-bold text-base text-white mb-1.5 flex items-center gap-2">
          <Calendar size={16} className="text-blue-400" />
          <span>โควตาโหมดการซ้อมประจำเดือน {monthName}</span>
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          ระบบควบคุมโควตาไม่ให้ใช้งานโหมดง่ายหรือพักป่วยเยอะเกินไป เพื่อรักษาวินัยความเข้มข้นของเส้นทางศิลปิน
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {modesList.map((item) => {
            const config = DAILY_MODES_CONFIG[item.type];
            const used = quotasUsed[item.type] || 0;
            const quota = config.quotaPerMonth;
            const isUnlimited = quota <= 0;
            const remaining = isUnlimited ? Infinity : Math.max(0, quota - used);
            const isNearLimit = !isUnlimited && remaining === 1;
            const isDepleted = !isUnlimited && remaining === 0;

            return (
              <div 
                key={item.type} 
                className={`bg-white/5 border rounded-[20px] p-3 text-center transition-all ${
                  isDepleted 
                    ? "border-red-500/20 opacity-50 bg-red-950/5" 
                    : isNearLimit 
                    ? "border-orange-500/30 bg-orange-500/5 animate-pulse" 
                    : "border-white/10"
                }`}
              >
                <p className="text-[10px] font-bold text-gray-400 truncate">{config.nameThai.split(" ")[0]}</p>
                <div className="my-2">
                  <span className="text-2xl font-display font-black text-white">{used}</span>
                  <span className="text-xs text-gray-500"> / {isUnlimited ? "∞" : quota}</span>
                </div>
                <p className="text-[9px] text-gray-400 mb-1">
                  รวมทั้งหมด: <span className="text-white font-bold">{totalUsed[item.type] || used}</span> ครั้ง
                </p>
                <div className="flex flex-col gap-1 items-center">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    isUnlimited
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                      : isDepleted 
                      ? "bg-red-500/10 text-red-400 border border-red-500/25" 
                      : isNearLimit 
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/25" 
                      : "bg-blue-500/10 text-blue-300 border border-blue-500/25"
                  }`}>
                    {isUnlimited ? "ไม่จำกัด" : isDepleted ? "หมดโควตา" : `เหลือ ${remaining} วัน`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modes Grid Selection */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-white">เลือกโหมดปฏิบัติงานวันนี้</h3>
        
        {selectedModeToday !== DailyModeType.NONE && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-[24px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-400" size={20} />
              <div>
                <p className="text-sm font-bold text-white">คุณได้เลือกโหมดสำหรับวันนี้เรียบร้อยแล้ว</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  โหมดปัจจุบัน: <strong className="text-emerald-300">{DAILY_MODES_CONFIG[selectedModeToday].nameThai}</strong>
                </p>
              </div>
            </div>
            <button 
              id="goto-timer-from-daily-btn"
              onClick={() => {
                const el = document.getElementById("nav-timer");
                if (el) el.click();
              }}
              className="px-4 py-2 bg-emerald-500 text-gray-950 text-xs font-bold rounded-full hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              ไปหน้าจับเวลาซ้อม
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modesList.map((item) => {
            const config = DAILY_MODES_CONFIG[item.type];
            const Icon = item.icon;
            const used = quotasUsed[item.type] || 0;
            const isUnlimited = config.quotaPerMonth <= 0;
            const remaining = isUnlimited ? Infinity : Math.max(0, config.quotaPerMonth - used);
            const isDepleted = !isUnlimited && remaining === 0;
            const isCurrent = selectedModeToday === item.type;

            return (
              <div 
                key={item.type}
                className={`glass-panel rounded-[26px] p-5 border transition-all flex flex-col justify-between ${
                  isCurrent 
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/10 bg-emerald-950/10" 
                    : isDepleted 
                    ? "border-red-500/20 opacity-60 bg-red-950/5"
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-[16px] bg-white/5 border border-white/10 text-white">
                        <Icon size={20} className={isCurrent ? "text-emerald-400" : "text-blue-300"} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-white">{config.nameThai}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span>ระยะเวลารวม {config.durationMinutes} นาที</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-yellow-400 font-semibold">+{config.xpReward} XP</span>
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      isDepleted 
                        ? "bg-red-500/10 text-red-400 border-red-500/25" 
                        : isCurrent 
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" 
                        : isUnlimited
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}>
                      {isDepleted ? "โควตาหมด" : isCurrent ? "ใช้งานอยู่" : isUnlimited ? "ไม่จำกัดโควตา" : `โควตาเหลือ ${remaining} วัน`}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 my-4 leading-normal">
                    {item.desc}
                  </p>

                  {/* Sub-Missions Preview list */}
                  {config.missions.length > 0 && (
                    <div className="bg-black/20 rounded-[18px] p-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ภารกิจที่ต้องทำ ({config.missions.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {config.missions.map(m => (
                          <div key={m.id} className="flex items-center gap-2 text-[11px] text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate flex-1">{m.name}</span>
                            <span className="text-gray-500 font-mono text-[10px] shrink-0">{m.durationMinutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 italic">สะสม {config.xpReward} แต้ม XP เมื่อทำครบ</span>
                  
                  <button
                    id={`select-mode-${item.type}`}
                    onClick={() => handleSelect(item.type)}
                    disabled={isDepleted || selectedModeToday !== DailyModeType.NONE}
                    className={`px-5 py-2.5 rounded-[16px] text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-500 text-gray-950 cursor-default"
                        : isDepleted
                        ? "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                        : selectedModeToday !== DailyModeType.NONE
                        ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                        : "bg-white text-gray-950 hover:bg-blue-400 hover:text-white hover:scale-105 shadow-md shadow-white/5"
                    }`}
                  >
                    {isCurrent ? "✓ เลือกแล้ว" : isDepleted ? "โควตาหมดแล้ว" : selectedModeToday !== DailyModeType.NONE ? "เลือกโหมดอื่นแล้ว" : "เลือกโหมดวันนี้"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
