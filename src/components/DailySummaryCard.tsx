import React, { useState } from "react";
import { 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Heart
} from "lucide-react";
import { DailyModeType, DAILY_MODES_CONFIG, DayProgress, UserProfile } from "../types";
import { getDailyResultTier } from "../utils/dailyResult";

interface DailySummaryCardProps {
  selectedModeToday: DailyModeType;
  activeMissions: { id: string; name: string; completed: boolean }[];
  todayProgress?: DayProgress;
  profile: UserProfile;
  saveMyStreak: () => { success: boolean; message: string };
  setActiveTab?: (tab: string) => void;
}

export default function DailySummaryCard({
  selectedModeToday,
  activeMissions,
  todayProgress,
  profile,
  saveMyStreak,
  setActiveTab
}: DailySummaryCardProps) {
  const [saveStatusMsg, setSaveStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const modeConfig = DAILY_MODES_CONFIG[selectedModeToday];
  const totalMissions = activeMissions.length;
  const completedMissions = activeMissions.filter(m => m.completed).length;
  
  const completionPercent = totalMissions > 0 
    ? Math.round((completedMissions / totalMissions) * 100) 
    : 0;

  const resultTier = getDailyResultTier(completionPercent);
  
  // Calculate proportional XP
  const xpEarned = totalMissions > 0 
    ? Math.round((completedMissions / totalMissions) * (modeConfig?.xpReward || 0)) 
    : 0;

  // Streak status calculation
  const hasStreakToday = completedMissions >= 1;
  
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const isStreakSaverUsedThisMonth = profile.lastStreakSaverMonth === currentMonthStr;

  const handleActivateSaveStreak = () => {
    const res = saveMyStreak();
    setSaveStatusMsg({
      text: res.message,
      isError: !res.success
    });
    setTimeout(() => {
      setSaveStatusMsg(null);
    }, 4000);
  };

  return (
    <div id="daily-summary-card" className="glass-panel rounded-[30px] p-6 border border-white/10 relative overflow-hidden bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-purple-950/20 shadow-2xl space-y-5">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <Award size={18} />
            </span>
            <h3 className="font-display font-black text-lg text-white tracking-tight">
              Daily Summary (สรุปความคืบหน้าวันนี้)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            "ก้าวเล็กๆ ในทุกๆ วัน คือสะพานสู่การเป็นศิลปินระดับโลก"
          </p>
        </div>

        {selectedModeToday !== DailyModeType.NONE && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${modeConfig.color}`}>
            {modeConfig.nameThai.split(" ")[0]}
          </span>
        )}
      </div>

      {selectedModeToday === DailyModeType.NONE ? (
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-gray-300">วันนี้คุณยังไม่ได้เลือกโหมดการฝึกซ้อม</p>
          {setActiveTab && (
            <button
              id="summary-select-mode-btn"
              onClick={() => setActiveTab("daily-mode")}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              เลือกโหมดซ้อมประจำวัน 🚀
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Result Tier Badge & Progress Ring */}
          <div className="md:col-span-5 bg-black/30 border border-white/5 rounded-[24px] p-5 flex flex-col items-center justify-center text-center space-y-3">
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${resultTier.badgeBg}`}>
              {resultTier.title}
            </span>

            <div className="relative my-2 flex items-center justify-center">
              <div className="text-4xl font-display font-black text-white tracking-tight">
                {completionPercent}%
              </div>
            </div>

            <p className="text-xs text-gray-300 font-medium italic leading-relaxed px-2">
              "{resultTier.positiveQuote}"
            </p>
          </div>

          {/* Right Column: Spec #7 Metrics Breakdown */}
          <div className="md:col-span-7 space-y-3">
            <div className="bg-white/5 border border-white/5 rounded-[20px] p-4 space-y-2.5">
              
              {/* Completed % */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-400" />
                  <span>• Completed :</span>
                </span>
                <span className="font-bold text-white font-mono">{completionPercent}%</span>
              </div>

              {/* Missions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>• Missions :</span>
                </span>
                <span className="font-bold text-emerald-300 font-mono">
                  {completedMissions} / {totalMissions} ภารกิจ
                </span>
              </div>

              {/* XP */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span>• XP :</span>
                </span>
                <span className="font-bold text-yellow-300 font-mono">
                  +{xpEarned} XP
                </span>
              </div>

              {/* Streak */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                  <Flame size={14} className="text-orange-400" />
                  <span>• Streak :</span>
                </span>
                <span className="font-bold font-mono">
                  {hasStreakToday ? (
                    <span className="text-orange-400">+1 Daily Streak (ต่อเนื่อง {profile.currentStreak} วัน)</span>
                  ) : profile.lastStreakSaverDate === today.toISOString().split("T")[0] ? (
                    <span className="text-blue-400">Streak Preserved (รักษาไว้แล้ว)</span>
                  ) : (
                    <span className="text-gray-500">รอเริ่มทำอย่างน้อย 1 ภารกิจ</span>
                  )}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <span className="text-gray-400 font-medium">• Status :</span>
                <span className={`font-black tracking-wide ${resultTier.color}`}>
                  {resultTier.title}
                </span>
              </div>

            </div>

            {/* Save My Streak System Button (Spec #6) */}
            {!hasStreakToday && (
              <div className="pt-1">
                <button
                  id="activate-save-streak-btn"
                  onClick={handleActivateSaveStreak}
                  disabled={isStreakSaverUsedThisMonth}
                  className={`w-full py-2.5 px-4 rounded-[18px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isStreakSaverUsedThisMonth
                      ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  }`}
                >
                  <ShieldCheck size={16} className={isStreakSaverUsedThisMonth ? "text-gray-500" : "text-emerald-400 animate-pulse"} />
                  <span>
                    {isStreakSaverUsedThisMonth
                      ? "ใช้สิทธิ์ Save My Streak ของเดือนนี้แล้ว (1 ครั้ง/เดือน)"
                      : "เปิดใช้งาน Save My Streak (รักษา Streak ไว้ 1 ครั้ง/เดือน)"}
                  </span>
                </button>

                {saveStatusMsg && (
                  <p className={`text-[11px] font-semibold mt-2 text-center ${saveStatusMsg.isError ? "text-red-400" : "text-emerald-300 animate-fade-in"}`}>
                    {saveStatusMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Encouragement Footer Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 rounded-[20px] p-3 flex items-center gap-2.5 text-xs text-gray-300">
        <Heart size={16} className="text-pink-400 shrink-0" />
        <span className="leading-normal">
          <strong>หลักการพัฒนาตนเอง:</strong> การทำได้เพียง 1 ภารกิจ (1%) ก็ถือก้าวสำคัญของการมีวินัย ไม่มีการติดลบ XP หรือลด Level เพื่อให้คุณพัฒนาตนเองอย่างมีความสุขในระยะยาว!
        </span>
      </div>

    </div>
  );
}
