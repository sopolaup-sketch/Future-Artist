import { useState } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  BookOpen, 
  Heart, 
  Award, 
  Info,
  CalendarDays,
  Clock,
  Trash
} from "lucide-react";
import { DailyModeType, DAILY_MODES_CONFIG, DayProgress, DiaryEntry, HealthLog } from "../types";

interface CalendarViewProps {
  history: DayProgress[];
  diaryEntries: DiaryEntry[];
  healthLogs: HealthLog[];
}

export default function CalendarView({
  history,
  diaryEntries,
  healthLogs
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    dateStr: string;
    progress?: DayProgress;
    diary?: DiaryEntry;
    health?: HealthLog;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Color mappings for calendar days
  const getCalendarModeColorClass = (modeType?: DailyModeType): string => {
    if (!modeType) return "bg-gray-800/20 text-gray-600 hover:bg-gray-800/40 border border-white/5";
    switch (modeType) {
      case DailyModeType.FREE_DAY:
        return "bg-emerald-500 text-gray-950 font-bold border border-emerald-400/30 hover:scale-105 shadow-md shadow-emerald-500/20";
      case DailyModeType.NORMAL_DAY:
        return "bg-blue-500 text-gray-950 font-bold border border-blue-400/30 hover:scale-105 shadow-md shadow-blue-500/20";
      case DailyModeType.STUDY_DAY:
        return "bg-yellow-400 text-gray-950 font-bold border border-yellow-300/30 hover:scale-105 shadow-md shadow-yellow-400/20";
      case DailyModeType.ACTIVITY_DAY:
        return "bg-purple-500 text-white font-bold border border-purple-400/30 hover:scale-105 shadow-md shadow-purple-500/20";
      case DailyModeType.LAZY_DAY:
        return "bg-orange-500 text-gray-950 font-bold border border-orange-400/30 hover:scale-105 shadow-md shadow-orange-500/20";
      case DailyModeType.NO_TIME_DAY:
        return "bg-red-500 text-white font-bold border border-red-400/30 hover:scale-105 shadow-md shadow-red-500/20";
      case DailyModeType.SICK_MODE:
        return "bg-rose-950 text-rose-300 border border-rose-500/30 hover:scale-105";
      default:
        return "bg-gray-800/20 text-gray-500 border border-white/5";
    }
  };

  // Navigations
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days list creator
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];

    // Prepend empty cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Populate day values
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      days.push(dayNum);
    }

    return days;
  };

  const monthName = currentDate.toLocaleString("th-TH", { month: "long" });
  const allDays = getDaysInMonth();

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const progress = history.find(h => h.date === dateStr);
    const diary = diaryEntries.find(d => d.date === dateStr);
    const health = healthLogs.find(hl => hl.date === dateStr);

    setSelectedDayDetails({
      dateStr,
      progress,
      diary,
      health
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Calendar className="text-blue-400" size={26} />
          <span>ปฏิทินฝึกซ้อมรายวัน (Calendar System)</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          บันทึกประวัติการพัฒนาตนเองรายวัน แยกตามสัดส่วนสีประเภทรหัสโหมด เพื่อให้เห็นภาพรวมระเบียบวินัยตลอดปี
        </p>
      </div>

      {/* Main Layout: Left Calendar Grid, Right Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Calendar Board (Span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-[30px] p-6">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-extrabold text-lg text-white">
              {monthName} <span className="text-blue-400 font-mono">{year + 543}</span>
            </h3>

            <div className="flex items-center gap-2">
              <button 
                id="cal-prev-month"
                onClick={handlePrevMonth} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                id="cal-next-month"
                onClick={handleNextMonth} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-4 uppercase">
            <div>อา</div>
            <div>จ</div>
            <div>อ</div>
            <div>พ</div>
            <div>พฤ</div>
            <div>ศ</div>
            <div>ส</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {allDays.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const progress = history.find(h => h.date === dateStr);
              const hasNotes = diaryEntries.some(d => d.date === dateStr);
              const hasHealth = healthLogs.some(h => h.date === dateStr);
              const isToday = new Date().toISOString().split("T")[0] === dateStr;

              return (
                <button
                  key={`day-${dayNum}`}
                  id={`day-btn-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`aspect-square rounded-[18px] flex flex-col items-center justify-center relative transition-all duration-250 cursor-pointer ${getCalendarModeColorClass(
                    progress?.modeType
                  )} ${isToday ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d0f12]" : ""}`}
                >
                  <span className="text-xs font-mono font-bold">{dayNum}</span>
                  
                  {/* Indicators (Diary, Health) */}
                  <div className="absolute bottom-1.5 flex gap-1 justify-center">
                    {hasNotes && (
                      <span className="w-1 h-1 rounded-full bg-cyan-400" title="มีบันทึกไดอารี่" />
                    )}
                    {hasHealth && (
                      <span className="w-1 h-1 rounded-full bg-rose-400" title="มีบันทึกสุขภาพ" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Guides Legend */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">ดรรชนีสัญลักษณ์สีประจำโหมด</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-300">Free Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-300">Normal Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-gray-300">Study Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-300">Activity Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-gray-300">Lazy Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-300">No Time Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-950 border border-rose-500/20" />
                <span className="text-gray-300">Sick Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-800/30 border border-white/5" />
                <span className="text-gray-400">ยังไม่มีการบันทึก</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Day Details & Diary Review (Span 5) */}
        <div className="lg:col-span-5">
          {selectedDayDetails ? (
            <div className="glass-panel rounded-[30px] p-6 space-y-6 relative overflow-hidden animate-fade-in">
              
              {/* Card Header with date info */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-display font-extrabold text-lg text-white">
                    รายละเอียดวันที่ {new Date(selectedDayDetails.dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{selectedDayDetails.dateStr}</p>
                </div>
                <button 
                  id="close-cal-details"
                  onClick={() => setSelectedDayDetails(null)} 
                  className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full cursor-pointer"
                >
                  ปิดหน้านี้
                </button>
              </div>

              {/* 1. Daily Progress review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <CalendarDays size={14} className="text-blue-400" />
                    <span>ข้อมูลการซ้อม</span>
                  </span>
                  {selectedDayDetails.progress ? (
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${DAILY_MODES_CONFIG[selectedDayDetails.progress.modeType].color}`}>
                      {DAILY_MODES_CONFIG[selectedDayDetails.progress.modeType].nameThai}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">ไม่ได้เข้าซ้อม</span>
                  )}
                </div>

                {selectedDayDetails.progress ? (
                  <div className="bg-black/20 rounded-[20px] p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">สถานะของวัน:</span>
                      <span className={selectedDayDetails.progress.completed ? "text-emerald-400 font-bold" : "text-yellow-400"}>
                        {selectedDayDetails.progress.completed ? "✓ บรรลุเป้าหมายครบถ้วน" : "⌛ ยังทำภารกิจไม่เสร็จสิ้น"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">XP ที่ได้รับวันนี้:</span>
                      <span className="text-yellow-400 font-bold font-mono">+{selectedDayDetails.progress.xpEarned} XP</span>
                    </div>

                    {/* Missions sub list */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">สรุปงาน ({selectedDayDetails.progress.missions.length}):</p>
                      {selectedDayDetails.progress.missions.map(m => (
                        <div key={m.id} className="flex items-center gap-2 text-xs text-gray-300 justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${m.completed ? "bg-emerald-400" : "bg-gray-600"}`} />
                            <span className={`truncate ${m.completed ? "line-through text-gray-500" : ""}`}>{m.name}</span>
                          </div>
                          <span className="text-gray-500 font-mono text-[10px]">{m.durationMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-white/3 p-3 rounded-[16px] text-center">ไม่มีข้อมูลการเลือกโหมดซ้อมและการจับเวลาของวันนี้</p>
                )}
              </div>

              {/* 2. Diary review */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                  <BookOpen size={14} className="text-cyan-400" />
                  <span>บันทึกความรู้สึกศิลปิน (Secret Diary)</span>
                </span>

                {selectedDayDetails.diary ? (
                  <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-[20px] p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">ความรู้สึก:</span>
                      <span className="font-semibold text-cyan-300">{selectedDayDetails.diary.mood}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">ความสำเร็จ:</span>
                      <span className="font-bold text-yellow-400">{selectedDayDetails.diary.progressPercent}%</span>
                    </div>
                    
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div>
                        <p className="text-[10px] text-gray-500">🌟 สิ่งที่ภูมิใจที่สุดในวันนี้:</p>
                        <p className="text-xs text-gray-200 mt-0.5 leading-relaxed bg-black/10 p-2.5 rounded-[12px]">{selectedDayDetails.diary.prideText}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">📅 แผนเป้าหมายวันพรุ่งนี้:</p>
                        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed bg-black/10 p-2.5 rounded-[12px]">{selectedDayDetails.diary.tomorrowPlan}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-white/3 p-3 rounded-[16px] text-center">วันนี้ไม่ได้จดบันทึกไดอารี่ลับ</p>
                )}
              </div>

              {/* 3. Health logs review */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                  <Heart size={14} className="text-rose-400" />
                  <span>ข้อมูลน้ำหนักและสุขภาพ</span>
                </span>

                {selectedDayDetails.health ? (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-[20px] p-4 grid grid-cols-2 gap-3.5">
                    <div>
                      <p className="text-[10px] text-gray-500">ส่วนสูง / น้ำหนัก:</p>
                      <p className="text-xs font-bold text-white mt-1">
                        {selectedDayDetails.health.heightCm} ซม. / {selectedDayDetails.health.weightKg} กก.
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">เวลานอนรวม:</p>
                      <p className="text-xs font-bold text-white mt-1">{selectedDayDetails.health.sleepHours} ชั่วโมง</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">ปริมาณน้ำดื่ม:</p>
                      <p className="text-xs font-bold text-cyan-300 mt-1">{selectedDayDetails.health.waterIntakeMl} มล.</p>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-white/5">
                      <p className="text-[10px] text-gray-500">บันทึกออกกำลังกาย:</p>
                      <p className="text-xs text-gray-300 mt-1 italic">{selectedDayDetails.health.exerciseNotes || "-"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-white/3 p-3 rounded-[16px] text-center">วันนี้ไม่ได้อัปเดตข้อมูลสุขภาพประเด็นส่วนสูงและน้ำหนัก</p>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-[30px] p-8 text-center h-full flex flex-col justify-center items-center py-16 text-gray-500">
              <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-3.5">
                <Info size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white">วิเคราะห์ข้อมูลรายวัน</h4>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                กรุณาคลิกเลือกวันที่ในตารางปฏิทินทางด้านซ้ายเพื่อดึงข้อมูลประวัติการฝึกซ้อม, ความรู้สึกจดบันทึก และสถิติร่างกายเชิงลึก
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
