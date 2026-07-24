import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  CheckCircle, 
  Music, 
  AlertCircle, 
  Compass, 
  Award,
  ListTodo,
  TrendingUp,
  Volume2,
  Timer,
  Sparkles,
  Lock,
  FileText,
  Send,
  X,
  Clock,
  CheckCircle2,
  CalendarCheck,
  MessageSquare,
  Coffee,
  Mic,
  Activity,
  Sliders
} from "lucide-react";
import { DailyModeType, DAILY_MODES_CONFIG, Mission, UserProfile } from "../types";
import { playChime } from "../utils/audio";
import { 
  startLiveActivity, 
  updateLiveActivity, 
  pauseLiveActivity, 
  resumeLiveActivity, 
  stopLiveActivity 
} from "../services/liveActivity";

interface TimerViewProps {
  profile?: UserProfile;
  selectedModeToday: DailyModeType;
  activeMissions: Mission[];
  toggleMissionComplete: (missionId: string) => void;
  completeAllMissionsToday: () => void;
  setActiveTab: (tab: string) => void;
  triggerNotification?: (title: string, message: string, category: string, sound?: "success" | "complete" | "click" | "warning") => void;
  submitTrainingAppeal?: (appealData: {
    category: "extra_practice" | "bonus_mission" | "time_override" | "other";
    reasonText: string;
  }) => { success: boolean; message: string };
}

export type TimerPresetType = "vocal" | "dance" | "break" | "custom" | "exam" | "pomodoro";

