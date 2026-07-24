import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  Activity, 
  Mic, 
  Heart, 
  Flame, 
  PlusCircle, 
  CheckCircle,
  TrendingUp,
  X,
  Compass,
  Sparkles,
  Award
} from "lucide-react";
import { Goal } from "../types";

interface GoalViewProps {
  goals: Goal[];
  addGoal: (g: Omit<Goal, "id" | "createdAt" | "completed">) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, value: number) => void;
}

export default function GoalView({
  goals,
  addGoal,
  deleteGoal,
  updateGoalProgress
}: GoalViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Goal["category"]>("Other");
  const [newTarget, setNewTarget] = useState(10);
  const [newCurrent, setNewCurrent] = useState(0);
  const [newUnit, setNewUnit] = useState("ครั้ง");
  const [newDate, setNewDate] = useState("2026-12-31");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addGoal({
      title: newTitle,
      category: newCategory,
      targetValue: newTarget,
      currentValue: newCurrent,
      unit: newUnit,
      targetDate: newDate
    });

    // Reset Form
    setNewTitle("");
    setNewCategory("Other");
    setNewTarget(10);
    setNewCurrent(0);
    setNewUnit("ครั้ง");
    setNewDate("2026-12-31");
    setIsAdding(false);
  };

  const getCategoryIcon = (category: Goal["category"]) => {
    switch (category) {
      case "Dancing": return <Activity className="text-cyan-400" size={16} />;
      case "Singing": return <Mic className="text-pink-400" size={16} />;
      case "Health": return <Heart className="text-rose-400" size={16} />;
      case "Exercise": return <Flame className="text-orange-400" size={16} />;
      case "Confidence": return <Sparkles className="text-yellow-400" size={16} />;
      default: return <Target className="text-blue-400" size={16} />;
    }
  };

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} วัน` : "เลยกำหนด";
  };

  const filteredGoals = goals.filter(g => {
    if (filter === "active") return !g.completed;
    if (filter === "completed") return g.completed;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Target className="text-blue-400" size={26} />
            <span>เป้าหมายความฝัน (Goal Tracking System)</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            ตั้งเป้าหมายส่วนตัว ทั้งน้ำหนัก ส่วนสูง ชั่วโมงเต้น และติดตามผลความคืบหน้าอย่างเป็นขั้นเป็นตอน
          </p>
        </div>

        <button
          id="add-goal-open-btn"
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-gray-950 font-bold rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 self-start sm:self-center"
        >
          <Plus size={16} className="stroke-[3px]" />
          <span>เพิ่มเป้าหมายใหม่</span>
        </button>
      </div>

      {/* Goal Filters Tabs */}
      <div className="flex bg-white/5 border border-white/10 p-1 rounded-full self-start max-w-xs">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            id={`filter-goals-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex-1 ${
              filter === f
                ? "bg-white text-gray-950 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : f === "active" ? "กำลังทำ" : "เสร็จสิ้น"}
          </button>
        ))}
      </div>

      {/* Adding Goal Glass Drawer / Overlay Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/15 rounded-[30px] w-full max-w-lg p-6 relative overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <PlusCircle size={20} className="text-blue-400" />
                <span>บันทึกเป้าหมายศิลปินฝึกหัด</span>
              </h3>
              <button 
                id="close-add-goal-btn"
                onClick={() => setIsAdding(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">ชื่อเป้าหมายของคุณ</label>
                <input
                  id="new-goal-title"
                  type="text"
                  placeholder="เช่น เก็บซ้อมท่าเต้น BTS, ร้องท่อนแร็ปเร็วขึ้น"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">หมวดหมู่</label>
                  <select
                    id="new-goal-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Goal["category"])}
                    className="w-full p-3 bg-[#161a22] border border-white/10 rounded-[16px] text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="Singing">🎤 Singing (การร้อง)</option>
                    <option value="Dancing">🕺 Dancing (การเต้น)</option>
                    <option value="Acting">🎬 Acting (การแสดง)</option>
                    <option value="English">🗣️ English (ภาษาอังกฤษ)</option>
                    <option value="Exercise">🔥 Exercise (ออกกำลังกาย)</option>
                    <option value="Health">❤️ Health (สุขภาพ/หุ่น)</option>
                    <option value="Confidence">✨ Confidence (เสน่ห์)</option>
                    <option value="Other">🎯 Other (เป้าหมายอื่นๆ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">หน่วยวัด</label>
                  <input
                    id="new-goal-unit"
                    type="text"
                    placeholder="เช่น วัน, ชั่วโมง, เพลง, กก."
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">เป้าหมายตัวเลข (Target)</label>
                  <input
                    id="new-goal-target"
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">ค่าปัจจุบัน (Current)</label>
                  <input
                    id="new-goal-current"
                    type="number"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">วันกำหนดบรรลุผลเป้าหมาย</label>
                <input
                  id="new-goal-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 bg-[#161a22] border border-white/10 rounded-[16px] text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  id="cancel-add-goal"
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white/5 text-gray-400 hover:text-white rounded-[16px] text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  id="submit-new-goal-btn"
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-gray-950 hover:bg-blue-400 rounded-[16px] text-xs font-bold"
                >
                  บันทึกความฝัน 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Cards Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((goal) => {
          const rawPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
          const progressPercent = Math.min(100, Math.round(rawPercent));
          
          return (
            <div 
              key={goal.id} 
              id={`goal-card-${goal.id}`}
              className={`glass-panel rounded-[26px] p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                goal.completed ? "border-emerald-500/30 bg-emerald-950/5 shadow-md shadow-emerald-500/5" : "border-white/5"
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-[12px]">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold truncate text-white ${goal.completed ? "line-through text-gray-400" : ""}`}>
                        {goal.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5">หมวด: {goal.category}</p>
                    </div>
                  </div>

                  <button
                    id={`delete-goal-${goal.id}`}
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 shrink-0 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="my-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">ความสำเร็จ</span>
                    <span className={`font-bold ${goal.completed ? "text-emerald-400" : "text-blue-300"}`}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit} ({progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.completed ? "bg-emerald-400" : "bg-blue-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Increments Panel */}
                {!goal.completed && (
                  <div className="flex items-center justify-between gap-3 bg-black/20 p-2 rounded-[18px] mb-4">
                    <span className="text-[10px] font-bold text-gray-500 ml-1">ปรับเปลี่ยนคืบหน้า:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`decrement-goal-val-${goal.id}`}
                        onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                        className="w-7 h-7 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-2.5 min-w-[2rem] text-center">
                        {goal.currentValue}
                      </span>
                      <button
                        id={`increment-goal-val-${goal.id}`}
                        onClick={() => updateGoalProgress(goal.id, Math.min(goal.targetValue, goal.currentValue + 1))}
                        className="w-7 h-7 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Goal Footer Details */}
              <div className="pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>เหลืออีก: {getDaysLeft(goal.targetDate)}</span>
                </span>
                <span className="font-mono">เป้าหมาย: {goal.targetDate}</span>
              </div>

              {/* Success Badge */}
              {goal.completed && (
                <div className="absolute right-3 top-10 transform rotate-12 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 py-1 px-3.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1">
                  <CheckCircle size={10} />
                  <span>COMPLETED</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-1 md:col-span-2 glass-panel rounded-[24px] p-8 text-center text-gray-500">
            ไม่มีเป้าหมายที่สอดคล้องกับตัวกรองที่เลือก
          </div>
        )}
      </div>

      {/* Goal insights */}
      <div className="glass-panel rounded-[30px] p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-[20px] bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
          <Award size={26} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Compass size={14} className="text-yellow-400" />
            <span>คำแนะนำการพิชิตเป้าหมายรายสัปดาห์</span>
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            ผู้ใช้อายุ 15-20 ปีเฉลี่ยจะตั้งเป้าหมายไว้ประมาณ 5 ข้อต่อเดือน แนะนำให้กระจายไปทางด้าน <strong>สุขภาพ (Health)</strong> เพื่อควบคุมกล้ามเนื้อและรูปร่าง ควบคู่กับการพัฒนา <strong>ทักษะการร้องและเต้น (Vocal & Dance)</strong> เพื่อเตรียมตัวคัดเลือกตัวในทุกโอกาส!
          </p>
        </div>
      </div>

    </div>
  );
}
