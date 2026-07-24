export interface DailyResultTier {
  title: string;          // "PERFECT!", "EXCELLENT!", "GREAT JOB!", "KEEP GOING!", "YOU STARTED!", "NO PROGRESS"
  isSuccess: boolean;     // true for all except 0%
  color: string;
  badgeBg: string;
  positiveQuote: string;  // Encouraging quote
}

export function getDailyResultTier(percent: number): DailyResultTier {
  if (percent >= 100) {
    return {
      title: "PERFECT!",
      isSuccess: true,
      color: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      positiveQuote: "สุดยอดสมบูรณ์แบบ! วันนี้คุณทำลายขีดจำกัดตัวเองได้ 100%!"
    };
  }
  if (percent >= 80) {
    return {
      title: "EXCELLENT!",
      isSuccess: true,
      color: "text-blue-400",
      badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
      positiveQuote: "ยอดเยี่ยมมาก! คุณเข้าใกล้เป้าหมายเข้าไปอีกก้าวใหญ่แล้วนะ!"
    };
  }
  if (percent >= 60) {
    return {
      title: "GREAT JOB!",
      isSuccess: true,
      color: "text-indigo-400",
      badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
      positiveQuote: "ทำได้ดีกว่าเมื่อวานแล้ว! พัฒนาตัวเองขึ้นเรื่อยๆ อย่างน่าภูมิใจ!"
    };
  }
  if (percent >= 40) {
    return {
      title: "KEEP GOING!",
      isSuccess: true,
      color: "text-yellow-400",
      badgeBg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
      positiveQuote: "วันนี้คุณพัฒนาตัวเองแล้วนะ! เก่งมากที่ไม่ยอมแพ้!"
    };
  }
  if (percent >= 1) {
    return {
      title: "YOU STARTED!",
      isSuccess: true,
      color: "text-amber-400",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      positiveQuote: "คุณเริ่มต้นได้ดีแล้ว! การก้าวเดินแม้เพียง 1 ภารกิจก็คือความสำเร็จที่ยิ่งใหญ่!"
    };
  }
  return {
    title: "NO PROGRESS",
    isSuccess: false,
    color: "text-gray-400",
    badgeBg: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    positiveQuote: "ไม่เป็นไรเลยนะ! พักผ่อนให้เต็มที่ แล้วพรุ่งนี้เรามาพยายามอีกนิดกัน!"
  };
}

export const POSITIVE_ENCOURAGEMENT_QUOTES = [
  "คุณเริ่มต้นได้ดีแล้ว!",
  "วันนี้คุณพัฒนาตัวเองแล้วนะ!",
  "พรุ่งนี้เรามาพยายามอีกนิดกัน!",
  "ทำได้ดีกว่าเมื่อวานแล้ว!",
  "เก่งมากที่ไม่ยอมแพ้!",
  "ทำได้เพียง 1 ภารกิจ ก็คือก้าวสำคัญของการเป็นศิลปิน!",
  "สม่ำเสมอสำคัญกว่าความสมบูรณ์แบบ!"
];
