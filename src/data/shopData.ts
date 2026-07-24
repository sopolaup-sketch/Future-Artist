export interface ShopItem {
  id: string;
  category: "time" | "reduce_time" | "buff" | "pass" | "mystery_box";
  name: string;
  description: string;
  basePrice: number;
  minutesValue?: number; // for time / reduce time items
  iconName: string;
  badge?: string;
  color: string;
}

export const TIME_SHOP_ITEMS: ShopItem[] = [
  { id: "time-5m", category: "time", name: "+5 นาที", description: "เพิ่มเวลาฝึกซ้อมกระตุ้นสมาธิ 5 นาที", basePrice: 50, minutesValue: 5, iconName: "Clock", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-10m", category: "time", name: "+10 นาที", description: "เพิ่มเวลาซ้อมเสียง/เต้น 10 นาที", basePrice: 100, minutesValue: 10, iconName: "Clock", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-15m", category: "time", name: "+15 นาที", description: "ยืดเวลาซ้อมต่อยอดพัฒนาการ 15 นาที", basePrice: 200, minutesValue: 15, iconName: "Clock", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-20m", category: "time", name: "+20 นาที", description: "เติมเวลาฝึกซ้อมเพื่อความเป๊ะ 20 นาที", basePrice: 300, minutesValue: 20, iconName: "Clock", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-30m", category: "time", name: "+30 นาที", description: "ครึ่งชั่วโมงแห่งการพัฒนาฝีมืออย่างก้าวกระโดด", basePrice: 500, minutesValue: 30, iconName: "Clock", badge: "ยอดนิยม", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-45m", category: "time", name: "+45 นาที", description: "ซ้อมเข้มข้น มุ่งสู่มาตรฐานระดับไอดอล", basePrice: 750, minutesValue: 45, iconName: "Clock", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-1h", category: "time", name: "+1 ชั่วโมง", description: "1 ชั่วโมงเต็ม! เก็บ EXP และเหรียญแบบจัดเต็ม", basePrice: 1000, minutesValue: 60, iconName: "Zap", badge: "คุ้มค่า", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "time-2h", category: "time", name: "+2 ชั่วโมง", description: "สุดยอดเด็กขยัน! เพิ่มเวลาซ้อมมินิมาราธอน 2 ชั่วโมง", basePrice: 2500, minutesValue: 120, iconName: "Sparkles", badge: "HARD WORKER", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" }
];

export const REDUCE_TIME_ITEMS: ShopItem[] = [
  { id: "reduce-5m", category: "reduce-time" as any, name: "-5 นาที", description: "ลดเวลาซ้อมลง 5 นาที (คิดให้ดีก่อนซื้อ!)", basePrice: 5000, minutesValue: -5, iconName: "MinusCircle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-10m", category: "reduce-time" as any, name: "-10 นาที", description: "ลดเวลาซ้อม 10 นาที (แพงกว่าการเพิ่มเวลาหลายร้อยเท่า)", basePrice: 10000, minutesValue: -10, iconName: "MinusCircle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-15m", category: "reduce-time" as any, name: "-15 นาที", description: "ลดเวลาซ้อม 15 นาที แลกกับ Coins มหาศาล", basePrice: 25000, minutesValue: -15, iconName: "MinusCircle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-20m", category: "reduce-time" as any, name: "-20 นาที", description: "ตัดเวลาภารกิจ 20 นาทีอย่างมหาโหด", basePrice: 50000, minutesValue: -20, iconName: "MinusCircle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-30m", category: "reduce-time" as any, name: "-30 นาที", description: "ลดเวลาซ้อมครึ่งชั่วโมง (ราคาหลักแสน!)", basePrice: 100000, minutesValue: -30, iconName: "AlertTriangle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-45m", category: "reduce-time" as any, name: "-45 นาที", description: "ลดเวลา 45 นาที มีผลเสียต่อการพัฒนาตนเอง", basePrice: 250000, minutesValue: -45, iconName: "AlertTriangle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-1h", category: "reduce-time" as any, name: "-1 ชั่วโมง", description: "ลดเวลาซ้อม 1 ชั่วโมง (500,000 Coins)", basePrice: 500000, minutesValue: -60, iconName: "AlertTriangle", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-1h30m", category: "reduce-time" as any, name: "-1 ชั่วโมง 30 นาที", description: "ลดเวลาซ้อม 1.5 ชั่วโมง (1.5 ล้าน Coins)", basePrice: 1500000, minutesValue: -90, iconName: "Skull", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-300" },
  { id: "reduce-skip-today", category: "reduce-time" as any, name: "Skip Today’s Training", description: "ข้ามการฝึกซ้อมของวันนี้ทั้งหมดทันที (5,000,000 Coins)", basePrice: 5000000, minutesValue: -999, iconName: "FlameKindling", badge: "ขี้เกียจระดับ VIP", color: "from-red-600/30 to-rose-900/40 border-red-500/50 text-red-200" }
];

export const BUFF_SHOP_ITEMS: ShopItem[] = [
  { id: "buff-expx2", category: "buff", name: "EXP x2 (1 ชั่วโมง)", description: "รับคูณ EXP สองเท่าจากการฝึกซ้อมทุกกิจกรรมเป็นเวลา 1 ชั่วโมง", basePrice: 500, iconName: "TrendingUp", badge: "BOOST", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300" },
  { id: "buff-coinsx2", category: "buff", name: "Coins x2 (1 ชั่วโมง)", description: "รับเหรียญ Coins สองเท่าจากการซ้อมและทำภารกิจเป็นเวลา 1 ชั่วโมง", basePrice: 750, iconName: "Coins", badge: "DOUBLE COINS", color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300" },
  { id: "buff-dailyx2", category: "buff", name: "Daily Reward x2", description: "รับรางวัลภารกิจประจำวันเพิ่มขึ้นเป็น 2 เท่า", basePrice: 1000, iconName: "Gift", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300" },
  { id: "buff-perfectday", category: "buff", name: "Perfect Day โบนัส", description: "โบนัสพิเศษเมื่อทำภารกิจครบ 100% ในวันนั้น", basePrice: 2000, iconName: "Star", badge: "BONUS", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-300" },
  { id: "buff-weeklyx2", category: "buff", name: "Weekly Reward x2", description: "คูณ 2 รางวัลสรุปผลประจำสัปดาห์", basePrice: 5000, iconName: "Crown", color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300" }
];

export const PASS_SHOP_ITEMS: ShopItem[] = [
  { id: "pass-recovery", category: "pass", name: "Recovery Pass (ป่วย)", description: "ใช้เปิด Sick Mode รักษาสุขภาพ โดยไม่เสีย Streak และไม่หักคะแนน", basePrice: 50000, iconName: "HeartPulse", badge: "สายสุขภาพ", color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300" },
  { id: "pass-emergency", category: "pass", name: "Emergency Pass", description: "บัตรฉุกเฉินสำหรับวันที่เกิดเหตุไม่คาดคิด ช่วยคุ้มครองประวัติการฝึกซ้อม", basePrice: 75000, iconName: "ShieldAlert", color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300" },
  { id: "pass-freeze-1d", category: "pass", name: "Freeze Streak (1 วัน)", description: "แช่แข็ง Streak 1 วัน สำหรับวันหยุดพักผ่อน", basePrice: 100000, iconName: "Snowflake", color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300" },
  { id: "pass-freeze-3d", category: "pass", name: "Freeze Streak (3 วัน)", description: "แช่แข็ง Streak ยาว 3 วัน ป้องกัน Streak หลุด", basePrice: 500000, iconName: "Snowflake", color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300" },
  { id: "pass-freeze-7d", category: "pass", name: "Freeze Streak (7 วัน)", description: "แช่แข็ง Streak ยาว 1 สัปดาห์สำหรับช่วงพักร้อน", basePrice: 2500000, iconName: "Snowflake", badge: "VACATION", color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-300" },
  { id: "pass-skip-day", category: "pass", name: "Skip Day Pass", description: "บัตรข้ามวัน 1 วัน ได้รับผลสำเร็จรายวันอัตโนมัติ", basePrice: 5000000, iconName: "FastForward", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300" },
  { id: "pass-skip-week", category: "pass", name: "Skip Week Pass", description: "บัตรมหาเศรษฐี ข้ามการซ้อม 1 สัปดาห์ (100,000,000 Coins)", basePrice: 100000000, iconName: "Sparkles", badge: "EXTREME", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-200" },
  { id: "pass-skip-month", category: "pass", name: "Skip Month Pass", description: "ตำนานความขี้เกียจ! ข้ามการซ้อมทั้งเดือน (1,000,000,000 Coins)", basePrice: 1000000000, iconName: "Crown", badge: "LEGENDARY LUXURY", color: "from-amber-400/30 to-yellow-600/30 border-yellow-400/60 text-yellow-100" }
];

export const MYSTERY_BOX_ITEMS: ShopItem[] = [
  { id: "box-common", category: "mystery_box", name: "Common Box", description: "สุ่มรับ 100 - 1,000 Coins หรือ EXP Bonus", basePrice: 500, iconName: "Package", badge: "เริ่มต้น", color: "from-gray-500/20 to-slate-500/10 border-gray-500/30 text-gray-300" },
  { id: "box-rare", category: "mystery_box", name: "Rare Box", description: "สุ่มรับ 1,000 - 15,000 Coins, Buffs หรือ EXP x2", basePrice: 5000, iconName: "PackageCheck", badge: "RARE", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300" },
  { id: "box-epic", category: "mystery_box", name: "Epic Box", description: "สุ่มรับ 10,000 - 100,000 Coins, Daily Buffs หรือ Special Passes", basePrice: 25000, iconName: "Sparkle", badge: "EPIC", color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300" },
  { id: "box-legendary", category: "mystery_box", name: "Legendary Box", description: "สุ่มรับ 50,000 - 500,000 Coins, Freeze Streaks, หรือ Frame ลิมิเต็ด", basePrice: 100000, iconName: "Crown", badge: "LEGENDARY", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-300" },
  { id: "box-mythic", category: "mystery_box", name: "Mythic Box", description: "สุ่มรับ 500,000 - 5,000,000 Coins, Recovery Passes & VIP Badges", basePrice: 1000000, iconName: "Zap", badge: "MYTHIC", color: "from-rose-500/20 to-amber-500/20 border-rose-500/40 text-rose-300" },
  { id: "box-ultimate", category: "mystery_box", name: "Ultimate Box", description: "กล่องมหาสมบัติมหาเศรษฐี! สุ่มรับสูงสุด 50,000,000 Coins & Ultimate Titles", basePrice: 10000000, iconName: "Gem", badge: "ULTIMATE JACKPOT", color: "from-amber-400/30 to-purple-600/30 border-amber-400/50 text-amber-200" }
];

export function getFinalItemPrice(
  item: ShopItem,
  isHardWorkerToday: boolean,
  missedDaysStraight: number
): { finalPrice: number; discountPercent: number; penaltyMultiplier: number } {
  let finalPrice = item.basePrice;
  let discountPercent = 0;
  let penaltyMultiplier = 1;

  // Rule 1: Time Shop items get 20% discount for hard workers who finished today's training
  if (item.category === "time" && isHardWorkerToday) {
    discountPercent = 20;
    finalPrice = Math.round(finalPrice * 0.8);
  }

  // Rule 2: Reduce Time items get severe Laziness Penalties when missing days straight
  if (item.category === ("reduce-time" as any) || item.id.startsWith("reduce-")) {
    if (missedDaysStraight >= 14) {
      penaltyMultiplier = 5; // x5
    } else if (missedDaysStraight >= 7) {
      penaltyMultiplier = 2; // x2
    } else if (missedDaysStraight >= 3) {
      penaltyMultiplier = 1.5; // +50%
    }
    finalPrice = Math.round(finalPrice * penaltyMultiplier);
  }

  return { finalPrice, discountPercent, penaltyMultiplier };
}
