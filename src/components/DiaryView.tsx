import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Smile, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  Compass,
  Lock,
  Plus
} from "lucide-react";
import { DiaryEntry } from "../types";
import { getTodayDateString } from "../hooks/useAppState";
import { playChime } from "../utils/audio";

interface DiaryViewProps {
  diaryEntries: DiaryEntry[];
  logDiary: (entry: Omit<DiaryEntry, "id" | "date" | "createdAt">) => void;
}

export default function DiaryView({ diaryEntries, logDiary }: DiaryViewProps) {
  const todayStr = getTodayDateString();
  const [mood, setMood] = useState<string>("🤩 มีพลังงาน & แรงบันดาลใจ");
  const [pride, setPride] = useState<string>("");
  const [progress, setProgress] = useState<number>(85);
  const [tomorrow, setTomorrow] = useState<string>("");

  const moodOptions = [
    { label: "🤩 มีแรงบันดาลใจ", val: "🤩 มีพลังงาน & แรงบันดาลใจ" },
    { label: "😊 มีความสุข", val: "😊 มีความสุข & สนุกซ้อม" },
    { label: "😴 เหนื่อยล้า", val: "😴 เหนื่อยล้า & อ่อนแรง" },
    { label: "😰 ตื่นเต้นกังวล", val: "😰 ตื่นเต้น & วิตกกังวล" },
    { label: "😭 ท้อแท้", val: "😭 ท้อแท้ & เครียดสตรีม" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pride.trim() || !tomorrow.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนในช่องความภูมิใจและแผนงานวันพรุ่งนี้");
      return;
    }

    logDiary({
      mood,
      prideText: pride,
      progressPercent: progress,
      tomorrowPlan: tomorrow
    });

    setPride("");
    setTomorrow("");
    alert("บันทึกหน้าไดอารี่ลับความรู้สึกศิลปินเรียบร้อยแล้ว!");
  };

  const todayHasDiary = diaryEntries.some(e => e.date === todayStr);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="text-cyan-400" size={26} />
          <span>บันทึกความรู้สึกศิลปิน (Secret Diary)</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          ไดอารี่ส่วนตัวเพื่อทบทวนทักษะ ความรู้สึก และสิ่งที่คุณภาคภูมิใจในแต่ละวัน เพื่อเสริมสร้างวุฒิภาวะและความมั่นคงทางจิตใจ
        </p>
      </div>

      {/* Main Grid: Left Write Form, Right Logs History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Write Diary (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="glass-panel rounded-[30px] p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Lock size={16} className="text-cyan-400" />
                <span>เขียนไดอารี่ลับศิลปินวันนี้</span>
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">เข้ารหัสข้อมูล 100%</span>
            </div>

            {todayHasDiary && (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[20px] p-3.5 text-xs text-cyan-300 mb-5 leading-normal">
                ✓ วันนี้คุณเขียนไดอารี่เรียบร้อยแล้ว การบันทึกอีกรอบจะอัปเดตทับไฟล์วันนี้
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">วันนี้คุณรู้สึกอย่างไร? (Mood Today)</label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((opt) => {
                    const isSelected = mood === opt.val;
                    return (
                      <button
                        key={opt.val}
                        id={`mood-opt-${opt.label}`}
                        type="button"
                        onClick={() => {
                          setMood(opt.val);
                          playChime("click");
                        }}
                        className={`px-3 py-2 text-xs font-semibold rounded-[16px] border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-400 text-gray-950 border-cyan-300 font-bold scale-105 shadow-md shadow-cyan-400/10"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-gray-400">วันนี้ประเมินผลงานตัวเองกี่ % ?</label>
                  <span className="font-mono font-bold text-cyan-400">{progress}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-600 font-bold">10%</span>
                  <input
                    id="diary-progress-slider"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-400 border border-white/5"
                  />
                  <span className="text-[10px] text-gray-600 font-bold">100%</span>
                </div>
              </div>

              {/* Pride statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">วันนี้ภูมิใจอะไรที่สุด? (Pride of Today)</label>
                <textarea
                  id="diary-pride-text"
                  rows={3}
                  value={pride}
                  onChange={(e) => setPride(e.target.value)}
                  placeholder="เช่น ซ้อมร้องท่อนแอดลิบของศิลปินโปรดได้สำเร็จตามจังหวะ หรือรักษาวินัยคอไม่แห้ง..."
                  className="w-full p-3.5 bg-white/5 border border-white/10 rounded-[18px] text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 leading-normal"
                  required
                />
              </div>

              {/* Tomorrow's Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">พรุ่งนี้อยากทำอะไรต่อไป? (Plan for Tomorrow)</label>
                <textarea
                  id="diary-tomorrow-text"
                  rows={2}
                  value={tomorrow}
                  onChange={(e) => setTomorrow(e.target.value)}
                  placeholder="เช่น ออกกำลังกายสลายหน้าท้อง และวอร์มเสียงเช้าเย็น..."
                  className="w-full p-3.5 bg-white/5 border border-white/10 rounded-[18px] text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 leading-normal"
                  required
                />
              </div>

              <button
                id="save-diary-btn"
                type="submit"
                className="w-full py-3 bg-cyan-400 text-gray-950 hover:bg-cyan-300 rounded-[16px] text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-400/10 flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                <span>เข้ารหัสและบันทึกหน้าไดอารี่ลับ</span>
              </button>

            </form>
          </div>

        </div>

        {/* Right Logs: Scrolling History logs (Span 6) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" />
            <span>ความทรงจำและประวัติจดบันทึก ({diaryEntries.length})</span>
          </h3>

          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {diaryEntries.map((entry) => (
              <div 
                key={entry.id} 
                id={`diary-entry-card-${entry.id}`}
                className="glass-panel rounded-[26px] p-5 border border-white/5 relative overflow-hidden"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Calendar size={12} className="text-cyan-400" />
                    <span>{new Date(entry.date).toLocaleDateString("th-TH", { dateStyle: "long" })}</span>
                  </span>
                  <span className="text-xs font-bold text-cyan-300">{entry.mood.split(" ")[0]}</span>
                </div>

                {/* Entry Content */}
                <div className="my-4 space-y-3.5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">🌟 สิ่งที่ภูมิใจในวันนี้:</p>
                    <p className="text-xs text-white mt-1 leading-relaxed bg-black/15 p-3 rounded-[16px]">
                      {entry.prideText}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">📅 แผนงานสำหรับวันพรุ่งนี้:</p>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed bg-black/15 p-3 rounded-[16px]">
                      {entry.tomorrowPlan}
                    </p>
                  </div>
                </div>

                {/* Entry Footer */}
                <div className="pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono">ประเมินผลตัวเองวันนี้: <strong className="text-yellow-400 font-bold">{entry.progressPercent}%</strong></span>
                  <span className="font-mono text-[9px] uppercase">Encrypted Local storage</span>
                </div>
              </div>
            ))}

            {diaryEntries.length === 0 && (
              <div className="glass-panel rounded-[24px] p-8 text-center text-gray-500">
                ยังไม่มีการบันทึกหน้าไดอารี่ลับของคุณ เริ่มต้นบันทึกความทรงจำของความตั้งใจวันนี้เลย!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Guide widget */}
      <div className="glass-panel rounded-[30px] p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-[20px] bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
          <BookOpen size={26} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Compass size={14} className="text-cyan-400" />
            <span>คำแนะนำการจดบันทึกสไตล์ไอดอล</span>
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            ศิลปินหลายคนที่ประสบความสำเร็จ เช่น นักแสดงและศิลปินระดับโลก แนะนำให้จดบันทึก <strong>ความรู้สึกประจำวัน (Self-Reflection)</strong> เสมอ เพื่อช่วยลดความตึงเครียดของระบบประสาท และเป็นคลังเก็บแรงบันดาลใจขณะคิดท่าเต้นหรือแต่งเนื้อเพลงใหม่ๆ ในอนาคต!
          </p>
        </div>
      </div>

    </div>
  );
}
