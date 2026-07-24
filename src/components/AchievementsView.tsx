import { 
  Award, 
  Flame, 
  Activity, 
  Mic, 
  Sparkles, 
  Star, 
  Crown, 
  Footprints, 
  Zap,
  Lock,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  PlusCircle,
  Sparkle,
  Minus
} from "lucide-react";
import { useState } from "react";
import React from "react";
import { Achievement } from "../types";
import { playChime } from "../utils/audio";

interface AchievementsViewProps {
  achievements: Achievement[];
  addAchievement?: (ach: Omit<Achievement, "id" | "unlocked" | "progressCurrent">) => void;
  deleteAchievement?: (id: string) => void;
  updateAchievementProgress?: (id: string, progress: number) => void;
}

export default function AchievementsView({ 
  achievements,
  addAchievement,
  deleteAchievement,
  updateAchievementProgress
}: AchievementsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Award");
  const [targetVal, setTargetVal] = useState("5");
  const [reqType, setReqType] = useState<"streak" | "hours" | "level" | "no_lazy" | "first_step" | "custom">("custom");

  const getAchievementIcon = (iconName: string, isUnlocked: boolean) => {
    const size = 26;
    const colorClass = isUnlocked ? "text-yellow-400" : "text-gray-500";
    
    switch (iconName) {
      case "Footprints": return <Footprints size={size} className={colorClass} />;
      case "Flame": return <Flame size={size} className={colorClass} />;
      case "Award": return <Award size={size} className={colorClass} />;
      case "Zap": return <Zap size={size} className={colorClass} />;
      case "Activity": return <Activity size={size} className={colorClass} />;
      case "Mic": return <Mic size={size} className={colorClass} />;
      case "Sparkles": return <Sparkles size={size} className={colorClass} />;
      case "Star": return <Star size={size} className={colorClass} />;
      case "Crown": return <Crown size={size} className={colorClass} />;
      default: return <Award size={size} className={colorClass} />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("กรุณากรอกชื่อและคำอธิบายความสำเร็จ");
      return;
    }

    const val = parseInt(targetVal) || 1;
    if (addAchievement) {
      addAchievement({
        title: title.trim(),
        description: description.trim(),
        icon,
        requirementType: reqType,
        requirementValue: val,
        progressTarget: val
      });
      setTitle("");
      setDescription("");
      setIcon("Award");
      setTargetVal("5");
      setReqType("custom");
      setShowAddForm(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Award className="text-yellow-400 fill-yellow-400/10" size={26} />
            <span>หอแห่งเกียรติยศ (Artist Achievement System)</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            ปลดล็อกเหรียญตราเกียรติยศตามความก้าวหน้าและการรักษาระเบียบวินัย ค้นพบและสร้างเหรียญรางวัลของคุณเอง!
          </p>
        </div>
        {addAchievement && (
          <button
            id="toggle-add-ach-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              playChime("click");
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-full text-xs shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 animate-fade-in"
          >
            {showAddForm ? <X size={14} /> : <PlusCircle size={14} />}
            <span>{showAddForm ? "ปิดฟอร์ม" : "สร้างความสำเร็จใหม่"}</span>
          </button>
        )}
      </div>

      {/* Add Achievement Form */}
      {showAddForm && (
        <form 
          id="add-ach-form"
          onSubmit={handleSubmit} 
          className="glass-panel p-6 rounded-[28px] border border-blue-500/20 bg-blue-500/5 space-y-4 animate-slide-in"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Sparkle size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-white">ระบุรายละเอียดความสำเร็จที่ต้องการท้าทาย</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">ชื่อความสำเร็จ *</label>
              <input
                id="ach-title-input"
                type="text"
                required
                placeholder="เช่น SUPER VOCALIST, จิบน้ำครบวัน"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">รายละเอียดเงื่อนไข *</label>
              <input
                id="ach-desc-input"
                type="text"
                required
                placeholder="เช่น ฝึกร้องเพลงสะสมครบ 200 ชั่วโมง, จิบน้ำครบ 2,000 มล."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">ไอคอนตราประดับ</label>
              <select
                id="ach-icon-select"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 [&>option]:bg-zinc-900"
              >
                <option value="Award">🏆 Award (ถ้วยรางวัล)</option>
                <option value="Crown">👑 Crown (มงกุฎศิลปิน)</option>
                <option value="Sparkles">✨ Sparkles (ประกายดวงดาว)</option>
                <option value="Mic">🎤 Mic (ไมโครโฟนทองคำ)</option>
                <option value="Flame">🔥 Flame (ความกระตือรือร้น)</option>
                <option value="Star">⭐ Star (ดาราดาวรุ่ง)</option>
                <option value="Zap">⚡ Zap (พลังงานตื่นตัว)</option>
                <option value="Activity">🏃 Activity (การเคลื่อนไหว)</option>
                <option value="Footprints">👣 Footprints (รอยเท้าก้าวเดิน)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">จำนวนเป้าหมาย</label>
                <input
                  id="ach-target-val-input"
                  type="number"
                  min="1"
                  required
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">ระบบตรวจสอบ</label>
                <select
                  id="ach-type-select"
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 [&>option]:bg-zinc-900"
                >
                  <option value="custom">👤 อัปเดตด้วยตนเอง (Manual)</option>
                  <option value="streak">🔥 อิงตาม streak ซ้อมติดต่อกัน</option>
                  <option value="hours">⏰ อิงตามเวลาซ้อมสะสม</option>
                  <option value="level">⭐ อิงตามเลเวลของคุณ</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="submit-new-ach-btn"
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              บันทึกสำเร็จ
            </button>
          </div>
        </form>
      )}

      {/* Summary Score Card */}
      <div className="bg-gradient-to-tr from-amber-600/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-[30px] p-6 flex flex-col sm:flex-row justify-between items-center gap-5 relative overflow-hidden">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="font-display font-black text-xl text-yellow-400 text-glow-gold flex items-center justify-center sm:justify-start gap-1.5">
            <Crown size={18} />
            <span>ความสำเร็จปลดล็อกแล้ว ({unlockedCount} / {achievements.length})</span>
          </h3>
          <p className="text-xs text-gray-300 max-w-md">
            เหรียญเกียรติยศศิลปินจะช่วยเสริมสร้างแฟ้มประวัติ (Profile) และความมั่นใจในการพัฒนาวินัยตนเองสู่การเป็นซูเปอร์สตาร์
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-3.5 rounded-[22px] min-w-[12rem] justify-center shadow-inner">
          <div className="text-center">
            <span className="text-3xl font-display font-black text-yellow-400 font-mono text-glow-gold">{unlockedCount}</span>
            <span className="text-xs text-gray-400 block mt-0.5">เหรียญตราทั้งหมด</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="text-3xl font-display font-black text-blue-400 font-mono">
              {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
            </span>
            <span className="text-xs text-gray-400 block mt-0.5">อัตราความคืบหน้า</span>
          </div>
        </div>

        {/* Decorative ambient background glow */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked;
          const ratio = ach.progressTarget > 0 ? ach.progressCurrent / ach.progressTarget : 0;
          const percent = Math.min(100, Math.round(ratio * 100));
          const isCustom = ach.id.startsWith("ach-");

          return (
            <div 
              key={ach.id} 
              id={`ach-card-${ach.id}`}
              className={`glass-panel rounded-[26px] p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
                isUnlocked 
                  ? "border-yellow-400/30 bg-gradient-to-tr from-yellow-500/5 to-transparent shadow-lg shadow-yellow-500/5 animate-scale-up" 
                  : "border-white/5 opacity-90 hover:border-white/10"
              }`}
            >
              <div>
                {/* Unlock status & Actions container */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {isCustom && deleteAchievement && (
                    <button
                      id={`delete-ach-btn-${ach.id}`}
                      onClick={() => {
                        if (confirm(`คุณต้องการลบรางวัลความสำเร็จ "${ach.title}" หรือไม่?`)) {
                          deleteAchievement(ach.id);
                          playChime("warning");
                        }
                      }}
                      className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                      title="ลบรางวัล"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 bg-yellow-400/15 text-yellow-300 text-[9px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border border-yellow-400/25 shrink-0">
                      <CheckCircle2 size={10} />
                      <span>UNLOCKED</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-gray-900 text-gray-500 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-full border border-white/5 shrink-0">
                      <Lock size={9} />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>

                {/* Achievement Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-[20px] border flex items-center justify-center shrink-0 shadow-lg ${
                    isUnlocked
                      ? "bg-yellow-400/15 border-yellow-400/40 shadow-yellow-500/10 text-glow-gold"
                      : "bg-white/5 border-white/10 shadow-black/20"
                  }`}>
                    {getAchievementIcon(ach.icon, isUnlocked)}
                  </div>

                  <div className="pr-20">
                    <h4 className={`font-display font-black text-sm tracking-tight ${isUnlocked ? "text-yellow-400 text-glow-gold" : "text-gray-200"}`}>
                      {ach.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-normal">
                      {ach.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress display */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-500 flex items-center gap-1">
                    <span>ความก้าวหน้า:</span>
                    {ach.requirementType === "custom" && (
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full font-sans">แมนนวล</span>
                    )}
                  </span>
                  <span className={`font-bold ${isUnlocked ? "text-yellow-400" : "text-gray-300"}`}>
                    {ach.progressCurrent} / {ach.progressTarget} {
                      ach.requirementType === "hours" ? "นาที" : 
                      ach.requirementType === "level" ? "เลเวล" : 
                      ach.requirementType === "streak" ? "วัน" : "ครั้ง"
                    }
                  </span>
                </div>

                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? "bg-yellow-400" : "bg-blue-400"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Progress Custom adjust buttons */}
                {updateAchievementProgress && (ach.requirementType === "custom" || isCustom) && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-500">ปรับแก้ความคืบหน้า:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`dec-progress-${ach.id}`}
                        disabled={ach.progressCurrent <= 0}
                        onClick={() => {
                          updateAchievementProgress(ach.id, ach.progressCurrent - 1);
                          playChime("click");
                        }}
                        className="p-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-all disabled:opacity-30 cursor-pointer active:scale-95"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        id={`inc-progress-${ach.id}`}
                        disabled={isUnlocked}
                        onClick={() => {
                          updateAchievementProgress(ach.id, ach.progressCurrent + 1);
                          playChime("click");
                        }}
                        className="p-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-all disabled:opacity-30 cursor-pointer active:scale-95"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                )}
                
                {isUnlocked && ach.unlockedAt && (
                  <p className="text-[10px] text-gray-500 text-right font-mono mt-1">
                    ปลดล็อกแล้วเมื่อ: {new Date(ach.unlockedAt).toLocaleDateString("th-TH")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