export default function TimerView({
  profile,
  selectedModeToday,
  activeMissions,
  toggleMissionComplete,
  completeAllMissionsToday,
  setActiveTab,
  triggerNotification,
  submitTrainingAppeal
}: TimerViewProps) {
  // --- Active Mission & Timer Preset Tracker ---
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [selectedTimerType, setSelectedTimerType] = useState<TimerPresetType>("vocal");
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [originalDuration, setOriginalDuration] = useState<number>(0); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCelebrated, setIsCelebrated] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Custom Duration Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customInputMins, setCustomInputMins] = useState<number>(45);

  // Appeal Modal State
  const [isAppealModalOpen, setIsAppealModalOpen] = useState<boolean>(false);
  const [appealCategory, setAppealCategory] = useState<"extra_practice" | "bonus_mission" | "time_override" | "other">("extra_practice");
  const [appealReason, setAppealReason] = useState<string>("");
  const [appealMessage, setAppealMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const timerTypeConfigs: Record<TimerPresetType, { name: string; icon: string; defaultMins: number; color: string }> = {
    vocal: { name: "Vocal Practice", icon: "🎤", defaultMins: 30, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    dance: { name: "Dance Practice", icon: "💃", defaultMins: 45, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    break: { name: "Break Timer", icon: "☕", defaultMins: 15, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    custom: { name: "Custom Training", icon: "⚡", defaultMins: 60, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    exam: { name: "Exam Mode Timer", icon: "🏆", defaultMins: 30, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    pomodoro: { name: "Pomodoro Practice", icon: "🍅", defaultMins: 25, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" }
  };

  // Restore active timer state on mount
  useEffect(() => {
    const savedTimerId = localStorage.getItem("future_artist_active_timer_id");
    const savedRunning = localStorage.getItem("future_artist_active_timer_running") === "true";
    const savedOriginal = localStorage.getItem("future_artist_active_timer_original");
    
    if (savedTimerId && activeMissions.some(m => m.id === savedTimerId)) {
      const originalSecs = savedOriginal ? parseInt(savedOriginal) : 0;
      setActiveMissionId(savedTimerId);
      setOriginalDuration(originalSecs);

      if (savedRunning) {
        const savedEnd = localStorage.getItem("future_artist_active_timer_end");
        if (savedEnd) {
          const endTime = parseInt(savedEnd);
          const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsRunning(true);
          } else {
            // Timer finished while we were away or app was closed!
            setTimeLeft(0);
            setIsRunning(false);
            setTimeout(() => {
              handleTimerFinished(savedTimerId);
            }, 100);
          }
        } else {
          setTimeLeft(0);
          setIsRunning(false);
        }
      } else {
        const savedLeft = localStorage.getItem("future_artist_active_timer_left");
        const leftSecs = savedLeft ? parseInt(savedLeft) : 0;
        setTimeLeft(leftSecs);
        setIsRunning(false);
      }
    } else {
      // Default: Find first incomplete mission
      if (activeMissions.length > 0) {
        const firstIncomplete = activeMissions.find(m => !m.completed) || activeMissions[0];
        setActiveMissionId(firstIncomplete.id);
        setTimeLeft(firstIncomplete.durationMinutes * 60);
        setOriginalDuration(firstIncomplete.durationMinutes * 60);
        setIsRunning(false);
      }
    }
  }, [activeMissions]);

  // Persist timer state to localStorage during tick and duration updates
  useEffect(() => {
    if (!activeMissionId) return;

    localStorage.setItem("future_artist_active_timer_id", activeMissionId);
    localStorage.setItem("future_artist_active_timer_running", String(isRunning));
    localStorage.setItem("future_artist_active_timer_original", String(originalDuration));

    if (isRunning) {
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem("future_artist_active_timer_end", String(endTime));
    } else {
      localStorage.setItem("future_artist_active_timer_left", String(timeLeft));
    }
  }, [timeLeft, isRunning, activeMissionId, originalDuration]);

  // Determine current stage & quotes dynamically based on elapsed time
  const getCurrentStageInfo = (elapsedSecs: number, totalSecs: number) => {
    const elapsedMins = Math.floor(elapsedSecs / 60);
    let stageName = "🧘 Warm Up";
    let stageProgress = `${elapsedMins} / 20 Mins`;

    if (elapsedMins >= 100) {
      stageName = "🎭 Acting Practice";
      stageProgress = `${elapsedMins - 100} / 20 Mins`;
    } else if (elapsedMins >= 80) {
      stageName = "🇬🇧 English Practice";
      stageProgress = `${elapsedMins - 80} / 20 Mins`;
    } else if (elapsedMins >= 50) {
      stageName = "💃 Dance Practice";
      stageProgress = `${elapsedMins - 50} / 30 Mins`;
    } else if (elapsedMins >= 20) {
      stageName = "🎤 Singing Practice";
      stageProgress = `${elapsedMins - 20} / 30 Mins`;
    }

    const aiQuotes = [
      "อีก 15 นาทีก็ได้พักแล้ว!",
      "ระบบตรวจพบความขี้เกียจ 42%",
      "ไมค์คิดถึงคุณนะ!",
      "BTS ไม่ได้เดบิวต์เพราะนอนทั้งวันนะ!",
      "Future You ฝากมาบอกว่า 'ขอบคุณที่ไม่ยอมแพ้'"
    ];
    const aiCoachQuote = aiQuotes[Math.floor((elapsedMins / 5) % aiQuotes.length)];
    const waterReminder = (elapsedMins > 0 && elapsedMins % 30 === 0) ? "Drink 1 Glass (+5 EXP)" : "";

    return {
      stageName,
      stageProgress,
      aiCoachQuote,
      waterReminder
    };
  };

  // Handle countdown tick and Live Activity sync
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleTimerFinished();
            stopLiveActivity();
            return 0;
          }
          const nextSec = prev - 1;
          const totalSecs = originalDuration > 0 ? originalDuration : 1800;
          const elapsedSecs = totalSecs - nextSec;

          // Update Live Activity every 5 seconds
          if (nextSec % 5 === 0) {
            const config = timerTypeConfigs[selectedTimerType];
            const stageInfo = getCurrentStageInfo(elapsedSecs, totalSecs);
            
            updateLiveActivity({
              title: "Future Artist",
              modeName: DAILY_MODES_CONFIG[selectedModeToday]?.nameEng || DAILY_MODES_CONFIG[selectedModeToday]?.nameThai || "Artist Mode",
              timerType: config.name,
              currentActivity: stageInfo.stageName,
              currentActivityProgress: stageInfo.stageProgress,
              totalSeconds: totalSecs,
              remainingSeconds: nextSec,
              expGained: 250,
              coinsGained: 150,
              nextRewardInfo: "+50 Coins (10m)",
              todaysGoalProgress: `${Math.floor(elapsedSecs / 60)}m / ${Math.floor(totalSecs / 60)}m`,
              aiCoachQuote: stageInfo.aiCoachQuote,
              waterReminder: stageInfo.waterReminder,
              levelInfo: `LV ${profile?.level || 1}`,
              dailyMissionInfo: "7/10 Complete",
              streakDays: profile?.currentStreak || 1,
              icon: config.icon,
              isPaused: false,
              isFinished: false
            });
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activeMissionId, selectedTimerType, originalDuration, selectedModeToday, profile]);

  const setTimerPresetDuration = (minutes: number) => {
    const totalSecs = minutes * 60;
    setIsRunning(false);
    setTimeLeft(totalSecs);
    setOriginalDuration(totalSecs);
    stopLiveActivity();

    localStorage.setItem("future_artist_active_timer_running", "false");
    localStorage.setItem("future_artist_active_timer_original", String(totalSecs));
    localStorage.setItem("future_artist_active_timer_left", String(totalSecs));
  };

  const selectMission = (id: string, mins: number) => {
    setIsRunning(false);
    setActiveMissionId(id);
    setTimeLeft(mins * 60);
    setOriginalDuration(mins * 60);
    stopLiveActivity();

    localStorage.setItem("future_artist_active_timer_id", id);
    localStorage.setItem("future_artist_active_timer_running", "false");
    localStorage.setItem("future_artist_active_timer_original", String(mins * 60));
    localStorage.setItem("future_artist_active_timer_left", String(mins * 60));
  };

  const handleTimerFinished = (idOverride?: string) => {
    // 1. Play alert chimes
    playChime("complete");

    // 2. Vibrate physical device if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // 3. Shake visual interface
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 800);

    // 4. Set celebration state
    setIsCelebrated(true);
    setTimeout(() => setIsCelebrated(false), 4000);

    // 5. Stop Live Activity
    stopLiveActivity();

    // 6. Complete in database
    const targetId = idOverride || activeMissionId;
    if (targetId) {
      toggleMissionComplete(targetId);
      
      const currentMission = activeMissions.find(m => m.id === targetId);
      const missionName = currentMission ? currentMission.name : timerTypeConfigs[selectedTimerType].name;
      if (triggerNotification) {
        triggerNotification(
          "ฝึกซ้อมเสร็จสิ้น! 🎉",
          `ยินดีด้วย! บรรลุการซ้อม: ${missionName} สำเร็จแล้ว`,
          "จับเวลาฝึกซ้อม",
          "complete"
        );
      }
    }

    // Clear saved timers on finish
    localStorage.removeItem("future_artist_active_timer_id");
    localStorage.removeItem("future_artist_active_timer_running");
    localStorage.removeItem("future_artist_active_timer_original");
    localStorage.removeItem("future_artist_active_timer_end");
    localStorage.removeItem("future_artist_active_timer_left");
  };

  const handleTogglePlay = () => {
    playChime("click");
    setIsRunning((prev) => {
      const nextVal = !prev;
      localStorage.setItem("future_artist_active_timer_running", String(nextVal));
      
      const config = timerTypeConfigs[selectedTimerType];

      if (nextVal) {
        const endTime = Date.now() + timeLeft * 1000;
        localStorage.setItem("future_artist_active_timer_end", String(endTime));
        // Start or resume Live Activity
        const totalSecs = originalDuration > 0 ? originalDuration : timeLeft;
        const elapsedSecs = totalSecs - timeLeft;
        const stageInfo = getCurrentStageInfo(elapsedSecs, totalSecs);

        startLiveActivity({
          title: "Future Artist",
          modeName: DAILY_MODES_CONFIG[selectedModeToday]?.nameEng || DAILY_MODES_CONFIG[selectedModeToday]?.nameThai || "Artist Mode",
          timerType: config.name,
          currentActivity: stageInfo.stageName,
          currentActivityProgress: stageInfo.stageProgress,
          totalSeconds: totalSecs,
          remainingSeconds: timeLeft,
          expGained: 250,
          coinsGained: 150,
          nextRewardInfo: "+50 Coins (10m)",
          todaysGoalProgress: `${Math.floor(elapsedSecs / 60)}m / ${Math.floor(totalSecs / 60)}m`,
          aiCoachQuote: stageInfo.aiCoachQuote,
          waterReminder: stageInfo.waterReminder,
          levelInfo: `LV ${profile?.level || 1}`,
          dailyMissionInfo: "7/10 Complete",
          streakDays: profile?.currentStreak || 1,
          icon: config.icon,
          isPaused: false,
          isFinished: false
        });
      } else {
        localStorage.setItem("future_artist_active_timer_left", String(timeLeft));
        // Pause Live Activity
        const totalSecs = originalDuration > 0 ? originalDuration : timeLeft;
        const elapsedSecs = totalSecs - timeLeft;
        const stageInfo = getCurrentStageInfo(elapsedSecs, totalSecs);

        pauseLiveActivity({
          title: "Future Artist",
          modeName: DAILY_MODES_CONFIG[selectedModeToday]?.nameEng || DAILY_MODES_CONFIG[selectedModeToday]?.nameThai || "Artist Mode",
          timerType: config.name,
          currentActivity: stageInfo.stageName,
          currentActivityProgress: stageInfo.stageProgress,
          totalSeconds: totalSecs,
          remainingSeconds: timeLeft,
          expGained: 250,
          coinsGained: 150,
          nextRewardInfo: "+50 Coins (10m)",
          todaysGoalProgress: `${Math.floor(elapsedSecs / 60)}m / ${Math.floor(totalSecs / 60)}m`,
          aiCoachQuote: stageInfo.aiCoachQuote,
          waterReminder: stageInfo.waterReminder,
          levelInfo: `LV ${profile?.level || 1}`,
          dailyMissionInfo: "7/10 Complete",
          streakDays: profile?.currentStreak || 1,
          icon: config.icon,
          isPaused: true,
          isFinished: false
        });
      }
      return nextVal;
    });
  };

  const handleReset = () => {
    playChime("click");
    setIsRunning(false);
    setTimeLeft(originalDuration);
    stopLiveActivity();
    localStorage.setItem("future_artist_active_timer_left", String(originalDuration));
    localStorage.setItem("future_artist_active_timer_running", "false");
  };

  const handleSkip = () => {
    if (!activeMissionId) return;
    playChime("click");
    setIsRunning(false);
    
    // Find next mission index
    const currentIdx = activeMissions.findIndex(m => m.id === activeMissionId);
    if (currentIdx >= 0) {
      const nextIdx = (currentIdx + 1) % activeMissions.length;
      const nextMission = activeMissions[nextIdx];
      selectMission(nextMission.id, nextMission.durationMinutes);
    }
  };

  const handleCompleteActiveInstant = () => {
    if (!activeMissionId) return;
    playChime("success");
    setIsRunning(false);
    toggleMissionComplete(activeMissionId);
    
    // Automatically switch to next incomplete mission if exists
    const currentIdx = activeMissions.findIndex(m => m.id === activeMissionId);
    const nextIncomplete = activeMissions.find((m, idx) => idx !== currentIdx && !m.completed);
    if (nextIncomplete) {
      selectMission(nextIncomplete.id, nextIncomplete.durationMinutes);
    } else {
      setTimeLeft(0);
    }
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
  };

  // SVG Circular progress stroke calculations
  const progressPercent = originalDuration > 0 
    ? ((originalDuration - timeLeft) / originalDuration) * 100 
    : 0;
  const strokeDashoffset = 280 - (280 * progressPercent) / 100;

  if (selectedModeToday === DailyModeType.NONE) {
    return (
      <div className="space-y-6 animate-fade-in pb-12 text-center max-w-xl mx-auto pt-8">
        <div className="w-20 h-20 rounded-[26px] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto text-yellow-400">
          <AlertCircle size={36} />
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-2xl text-white">ยังไม่มีการเลือกโหมดซ้อมประจำวัน</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            คุณจำเป็นต้องเลือกสไตล์การพัฒนาตนเองวันนี้ก่อน เพื่อให้ระบบดึงตารางภารกิจและเป้าหมายเวลาที่ต้องพิชิตมาวิเคราะห์ความสามารถ
          </p>
        </div>
        <div className="pt-4">
          <button
            id="timer-select-mode-redirect-btn"
            onClick={() => setActiveTab("daily-mode")}
            className="px-6 py-3 bg-white text-gray-950 font-bold rounded-full hover:bg-blue-400 hover:text-white transition-all cursor-pointer shadow-lg shadow-white/5"
          >
            เลือกโหมดฝึกฝนเลย 🚀
          </button>
        </div>
      </div>
    );
  }

  const activeMissionObj = activeMissions.find(m => m.id === activeMissionId);
  const totalMissions = activeMissions.length;
  const completedMissions = activeMissions.filter(m => m.completed).length;
  const allCompleted = totalMissions > 0 && activeMissions.every(m => m.completed);

  // Prevent undoing completed missions
  const handleAttemptToggleMission = (missionId: string, isCurrentlyCompleted: boolean) => {
    if (isCurrentlyCompleted) {
      playChime("warning");
      if (triggerNotification) {
        triggerNotification(
          "🔒 ไม่สามารถยกเลิกได้",
          "ภารกิจที่ทำสำเร็จแล้วถูกบันทึกเข้าระบบแล้ว ไม่สามารถกดยกเลิกย้อนหลังได้",
          "จับเวลาฝึกซ้อม",
          "warning"
        );
      }
      return;
    }
    toggleMissionComplete(missionId);
  };

  const handleSendAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTrainingAppeal) return;
    if (!appealReason.trim()) {
      setAppealMessage("กรุณากรอกรายละเอียดคำร้องให้ชัดเจน");
      return;
    }

    const res = submitTrainingAppeal({
      category: appealCategory,
      reasonText: appealReason.trim()
    });

    if (res.success) {
      setAppealReason("");
      setAppealMessage("ยื่นคำร้องเรียบร้อยแล้ว! คำร้องของคุณถูกบันทึกในระบบเรียบร้อย");
      setTimeout(() => {
        setAppealMessage(null);
        setIsAppealModalOpen(false);
      }, 1500);
    }
  };

  const appealsList = profile?.trainingAppeals || [];

  // =========================================================================
  // SCREEN: ALL MISSIONS COMPLETED (ภารกิจทำครบแล้ว แล้วพบกันวันหน้า + ยื่นคำร้อง)
  // =========================================================================
  if (allCompleted) {
    return (
      <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
        
        {/* Victory Header Banner */}
        <div className="glass-panel rounded-[32px] p-8 md:p-10 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-gray-900 to-blue-950/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10 animate-bounce">
            <CalendarCheck size={40} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
            <Lock size={12} />
            <span>ภารกิจฝึกซ้อมวันนี้สำเร็จ 100% (ล็อคการบันทึก)</span>
          </div>

          <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
            🎉 ภารกิจทำครบแล้วแล้วพบกันวันหน้า!
          </h2>
          
          <p className="text-gray-300 text-sm md:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
            ยินดีด้วย! คุณได้ฝึกซ้อมและพิชิตภารกิจครบถ้วนทุกรายการสำหรับโหมด <span className="text-emerald-300 font-bold">{DAILY_MODES_CONFIG[selectedModeToday].nameThai}</span> วันนี้เรียบร้อยแล้ว ระบบได้ประมวลผล XP และ Coins เข้าระดับของคุณแล้ว โดยจะไม่สามารถกดยกเลิกหรือย้อนกลับสิ่งที่ทำได้เพื่อรักษาความซื่อสัตย์ในวินัย
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>ภารกิจทั้งหมด: <strong className="text-white font-mono">{totalMissions}/{totalMissions}</strong> ข้อ</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-yellow-400" />
              <span>สถานะ: <strong className="text-yellow-300">ล็อคข้อมูล (ไม่สามารถกดยกเลิกได้)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-blue-400" />
              <span>เตรียมความพร้อมสำหรับวันถัดไป</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Completed Missions List (Span 7) */}
          <div className="lg:col-span-7 glass-panel rounded-[30px] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <ListTodo size={20} className="text-emerald-400" />
                <span>รายการภารกิจที่สำเร็จแล้ววันนี้</span>
              </h3>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                ✓ สำเร็จครบ 100%
              </span>
            </div>

            <div className="space-y-3">
              {activeMissions.map((mission, idx) => (
                <div
                  key={mission.id}
                  className="p-4 rounded-[22px] bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-gray-950 font-bold flex items-center justify-center text-xs shadow-md shadow-emerald-500/20 shrink-0">
                      ✓
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{mission.name}</p>
                      <p className="text-xs text-emerald-400 font-mono mt-0.5">ระยะเวลา: {mission.durationMinutes} นาที</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock size={10} />
                      <span>สำเร็จแล้ว</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-[22px] text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                <Lock size={12} className="text-yellow-400" />
                <span>ทำไมถึงไม่สามารถกดยกเลิกภารกิจได้?</span>
              </p>
              <p className="text-[11px] leading-relaxed text-gray-400">
                ระบบถูกออกแบบขึ้นเพื่อสร้างวินัยของศิลปินอย่างยั่งยืน เมื่อคุณทำภารกิจสำเร็จแล้ว XP และ Coins จะถูกโอนเข้าบัญชีโดยตรง การไม่อนุญาตให้กดยกเลิกช่วยป้องกันความผิดพลาดและรักษาเกียรติประวัติการฝึกซ้อมของคุณไว้ในระบบ Cloud
              </p>
            </div>
          </div>

          {/* Right Column: Appeal / Request Section (Span 5) */}
          <div className="lg:col-span-5 glass-panel rounded-[30px] p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <FileText size={20} className="text-blue-400" />
                <span>ระบบยื่นคำร้อง (Petition / Appeal)</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                หากคุณต้องการขอเวลาฝึกซ้อมเพิ่มเติมนอกตาราง ยื่นอุทธรณ์ผล หรือขอสิทธิ์ภารกิจพิเศษ สามารถยื่นคำร้องต่อระบบได้ที่นี่
              </p>
            </div>

            <button
              id="open-appeal-modal-btn"
              onClick={() => {
                playChime("click");
                setIsAppealModalOpen(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-[22px] text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.02]"
            >
              <FileText size={18} />
              <span>📝 ยื่นคำร้องขอซ้อม / ยื่นอุทธรณ์</span>
            </button>

            {/* Submitted Appeals List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" />
                <span>คำร้องที่คุณเคยยื่นไว้ ({appealsList.length})</span>
              </h4>

              {appealsList.length === 0 ? (
                <div className="p-4 bg-white/2 border border-white/5 rounded-[20px] text-center text-xs text-gray-500">
                  ยังไม่มีคำร้องที่ยื่นในขณะนี้ คุณสามารถกดปุ่ม "ยื่นคำร้อง" ด้านบนเพื่อส่งคำร้องใหม่
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {appealsList.map((appeal) => (
                    <div
                      key={appeal.id}
                      className="p-3.5 bg-white/5 border border-white/10 rounded-[20px] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-300">
                          {appeal.category === "extra_practice" && "🕒 ขอเพิ่มเวลาฝึกซ้อมพิเศษ"}
                          {appeal.category === "bonus_mission" && "🎯 ขอทำภารกิจโบนัสพิเศษ"}
                          {appeal.category === "time_override" && "🛡️ ขอยื่นอุทธรณ์ผลการซ้อม"}
                          {appeal.category === "other" && "💬 คำร้องทั่วไป"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[10px] font-semibold flex items-center gap-1">
                          <Clock size={10} />
                          <span>อยู่ระหว่างการพิจารณา</span>
                        </span>
                      </div>
                      <p className="text-gray-300 text-[11px] line-clamp-2 leading-relaxed">"{appeal.reasonText}"</p>
                      <p className="text-[10px] text-gray-500 font-mono">ยื่นเมื่อ: {new Date(appeal.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                id="back-to-dashboard-btn"
                onClick={() => setActiveTab("dashboard")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-[20px] text-xs transition-all cursor-pointer"
              >
                กลับสู่หน้าหลัก Dashboard 🏠
              </button>
            </div>
          </div>

        </div>

        {/* Appeal Submission Modal */}
        {isAppealModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-panel border border-blue-500/30 bg-gray-900 rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsAppealModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  <FileText size={24} />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-white">ยื่นคำร้องขอฝึกซ้อมประจำวัน</h3>
                <p className="text-xs text-gray-400">
                  ส่งคำร้องเข้าสู่ระบบ หากคุณต้องการซ้อมเพิ่มเติมนอกตาราง หรือต้องการแจ้งเหตุผลพิเศษ
                </p>
              </div>

              {appealMessage && (
                <div className="p-3.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-[18px] text-center font-medium">
                  {appealMessage}
                </div>
              )}

              <form onSubmit={handleSendAppeal} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    หัวข้อ/ประเภทคำร้อง
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "extra_practice", label: "🕒 ขอเพิ่มเวลาซ้อมพิเศษ", desc: "ขอเปิดรอบซ้อมเพิ่มเติมนอกเหนือตาราง" },
                      { id: "bonus_mission", label: "🎯 ขอทำภารกิจโบนัส", desc: "ขอรับภารกิจความท้าทายสะสมแต้มเพิ่ม" },
                      { id: "time_override", label: "🛡️ ขอยื่นอุทธรณ์เวลา", desc: "แจ้งปรับปรุงเวลาจากการขัดข้องของเวลา" },
                      { id: "other", label: "💬 เรื่องอื่นๆ", desc: "คำร้องหรือข้อเสนอแนะทั่วไป" }
                    ].map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setAppealCategory(cat.id as any)}
                        className={`p-3 rounded-[18px] border transition-all cursor-pointer text-left ${
                          appealCategory === cat.id
                            ? "bg-blue-500/20 border-blue-400 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <p className="text-xs font-bold text-white">{cat.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    รายละเอียดเหตุผลคำร้อง
                  </label>
                  <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="พิมพ์รายละเอียดคำร้องของคุณ เช่น ต้องการซ้อมร้องเพลงเพิ่มเติม 30 นาที เพื่อเตรียมตัวสอบแข่งขัน..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-[20px] p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAppealModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-[20px] text-xs transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-gray-950 font-extrabold rounded-[20px] text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>ส่งคำร้องทันที</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // NORMAL TIMER VIEW (WHEN MISSIONS ARE STILL IN PROGRESS)
  // =========================================================================

  return (
    <div className={`space-y-8 animate-fade-in pb-12 ${isShaking ? "animate-shake" : ""}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Timer className="text-blue-400" size={26} />
            <span>จับเวลาฝึกฝนจริง (Timer Engine)</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            เปิดเสียง จับเวลา และทุ่มสมาธิให้กับการเต้น ร้องเพลง การแสดง หรือออกกำลังกายตรงหน้า
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Activity & Dynamic Island</span>
          </span>
          <span className={`px-4 py-1 text-xs font-semibold rounded-full border self-start sm:self-center ${DAILY_MODES_CONFIG[selectedModeToday].color}`}>
            โหมด: {DAILY_MODES_CONFIG[selectedModeToday].nameThai}
          </span>
        </div>
      </div>

      {/* Timer Category Presets Selector */}
      <div className="glass-panel rounded-[24px] p-3 sm:p-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
          <span>ประเภทการซ้อม (Live Activity Mode)</span>
          <span className="text-blue-400 font-mono text-[10px]">เลือกโหมดการจับเวลาที่ต้องการ</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(Object.keys(timerTypeConfigs) as TimerPresetType[]).map((key) => {
            const conf = timerTypeConfigs[key];
            const isSelected = selectedTimerType === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedTimerType(key);
                  setTimerPresetDuration(conf.defaultMins);
                  playChime("click");
                }}
                className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? conf.color + " shadow-lg"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{conf.icon}</span>
                  <span className="text-[10px] font-mono text-gray-400">{conf.defaultMins}m</span>
                </div>
                <span className="text-xs font-bold text-white mt-2 truncate">{conf.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-panel rounded-[24px]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Clock size={16} className="text-amber-400" />
          <span>กำหนดระยะเวลาซ้อม:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "30 นาที", mins: 30 },
            { label: "1 ชั่วโมง", mins: 60 },
            { label: "1.5 ชั่วโมง", mins: 90 },
            { label: "2 ชั่วโมง", mins: 120 }
          ].map((preset) => {
            const isCurrent = Math.floor(timeLeft / 60) === preset.mins || Math.floor(originalDuration / 60) === preset.mins;
            return (
              <button
                key={preset.mins}
                onClick={() => {
                  setTimerPresetDuration(preset.mins);
                  playChime("click");
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isCurrent
                    ? "bg-amber-500 text-gray-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-blue-300 hover:bg-blue-500/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <Sliders size={12} />
            <span>กำหนดเอง</span>
          </button>
        </div>
      </div>

      {/* Main Grid Timer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Circular Timer Panel (Span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-[30px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Confetti particles mock when completed */}
          {isCelebrated && (
            <div className="absolute inset-0 bg-yellow-400/5 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10">
              <div className="text-center animate-bounce">
                <span className="text-5xl">🏆</span>
                <h4 className="text-yellow-400 font-display font-black text-xl mt-2 tracking-wide text-glow-gold">MISSION COMPLETE!</h4>
                <p className="text-xs text-white">เก่งมาก! ศิลปินที่ดีสร้างได้จากวินัยในทุกๆ วินาที</p>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Active Mission</p>
            <h3 className="font-display font-extrabold text-xl text-white mt-1.5 min-h-[1.75rem]">
              {activeMissionObj ? activeMissionObj.name : "กรุณาเลือกภารกิจด้านขวา"}
            </h3>
            <span className="text-[10px] text-blue-400 font-mono mt-1 block">
              สถานะ: {activeMissionObj?.completed ? "✓ สำเร็จแล้ว" : isRunning ? "🔥 กำลังซ้อม..." : "💤 สแตนด์บาย"}
            </span>
          </div>

          {/* SVG Circular Countdown */}
          <div className="relative w-64 h-64 my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer Track */}
              <circle
                className="text-white/5"
                strokeWidth="6"
                stroke="currentColor"
                fill="none"
                r="44"
                cx="50"
                cy="50"
              />
              {/* Active Progress */}
              <circle
                className="text-blue-500 transition-all duration-300"
                strokeWidth="6"
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * progressPercent) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                r="44"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold text-white tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mt-2">
                เหลือเวลานี้
              </span>
            </div>
          </div>

          {/* Control Buttons Panel */}
          <div className="flex items-center gap-4 mt-8 w-full max-w-sm">
            <button
              id="timer-reset-btn"
              onClick={handleReset}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-[20px] hover:text-white hover:bg-white/10 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
              <span>เริ่มใหม่</span>
            </button>

            <button
              id="timer-play-pause-btn"
              onClick={handleTogglePlay}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-gray-950 transition-all transform hover:scale-105 cursor-pointer shadow-lg shadow-white/5 ${
                isRunning ? "bg-orange-400" : "bg-white"
              }`}
            >
              {isRunning ? <Pause size={24} className="fill-gray-950 text-gray-950" /> : <Play size={24} className="fill-gray-950 text-gray-950 ml-1" />}
            </button>

            <button
              id="timer-skip-btn"
              onClick={handleSkip}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-[20px] hover:text-white hover:bg-white/10 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              title="Skip Mission"
            >
              <FastForward size={14} />
              <span>ถัดไป</span>
            </button>
          </div>

          {/* Quick Complete Buttons */}
          <div className="mt-6 flex gap-3 w-full max-w-sm">
            <button
              id="timer-complete-task-btn"
              onClick={handleCompleteActiveInstant}
              disabled={!activeMissionId || activeMissionObj?.completed}
              className={`w-full py-3 rounded-[20px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeMissionObj?.completed
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                  : "bg-emerald-500 text-gray-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10"
              }`}
            >
              <CheckCircle size={14} />
              <span>{activeMissionObj?.completed ? "ทำสำเร็จแล้ว" : "เสร็จสิ้นภารกิจนี้เลย (Complete)"}</span>
            </button>
          </div>

          <div className="mt-5 text-[11px] text-gray-500 flex items-center gap-1">
            <Volume2 size={12} className="text-gray-400" />
            <span>เมื่อฝึกครบเวลา ระบบจะเล่นเสียงแจ้งเตือน chimes และจำลองสั่นแจ้งเตือน</span>
          </div>

        </div>

        {/* Right Missions List Panel (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ListTodo size={16} className="text-blue-400" />
                <span>ภารกิจซ้อมประจำวันนี้</span>
              </h4>
              <span className="text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                {completedMissions} / {totalMissions} เสร็จ
              </span>
            </div>

            {/* Missions List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activeMissions.map((mission, idx) => {
                const isActive = activeMissionId === mission.id;
                return (
                  <div
                    key={mission.id}
                    id={`mission-item-${mission.id}`}
                    onClick={() => selectMission(mission.id, mission.durationMinutes)}
                    className={`p-3.5 rounded-[22px] border transition-all cursor-pointer flex items-center justify-between ${
                      isActive 
                        ? "border-blue-400 bg-blue-500/10" 
                        : mission.completed
                        ? "border-emerald-500/20 bg-emerald-950/10 opacity-75"
                        : "border-white/5 bg-white/2 applied-glass-card hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] font-bold ${
                        mission.completed
                          ? "bg-emerald-500 text-gray-950 border-emerald-500"
                          : isActive
                          ? "bg-blue-400 text-white border-blue-400"
                          : "border-gray-600 text-gray-400"
                      }`}>
                        {mission.completed ? "✓" : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${mission.completed ? "line-through text-gray-500" : "text-white"}`}>
                          {mission.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{mission.durationMinutes} นาที</p>
                      </div>
                    </div>

                    <button
                      id={`toggle-mission-${mission.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttemptToggleMission(mission.id, mission.completed);
                      }}
                      className={`p-1.5 rounded-full transition-all ${
                        mission.completed 
                          ? "text-emerald-400 opacity-90 cursor-not-allowed" 
                          : "text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer"
                      }`}
                      title={mission.completed ? "สำเร็จแล้ว (ล็อคการบันทึก)" : "Mark Complete"}
                    >
                      <CheckCircle size={16} className={mission.completed ? "fill-emerald-500/10" : ""} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mass Complete Button */}
            {!allCompleted && (
              <button
                id="timer-complete-all-btn"
                onClick={completeAllMissionsToday}
                className="w-full mt-5 py-3 border border-dashed border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white hover:bg-blue-500/5 transition-all rounded-[20px] text-xs font-bold cursor-pointer"
              >
                ✓ พิชิตภารกิจทุกข้อวันนี้ทันที (XP คอนเฟิร์ม)
              </button>
            )}

            {/* Proportional XP Info */}
            <div className="mt-4 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-[20px] text-left">
              <p className="text-[11px] text-blue-300 font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                <span>ระบบคำนวณ XP เฉพาะที่ทำสำเร็จ</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                หากการซ้อมวันนี้ไม่สำเร็จครบทุกข้อ คุณจะยังได้รับ XP สะสมตามสัดส่วนภารกิจที่ทำเสร็จจริงโดยอัตโนมัติ ไม่ต้องกังวลว่าจะเสียแต้มเปล่า!
              </p>
            </div>
          </div>

          {/* Tips Panel */}
          <div className="glass-panel rounded-[24px] p-5">
            <h5 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
              <Award size={13} />
              <span>Artist Insight Tips</span>
            </h5>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              การร้องเพลงที่ดีต้องวอร์มสายเสียงอย่างถูกวิธีก่อน 10 นาที เต้นให้จัดวางระนาบไหล่และสะโพกให้ขนานกัน และสำหรับการแสดงควรซ้อมสื่อสารทางสายตากับกล้องหรือกระจกเพื่อเพิ่มสมาธิและความมั่นใจ!
            </p>
          </div>

        </div>

      </div>

      {/* Custom Duration Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel border border-amber-500/30 bg-gray-900 rounded-[28px] max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <Sliders size={20} />
              </div>
              <h3 className="font-display font-extrabold text-lg text-white">กำหนดเวลาซ้อมแบบ Custom</h3>
              <p className="text-xs text-gray-400">ระบุจำนวนเวลาการซ้อม (นาที) ที่คุณต้องการจับเวลา</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={customInputMins}
                  onChange={(e) => setCustomInputMins(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-center text-2xl font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <span className="text-sm font-bold text-gray-300 shrink-0">นาที</span>
              </div>

              {/* Quick Minutes Selector */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[15, 25, 45, 90].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCustomInputMins(m)}
                    className="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-semibold cursor-pointer"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-2xl text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setTimerPresetDuration(customInputMins);
                  setIsCustomModalOpen(false);
                  playChime("click");
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold rounded-2xl text-xs cursor-pointer shadow-lg shadow-amber-500/20"
              >
                ตกลงเริ่มจับเวลา
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
