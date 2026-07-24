import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Dumbbell, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coffee, 
  GlassWater, 
  Sparkles, 
  Scale, 
  Info,
  ChevronRight,
  Plus,
  Minus
} from "lucide-react";
import { HealthLog } from "../types";
import { getTodayDateString } from "../hooks/useAppState";
import { playChime } from "../utils/audio";

interface HealthViewProps {
  healthLogs: HealthLog[];
  logHealth: (log: Omit<HealthLog, "date">) => void;
}

export default function HealthView({ healthLogs, logHealth }: HealthViewProps) {
  const todayStr = getTodayDateString();

  // Find today's existing log or set defaults
  const todayLog = healthLogs.find(hl => hl.date === todayStr);

  const [height, setHeight] = useState<number>(todayLog?.heightCm || 172);
  const [weight, setWeight] = useState<number>(todayLog?.weightKg || 64);
  const [sleep, setSleep] = useState<number>(todayLog?.sleepHours || 7.5);
  const [water, setWater] = useState<number>(todayLog?.waterIntakeMl || 1500); // ml
  const [exercise, setExercise] = useState<string>(todayLog?.exerciseNotes || "");

  // Update inputs if parent logs change or todayLog gets initialized
  useEffect(() => {
    if (todayLog) {
      setHeight(todayLog.heightCm);
      setWeight(todayLog.weightKg);
      setSleep(todayLog.sleepHours);
      setWater(todayLog.waterIntakeMl);
      setExercise(todayLog.exerciseNotes);
    }
  }, [todayLog]);

  // Calculations
  const calculateBmi = (w: number, h: number) => {
    if (h <= 0) return 0;
    const heightInMeters = h / 100;
    return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmiValue = calculateBmi(weight, height);

  const getBmiInterpretation = (bmi: number) => {
    if (bmi === 0) return { category: "-", desc: "กรอกข้อมูลเพื่อคำนวณ", color: "text-gray-400" };
    if (bmi < 18.5) {
      return { 
        category: "น้ำหนักน้อย / ผอม (Underweight)", 
        desc: "สัดส่วนร่างกายผอมไปนิด แนะนำให้เน้นทานโปรตีนและคาร์โบไฮเดรตเชิงซ้อนเพื่อสร้างกล้ามเนื้อสำหรับการเต้นสะสมพละกำลังที่มั่นคง",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20" 
      };
    }
    if (bmi >= 18.5 && bmi <= 22.9) {
      return { 
        category: "น้ำหนักปกติ / สมส่วน (Healthy)", 
        desc: "ยินดีด้วย! คุณมีดัชนีมวลกายที่สมส่วน สมรรถภาพร่างกายสมดุลอย่างเป็นธรรมชาติ เหมาะอย่างยิ่งสำหรับการยืนเวทีและการออกกำลังกายต่อเนื่อง",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
      };
    }
    if (bmi >= 23.0 && bmi <= 24.9) {
      return { 
        category: "น้ำหนักเกินเกณฑ์ (Overweight)", 
        desc: "ร่างกายมีน้ำหนักเกินเกณฑ์เล็กน้อย ลองเสริมคาร์ดิโอหรือเพิ่มรอบเต้นสตรีมมิ่งเพื่อการสั่นเบิร์นของร่างกายและยืดกล้ามเนื้อควบคุมระบบลมหายใจ",
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20" 
      };
    }
    return { 
      category: "อ้วนระดับเริ่มต้น (Obese)", 
      desc: "ดัชนีมวลกายจัดอยู่ในเกณฑ์อ้วน แนะนำให้ควบคุมปริมาณน้ำตาล ควบคู่กับการซ้อมเต้นสไตล์ Hip-hop / Street Dance ต่อเนื่องเพื่อเบิร์นไขมันอย่างสนุกสนาน",
      color: "text-red-400 bg-red-500/10 border-red-500/20" 
    };
  };

  const bmiDetail = getBmiInterpretation(bmiValue);

  // Water incrementers
  const handleWaterIncrement = (amount: number) => {
    const newVal = Math.max(0, water + amount);
    setWater(newVal);
    playChime("click");
    // Auto save on click
    logHealth({
      heightCm: height,
      weightKg: weight,
      sleepHours: sleep,
      waterIntakeMl: newVal,
      exerciseNotes: exercise
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    logHealth({
      heightCm: height,
      weightKg: weight,
      sleepHours: sleep,
      waterIntakeMl: water,
      exerciseNotes: exercise
    });
    alert("บันทึกข้อมูลสุขภาพวันนี้สำเร็จ!");
  };

  // Water glass count (assuming 250ml per glass)
  const glassesGoal = 8;
  const currentGlasses = Math.min(glassesGoal, Math.floor(water / 250));
  const waterPercent = Math.min(100, Math.round((water / 2000) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Heart className="text-rose-400" size={26} />
          <span>บันทึกสุขภาพศิลปิน (Health & Body Tracker)</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          ติดตามรูปร่าง มวลกาย การพักผ่อน และการดื่มน้ำ เพื่อคงสภาพสมบูรณ์พร้อมของกล้ามเนื้อสำหรับการร้องและการแสดง
        </p>
      </div>

      {/* Main Grid: Left inputs & Water, Right BMI Analysis & Sleep */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left (Span 7) - Inputs and Hydration */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form to log body dimensions */}
          <div className="glass-panel rounded-[30px] p-6">
            <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <Scale size={18} className="text-rose-400" />
              <span>ดัชนีสัดส่วนร่างกายวันนี้</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">ส่วนสูง (เซนติเมตร)</label>
                  <input
                    id="health-height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400">น้ำหนัก (กิโลกรัม)</label>
                  <input
                    id="health-weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-sm text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">บันทึกคาร์ดิโอ / กิจกรรมกีฬาเสริมวันนี้</label>
                <textarea
                  id="health-exercise-notes"
                  rows={2}
                  placeholder="เช่น เล่นโยคะยืดตัวตอนเช้า 15 นาที, วิ่งสลับเดินคาร์ดิโอเพิ่มปอดแข็งแรง..."
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-[16px] text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                id="save-health-btn"
                type="submit"
                className="w-full py-3 bg-rose-500 text-gray-950 hover:bg-rose-400 rounded-[16px] text-xs font-bold cursor-pointer shadow-lg shadow-rose-500/10 transition-all flex items-center justify-center gap-2"
              >
                <span>บันทึกความฟิตสัดส่วนร่างกาย</span>
              </button>
            </form>
          </div>

          {/* Hydration Water Tracking Panel */}
          <div className="glass-panel rounded-[30px] p-6 relative overflow-hidden">
            <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <GlassWater size={18} className="text-cyan-400" />
              <span>ความชุ่มชื้นกระตุ้นเสียง (Hydration Tracker)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Visual Water Tank Cup */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-28 h-40 border-4 border-white/10 bg-white/3 rounded-b-[20px] rounded-t-[10px] overflow-hidden shadow-inner flex flex-col justify-end">
                  
                  {/* Floating Fluid animation with state water percent */}
                  <div 
                    className="w-full bg-cyan-400/30 border-t border-cyan-300 transition-all duration-500 relative"
                    style={{ height: `${waterPercent}%` }}
                  >
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center select-none">
                      <span className="text-xs font-mono font-black text-white text-glow-blue">{waterPercent}%</span>
                    </div>
                  </div>

                </div>
                <span className="text-[10px] text-gray-500 font-mono mt-3">เป้าหมาย: 2,000 มล. (8 แก้ว)</span>
              </div>

              {/* Water Controls */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <p className="text-2xl font-display font-black text-white">{water} <span className="text-sm font-normal text-gray-400">มล. (ml)</span></p>
                  <p className="text-xs text-gray-400 mt-1">
                    การดื่มน้ำบ่อยๆ ช่วยรักษาสายเสียงและเส้นประสาทลำคอหล่อลื่นขณะวอร์มเสียงโน้ตสูง
                  </p>
                </div>

                {/* Glass representation row */}
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: glassesGoal }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-7 h-9 rounded-[8px] border-2 transition-all flex items-center justify-center text-[10px] ${
                        idx < currentGlasses 
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" 
                          : "border-white/5 bg-white/2 text-gray-600"
                      }`}
                    >
                      {idx < currentGlasses ? "✓" : idx + 1}
                    </div>
                  ))}
                </div>

                {/* Plus / Minus Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="water-dec-btn"
                    onClick={() => handleWaterIncrement(-250)}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[14px] flex items-center justify-center cursor-pointer transition-all"
                    title="ลดน้ำ 250 มล."
                  >
                    <Minus size={14} />
                  </button>

                  <button
                    id="water-inc-btn"
                    onClick={() => handleWaterIncrement(250)}
                    className="flex-1 py-3 bg-cyan-500 text-gray-950 font-bold text-xs rounded-[16px] hover:bg-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                  >
                    <Plus size={14} />
                    <span>เติมน้ำ 1 แก้ว (250ml)</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Right (Span 5) - BMI Analysis & Sleep */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* BMI Interpretation */}
          <div className="glass-panel rounded-[30px] p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              <span>ผลประเมินดัชนีมวลกาย (BMI Analysis)</span>
            </h3>

            <div className="bg-black/30 rounded-[20px] p-5 text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">ดัชนีมวลกายของคุณ</p>
              <p className="text-4xl font-display font-black text-white mt-1.5 font-mono">{bmiValue}</p>
              
              {bmiValue > 0 && (
                <div className={`mt-4 px-3 py-1.5 rounded-full border text-xs font-bold ${bmiDetail.color}`}>
                  {bmiDetail.category}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-normal bg-white/5 p-4 rounded-[20px] border border-white/5">
              {bmiDetail.desc}
            </p>

            <div className="pt-2 text-[10px] text-gray-500 flex items-center gap-1.5 leading-normal">
              <Info size={13} className="shrink-0 text-gray-400" />
              <span>สูตรคำนวณ: น้ำหนัก (กก.) หารด้วย ส่วนสูง (เมตร) ยกกำลังสอง อ้างอิงตามเกณฑ์มวลกายชาวเอเชีย</span>
            </div>
          </div>

          {/* Sleep hours Logger */}
          <div className="glass-panel rounded-[30px] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Clock size={18} className="text-yellow-400" />
                <span>การพักผ่อนฟื้นฟูกล้ามเนื้อ (Sleep Duration)</span>
              </h3>
              <span className="text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                เป้าหมาย: 7.5 ชม.
              </span>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-3xl font-display font-black text-white font-mono">{sleep} <span className="text-sm font-normal text-gray-400">ชั่วโมง</span></p>

              {/* Slider for sleep hours */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-600">4ชม.</span>
                <input
                  id="sleep-range"
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={sleep}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSleep(val);
                    logHealth({
                      heightCm: height,
                      weightKg: weight,
                      sleepHours: val,
                      waterIntakeMl: water,
                      exerciseNotes: exercise
                    });
                  }}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-rose-500 border border-white/5"
                />
                <span className="text-xs font-bold text-gray-600">12ชม.</span>
              </div>

              <div className="text-left bg-black/20 p-3.5 rounded-[18px]">
                <p className="text-[11px] text-gray-400 leading-normal">
                  {sleep >= 7 && sleep <= 9 
                    ? "✓ ปริมาณนอนหลับยอดเยี่ยม! ร่างกายหลังสารโกรทฮอร์โมนฟื้นฟูเซลล์กล้ามเนื้อและสายเสียงได้อย่างมีประสิทธิภาพสูงสุด" 
                    : "⚠️ ร่างกายนอนหลับไม่เต็มอิ่มหรือมากเกินไป แนะนำให้เข้านอนเวลา 22:00 เพื่อรักษาวงจรนาฬิกาชีวภาพศิลปิน"}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
