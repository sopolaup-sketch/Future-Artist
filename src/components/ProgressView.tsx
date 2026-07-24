import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Mic, 
  Drama, 
  Languages, 
  Dumbbell, 
  Heart, 
  Sparkles, 
  Clock,
  ThumbsUp,
  Award
} from "lucide-react";
import { DayProgress, Goal, Achievement, HealthLog, DiaryEntry, UserProfile, DAILY_MODES_CONFIG } from "../types";

interface ProgressViewProps {
  history: DayProgress[];
  goals: Goal[];
  achievements: Achievement[];
  healthLogs: HealthLog[];
  diaryEntries: DiaryEntry[];
  profile: UserProfile;
}

export default function ProgressView({ 
  history, 
  goals, 
  achievements, 
  healthLogs, 
  diaryEntries,
  profile 
}: ProgressViewProps) {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly");
  
  // Interactive Self-Assessment Skill Scores
  // Load or set default self-assessed talent metrics from local storage to make it fully real and persistent!
  const [skillScores, setSkillScores] = useState<{
    dance: number;
    singing: number;
    acting: number;
    english: number;
    exercise: number;
    health: number;
    confidence: number;
  }>(() => {
    const saved = localStorage.getItem("future_artist_skill_scores");
    if (saved) return JSON.parse(saved);
    return {
      dance: 72,
      singing: 65,
      acting: 58,
      english: 68,
      exercise: 80,
      health: 75,
      confidence: 60
    };
  });

  const handleScoreChange = (skill: keyof typeof skillScores, val: number) => {
    setSkillScores(prev => {
      const next = { ...prev, [skill]: val };
      localStorage.setItem("future_artist_skill_scores", JSON.stringify(next));
      return next;
    });
  };

  // Calculations based on history
  const getWeeklyStats = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const mins = [0, 0, 0, 0, 0, 0, 0];
    
    const today = new Date();
    // Get Monday of current week
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const match = history.find(h => h.date === dateStr);
      if (match) {
        // Sum the duration of completed missions for that day
        const completedMins = match.missions
          .filter(m => m.completed)
          .reduce((sum, m) => sum + m.durationMinutes, 0);
        mins[i] = completedMins;
      }
    }
    return { labels: days, data: mins, color: "#60a5fa" };
  };

  const getMonthlyStats = () => {
    const weeks = ["สัปดาห์ที่ 1", "สัปดาห์ที่ 2", "สัปดาห์ที่ 3", "สัปดาห์ที่ 4"];
    const hours = [0, 0, 0, 0];
    
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const match = history.find(h => h.date === dateStr);
      if (match) {
        const completedMins = match.missions
          .filter(m => m.completed)
          .reduce((sum, m) => sum + m.durationMinutes, 0);
        const weekIdx = Math.floor(i / 7);
        if (weekIdx >= 0 && weekIdx < 4) {
          hours[3 - weekIdx] += completedMins / 60; // Group in weekly chunks (W4 is newest, W1 is oldest)
        }
      }
    }
    const roundedHours = hours.map(h => Math.round(h * 10) / 10);
    return { labels: weeks, data: roundedHours, color: "#34d399" };
  };

  const getYearlyStats = () => {
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const hours = Array(12).fill(0);
    
    history.forEach(h => {
      const parts = h.date.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const monthIdx = parseInt(parts[1]) - 1; // 0-11
        const currentYear = new Date().getFullYear();
        if (year === currentYear && monthIdx >= 0 && monthIdx < 12) {
          const completedMins = h.missions
            .filter(m => m.completed)
            .reduce((sum, m) => sum + m.durationMinutes, 0);
          hours[monthIdx] += completedMins / 60;
        }
      }
    });
    const roundedHours = hours.map(h => Math.round(h * 10) / 10);
    return { labels: months, data: roundedHours, color: "#facc15" };
  };

  const activeChart = timeframe === "weekly" 
    ? getWeeklyStats() 
    : timeframe === "monthly" 
    ? getMonthlyStats() 
    : getYearlyStats();

  const maxVal = Math.max(...activeChart.data, 10);

  // Real-time metrics
  const weeklyChartData = getWeeklyStats().data;
  const maxMinsThisWeek = Math.max(...weeklyChartData);
  const maxMinsText = maxMinsThisWeek > 0 ? `${maxMinsThisWeek} นาที / วัน` : "0 นาที / วัน";

  const totalGoals = goals.length;
  const completedGoalsCount = goals.filter(g => g.completed).length;
  const goalCompletionPercent = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;

  const totalMinsTrained = history.reduce((sum, h) => {
    return sum + h.missions.filter(m => m.completed).reduce((s, m) => s + m.durationMinutes, 0);
  }, 0);
  const totalHoursTrained = Math.round((totalMinsTrained / 60) * 10) / 10;

  const skillsList = [
    { key: "dance", label: "ทักษะการเต้น (Dance Mastery)", icon: Activity, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
    { key: "singing", label: "การใช้เสียงและร้องเพลง (Vocal Range)", icon: Mic, color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
    { key: "acting", label: "อารมณ์และการแสดง (Acting Skill)", icon: Drama, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    { key: "english", label: "ทักษะภาษาอังกฤษ (English Interview)", icon: Languages, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
    { key: "exercise", label: "ความฟิตและความทนทาน (Core Body)", icon: Dumbbell, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    { key: "health", label: "โภชนาการและการรักษารูปร่าง (BMI & Health)", icon: Heart, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
    { key: "confidence", label: "ความมั่นใจและเสน่ห์เวที (Stage Presence)", icon: Sparkles, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" }
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-emerald-400" size={26} />
            <span>ประเมินความคืบหน้า (Progress System)</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            วิเคราะห์ชั่วโมงบินและพัฒนาการรอบด้าน เพื่อผลักดันศักยภาพตนเองเข้าสู่มาตรฐานการเป็นศิลปินระดับสากล
          </p>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-full self-start sm:self-center">
          {(["weekly", "monthly", "yearly"] as const).map((t) => (
            <button
              key={t}
              id={`toggle-time-${t}`}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeframe === t
                  ? "bg-white text-gray-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "weekly" ? "รายสัปดาห์" : t === "monthly" ? "รายเดือน" : "รายปี"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout: Left Charts, Right Skill Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns (Span 7): Interactive Progress Charts */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <span>ชั่วโมงฝึกซ้อมสะสม ({timeframe === "weekly" ? "นาทีรวมรายวัน" : "ชั่วโมงรวมรายเดือน"})</span>
              </h3>
              <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Clock size={11} />
                <span>Real-Time Tracker</span>
              </span>
            </div>

            {/* Render Custom Glassmorphic SVG Bar Chart */}
            <div className="relative h-64 flex items-end justify-between pt-8 px-4 border-b border-white/5">
              {activeChart.labels.map((label, idx) => {
                const val = activeChart.data[idx];
                const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                
                return (
                  <div key={label} className="flex flex-col items-center flex-1 group">
                    {/* Tooltip on hover */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-all bottom-[75%] bg-gray-900 border border-white/15 px-2.5 py-1 rounded-[10px] text-[10px] text-white font-mono z-10 shadow-xl pointer-events-none mb-1">
                      {val} {timeframe === "weekly" ? "นาที" : "ชม."}
                    </div>

                    {/* Column Bar with beautiful color coding */}
                    <div className="w-6 sm:w-10 bg-white/5 rounded-t-[10px] h-48 flex items-end overflow-hidden border border-white/5">
                      <div 
                        className="w-full rounded-t-[8px] transition-all duration-700 ease-out"
                        style={{ 
                          height: `${heightPercent}%`,
                          backgroundColor: activeChart.color,
                          boxShadow: `0 0 16px ${activeChart.color}44`
                        }}
                      />
                    </div>

                    {/* Column Label */}
                    <span className="text-[10px] text-gray-400 mt-2.5 text-center truncate w-full font-medium">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-between items-center text-xs text-gray-500 font-mono">
              <span>ช่วงเวลาวิเคราะห์ล่าสุด</span>
              <span>สูงสุด: {maxVal} {timeframe === "weekly" ? "นาที" : "ชั่วโมง"}</span>
            </div>
          </div>

          {/* Quick insights stats widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel rounded-[24px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">สถิติสูงสุดสัปดาห์นี้</p>
                <p className="text-lg font-display font-extrabold text-white mt-1">{maxMinsText}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span>{maxMinsThisWeek > 0 ? "✓ รักษาสมรรถภาพสม่ำเสมอ" : "⚡ เริ่มต้นซ้อมวันนี้เพื่อเริ่มบันทึกสถิติ!"}</span>
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-[24px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ThumbsUp size={22} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">เวลาฝึกสะสม & เป้าหมาย</p>
                <p className="text-lg font-display font-extrabold text-white mt-1">
                  {totalHoursTrained} ชม. / {goalCompletionPercent}% สำเร็จ
                </p>
                <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
                  <span>🚀 ระดับผู้ใช้ปัจจุบัน: Lv. {profile.level}</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns (Span 5): Skills Assessment & Mastery Progress Rings */}
        <div className="lg:col-span-5 glass-panel rounded-[30px] p-6 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              <span>ดัชนีคะแนนประเมินตนเอง (Talent Matrix)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              สไลด์แถบคะแนนเพื่อประเมินประเด็นความสามารถของตนเองวันนี้ (เต็ม 100) ทุกค่าจะอัปเดตเป้าหมายหลัก
            </p>
          </div>

          <div className="space-y-4.5">
            {skillsList.map((skill) => {
              const SkillIcon = skill.icon;
              const currentScore = skillScores[skill.key];
              
              return (
                <div key={skill.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-300 font-medium">
                      <div className={`p-1 rounded-md border ${skill.color}`}>
                        <SkillIcon size={12} />
                      </div>
                      <span>{skill.label}</span>
                    </span>
                    <span className="font-bold text-white font-mono">{currentScore} <span className="text-[9px] text-gray-500 font-normal">/100</span></span>
                  </div>

                  {/* Range Slider for custom self rating */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentScore}
                      onChange={(e) => handleScoreChange(skill.key, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 border border-white/5"
                    />
                    <span className="text-[10px] font-bold text-gray-500 font-mono w-5">
                      {currentScore >= 85 ? "LV3" : currentScore >= 60 ? "LV2" : "LV1"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex items-start gap-3">
            <div className="text-yellow-400 font-bold shrink-0 text-lg">💡</div>
            <p className="text-[11px] text-gray-400 leading-normal">
              <strong>เกณฑ์ระดับทักษะ:</strong> ต่ำกว่า 60: <strong>LV1 Beginner</strong> | 60-85: <strong>LV2 Semi-Pro</strong> | 85 ขึ้นไป: <strong>LV3 Stage-Ready</strong> (พร้อมเดบิวต์คัดเลือกตัว!)
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
