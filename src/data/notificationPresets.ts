import { NotificationEventLog } from "../types";

export interface NotificationCategoryInfo {
  id: string;
  categoryName: string;
  categoryIcon: string;
  targetPage: string;
  pageName: string;
  description: string;
}

export const CATEGORY_PAGE_MAP: Record<string, { targetPage: string; pageName: string }> = {
  "Morning System": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Early Bird": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Good Morning": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Morning Routine": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Health Reminder": { targetPage: "health", pageName: "หน้าสุขภาพและน้ำดื่ม" },
  "แจ้งเตือนดื่มน้ำ": { targetPage: "health", pageName: "หน้าสุขภาพและน้ำดื่ม" },
  "Daily Mission": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "เลือกโหมด": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "เริ่มภารกิจ": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Artist Mode": { targetPage: "daily", pageName: "หน้าภารกิจซ้อมศิลปิน" },
  "ร้องเพลง": { targetPage: "daily", pageName: "หน้าภารกิจซ้อมศิลปิน" },
  "เต้น": { targetPage: "daily", pageName: "หน้าภารกิจซ้อมศิลปิน" },
  "Timer Notification": { targetPage: "timer", pageName: "หน้าตัวจับเวลาซ้อม" },
  "จับเวลา": { targetPage: "timer", pageName: "หน้าตัวจับเวลาซ้อม" },
  "Achievement": { targetPage: "achievements", pageName: "หน้าความสำเร็จและเกียรติยศ" },
  "Level Up": { targetPage: "achievements", pageName: "หน้าความสำเร็จและเกียรติยศ" },
  "Streak": { targetPage: "achievements", pageName: "หน้าความสำเร็จและเกียรติยศ" },
  "Sleep System": { targetPage: "diary", pageName: "หน้าไดอารี่และพักผ่อน" },
  "แจ้งเตือนการนอน": { targetPage: "diary", pageName: "หน้าไดอารี่และพักผ่อน" },
  "Exam Mode": { targetPage: "calendar", pageName: "หน้าตารางเรียนและสอบ" },
  "ช่วงสอบ": { targetPage: "calendar", pageName: "หน้าตารางเรียนและสอบ" },
  "Anti-Lazy System": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "เตือนความขี้เกียจ": { targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  "Random Motivation": { targetPage: "dashboard", pageName: "หน้าแดชบอร์ดหลัก" },
  "กำลังใจรายวัน": { targetPage: "dashboard", pageName: "หน้าแดชบอร์ดหลัก" },
  "AI Coach กวน ๆ": { targetPage: "notifications", pageName: "หน้าศูนย์แจ้งเตือน AI Coach" },
  "AI Coach": { targetPage: "notifications", pageName: "หน้าศูนย์แจ้งเตือน AI Coach" },
};

// Helper function to pick a random item from array
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Structured Notification Messages Catalog
export const NOTIFICATION_MESSAGES = {
  morningSystem: {
    earlyBird: {
      time: "05:30",
      title: "Early Bird",
      category: "Morning System",
      targetPage: "daily",
      pageName: "หน้าภารกิจรายวัน",
      messages: [
        "ตื่นเช้าได้แล้ว! พระอาทิตย์ยังตื่นก่อนคุณเลยนะ",
        "วันนี้จะเป็นวันธรรมดา หรือวันที่เก่งขึ้น?",
        "คนที่ฝันใหญ่ ต้องเริ่มจากการลุกก่อนนะ",
        "เตียงกำลังพยายามกอดคุณไว้ แต่เราต้องไปต่อ!"
      ]
    },
    goodMorning: {
      time: "06:00",
      title: "Good Morning",
      category: "Morning System",
      targetPage: "daily",
      pageName: "หน้าภารกิจรายวัน",
      messages: [
        "สวัสดีตอนเช้า Future Artist วันนี้พร้อมสร้างเวอร์ชันที่ดีกว่าเดิมหรือยัง?",
        "ตื่นแล้วอย่าลืมว่า ความฝันยังรออยู่",
        "เช้าแล้ว! อย่าให้หมอนชนะเราอีกวัน",
        "วันนี้มีโอกาสอีก 1 วันในการเก่งขึ้น"
      ]
    },
    morningRoutine: {
      time: "06:15",
      title: "Morning Routine",
      category: "Morning System",
      targetPage: "daily",
      pageName: "หน้าภารกิจรายวัน",
      messages: [
        "ได้เวลาดูแลตัวเองแล้ว! ล้างหน้า ดื่มน้ำ ยืดตัว เตรียมพร้อม!",
        "ศิลปินไม่ได้มีแค่ความสามารถ แต่ต้องดูแลตัวเองด้วย",
        "ร่างกายพร้อมไหม? สมองพร้อมไหม? ใจพร้อมไหม?"
      ]
    }
  },

  healthReminder: {
    category: "Health Reminder",
    targetPage: "health",
    pageName: "หน้าสุขภาพและน้ำดื่ม",
    title: "Health Reminder",
    timeWindow: "09:00 - 16:00",
    messages: [
      "ดื่มน้ำหรือยัง? หรือจะให้ต้นไม้ในกระถางแซงหน้า?",
      "น้ำไม่ใช่ EXP แต่ขาดไม่ได้นะ",
      "ลุกเดินบ้าง เดี๋ยวเก้าอี้จำหน้าคุณได้",
      "พักสายตาหน่อย ก่อนตาจะลาออก",
      "หลังตรงหน่อย! บุคลิกสำคัญสำหรับศิลปินนะ",
      "หายใจลึก ๆ วันนี้คุณทำได้"
    ]
  },

  dailyMission: {
    selectMode: {
      time: "16:30",
      title: "Daily Mission: เลือกโหมด",
      category: "Daily Mission",
      targetPage: "daily",
      pageName: "หน้าภารกิจรายวัน",
      messages: [
        "วันนี้จะเป็นสายไหน? ขยัน | สอบ | ศิลปิน | วันเบา ๆ — เลือกภารกิจของวันนี้ก่อน ความสำเร็จรออยู่!"
      ]
    },
    startMission: {
      time: "17:00",
      title: "Daily Mission: เริ่มภารกิจ",
      category: "Daily Mission",
      targetPage: "daily",
      pageName: "หน้าภารกิจรายวัน",
      messages: [
        "ถึงเวลาแล้ว! อย่าปล่อยให้ความขี้เกียจชนะ",
        "5 นาทีแรกยากที่สุด หลังจากนั้นจะง่ายขึ้น",
        "เริ่มเลย! อนาคตของคุณกำลังดูอยู่",
        "วันนี้ซ้อมนิดเดียวก็ยังดีกว่าไม่ทำ",
        "ไปเก็บ EXP กัน!"
      ]
    }
  },

  artistMode: {
    singing: {
      timeWindow: "17:30 - 20:00",
      title: "Artist Mode: ร้องเพลง",
      category: "Artist Mode",
      targetPage: "daily",
      pageName: "หน้าภารกิจซ้อมศิลปิน",
      messages: [
        "ได้เวลาทำให้เสียงดีขึ้นแล้ว ไมค์พร้อม คุณพร้อมหรือยัง?",
        "วันนี้เสียงเพี้ยนไม่เป็นไร พรุ่งนี้ต้องดีขึ้น",
        "ศิลปินทุกคนเคยร้องไม่ดีมาก่อน",
        "วอร์มเสียงก่อน อย่าให้คอร้องไห้",
        "อีก 1 เพลง = อีก 1 ก้าว"
      ]
    },
    dancing: {
      timeWindow: "17:30 - 20:00",
      title: "Artist Mode: เต้น",
      category: "Artist Mode",
      targetPage: "daily",
      pageName: "หน้าภารกิจซ้อมศิลปิน",
      messages: [
        "ลุกขึ้น! พื้นที่ซ้อมพร้อมแล้ว วันนี้เต้นกี่นาทีดี?",
        "ขยับตัวหน่อย นักเต้นในอนาคตกำลังรอ",
        "เต้นผิดไม่เป็นไร แต่อย่าหยุด",
        "กระจกไม่ได้ตัดสินคุณ กระจกกำลังช่วยคุณ"
      ]
    }
  },

  timerNotification: {
    category: "Timer Notification",
    targetPage: "timer",
    pageName: "หน้าตัวจับเวลาซ้อม",
    start: {
      title: "Mission Started",
      message: "ห้ามหนี! ระบบกำลังจับตาดูอยู่ โหมดจริงจังเปิดแล้ว"
    },
    rem30m: {
      title: "เหลือ 30 นาที",
      message: "ผ่านไปครึ่งทางแล้ว! อย่าเพิ่งยอมแพ้ ตอนนี้แหละสำคัญ"
    },
    rem15m: {
      title: "เหลือ 15 นาที",
      message: "ใกล้แล้ว! อีกนิดเดียว EXP กำลังรอ"
    },
    rem10m: {
      title: "เหลือ 10 นาที",
      message: "10 นาทีสุดท้าย สู้! อย่าแพ้ตัวเองตอนใกล้เสร็จ"
    },
    rem5m: {
      title: "เหลือ 5 นาที",
      message: "5 นาทีสุดท้าย! ความสำเร็จอยู่ตรงหน้าแล้ว"
    },
    complete: {
      title: "Mission Complete",
      message: "เก่งมาก! วันนี้คุณชนะตัวเองแล้ว +EXP ได้รับ! อย่าลืมภูมิใจในตัวเอง"
    }
  },

  achievement: {
    category: "Achievement",
    targetPage: "achievements",
    pageName: "หน้าความสำเร็จและเกียรติยศ",
    levelUp: {
      title: "LEVEL UP!!",
      messages: [
        "LEVEL UP!! ไม่ใช่เวทมนตร์ คุณพัฒนาตัวเองจริง ๆ",
        "เมื่อวานคุณเป็นแบบหนึ่ง วันนี้คุณดีขึ้นแล้ว",
        "ปลดล็อกความเก่งอีกขั้น"
      ]
    },
    streak3: {
      title: "Streak 3 วัน!",
      message: "3 วันติดแล้ว! เริ่มเป็นนิสัยแล้วนะ"
    },
    streak7: {
      title: "Streak 7 วัน!",
      message: "7 วัน! ความขี้เกียจเริ่มกลัวแล้ว"
    },
    streak30: {
      title: "Streak 30 วัน!",
      message: "30 วัน! นี่ไม่ใช่เล่น ๆ แล้วนะ"
    },
    streak100: {
      title: "Streak 100 วัน!",
      message: "100 วันแห่งความพยายาม! จำวันนี้ไว้ คุณทำได้จริง"
    }
  },

  sleepSystem: {
    category: "Sleep System",
    targetPage: "diary",
    pageName: "หน้าไดอารี่และพักผ่อน",
    time2100: {
      time: "21:00",
      title: "ทบทวนประจำวัน",
      message: "วันนี้ทำอะไรสำเร็จบ้าง? อย่าลืมชมตัวเองนะ"
    },
    time2130: {
      time: "21:30",
      title: "เตรียมพักผ่อน",
      message: "เตรียมพักผ่อน พรุ่งนี้ต้องใช้พลังอีกเยอะ"
    },
    time2200: {
      time: "22:00",
      title: "ได้เวลานอนแล้ว!",
      messages: [
        "ได้เวลานอนแล้ว! ถ้าไม่นอน ใต้ตาจะเดบิวต์ก่อนคุณนะ",
        "ศิลปินก็ต้องพักเหมือนกัน"
      ]
    }
  },

  examMode: {
    category: "Exam Mode",
    targetPage: "calendar",
    pageName: "หน้าตารางเรียนและสอบ",
    before7Days: {
      title: "อีก 7 วันสอบแล้ว!",
      message: "อีก 7 วันสอบแล้ว! เริ่มได้แล้วนะ อย่ารอคืนสุดท้าย สมองมีจำกัดนะ"
    },
    before3Days: {
      title: "อีก 3 วันสอบ!",
      message: "ใกล้แล้ว! ทบทวนอีกนิด"
    },
    before1Day: {
      title: "พรุ่งนี้สอบ!",
      message: "พรุ่งนี้สอบ! วันนี้เน้นทบทวน อย่าหักโหม"
    },
    duringStudy: {
      title: "ช่วงอ่านหนังสือ",
      messages: [
        "อ่าน 25 นาที พัก 5 นาที สมองไม่ได้พัง แค่ต้องพัก",
        "หน้านี้จำไม่ได้? ลองใหม่"
      ]
    }
  },

  antiLazy: {
    category: "Anti-Lazy System",
    targetPage: "daily",
    pageName: "หน้าภารกิจรายวัน",
    missedMission: {
      title: "ระบบตรวจพบความขี้เกียจ",
      messages: [
        "ระบบตรวจพบ... ความขี้เกียจระดับสูง วันนี้เตียงชนะอีกแล้วเหรอ?",
        "TikTok ไม่ได้ทำให้คุณเก่งขึ้นนะ (นิดนึง)",
        "อีก 5 นาทีของวันนี้ อาจเปลี่ยนอนาคตได้"
      ]
    },
    inactivity1Day: {
      title: "หายไปไหนมา?",
      message: "หายไปไหนมา? AI Coach รออยู่นะ"
    },
    inactivity3Days: {
      title: "คิดถึงนะศิลปิน!",
      message: "เริ่มคิดถึงแล้วนะ กลับมาได้แล้ว"
    },
    inactivity7Days: {
      title: "ความฝันยังรออยู่",
      message: "ความฝันยังอยู่ แต่คุณหายไปไหน?"
    },
    inactivity30Days: {
      title: "เริ่มใหม่ได้เสมอ",
      message: "เริ่มใหม่วันนี้ยังทันเสมอ"
    }
  },

  randomMotivation: {
    category: "Random Motivation",
    targetPage: "dashboard",
    pageName: "หน้าแดชบอร์ดหลัก",
    title: "แรงบันดาลใจรายวัน",
    timeWindow: "10:00 - 20:00",
    messages: [
      "วันนี้ลองทำสิ่งที่กลัวดูไหม?",
      "คุณไม่ได้ต้องเก่งที่สุด แค่ดีขึ้นกว่าเมื่อวาน",
      "1% ต่อวัน อีกปีหนึ่งคุณจะเปลี่ยนไปมาก",
      "ความฝันไม่ได้ไกล ถ้าคุณเดินทุกวัน",
      "อย่าดูถูกตัวเองในวันที่กำลังพยายาม",
      "ทุกคนมีจุดเริ่มต้น วันนี้เริ่มได้เลย"
    ]
  },

  aiCoach: {
    category: "AI Coach กวน ๆ",
    targetPage: "notifications",
    pageName: "หน้าศูนย์แจ้งเตือน AI Coach",
    title: "AI Coach เตือนใจ",
    messages: [
      "ระบบพบผู้ใช้กำลังแอบขี้เกียจ",
      "แจ้งเตือนนี้เกิดจาก AI ไม่ใช่แม่ (แต่คล้าย ๆ)",
      "ตรวจพบ EXP หายไป เพราะไม่ได้ทำภารกิจ",
      "ความขี้เกียจกำลังอัปเลเวล เราต้องหยุดมัน!",
      "Breaking News: Future Artist ยังไม่ได้ซ้อมวันนี้",
      "เตือนแล้วนะ เดี๋ยวอนาคตมาถามว่า 'ทำไมไม่เริ่ม'"
    ]
  }
};

export const NOTIFICATION_SYSTEMS = [
  { id: "morning", name: "Morning System (ตอนเช้า)", targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  { id: "health", name: "Health Reminder (ดื่มน้ำ/สุขภาพ)", targetPage: "health", pageName: "หน้าสุขภาพและน้ำดื่ม" },
  { id: "mission", name: "Daily Mission System (ภารกิจประจำวัน)", targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  { id: "artist", name: "Artist Mode System (ฝึกซ้อมเต้น/ร้อง)", targetPage: "daily", pageName: "หน้าภารกิจซ้อมศิลปิน" },
  { id: "timer", name: "Timer & Practice Session (ระหว่างซ้อม)", targetPage: "timer", pageName: "หน้าตัวจับเวลาซ้อม" },
  { id: "achievement", name: "Achievement & Level Up (ปลดล็อก)", targetPage: "achievements", pageName: "หน้าความสำเร็จและเกียรติยศ" },
  { id: "sleep", name: "Sleep System (เข้านอน)", targetPage: "diary", pageName: "หน้าไดอารี่และพักผ่อน" },
  { id: "exam", name: "Exam Mode (โหมดอ่านหนังสือสอบ)", targetPage: "calendar", pageName: "หน้าตารางเรียนและสอบ" },
  { id: "antilazy", name: "Anti-Lazy System (เตือนสติ)", targetPage: "daily", pageName: "หน้าภารกิจรายวัน" },
  { id: "motivation", name: "Random Motivation (แรงบันดาลใจแบบสุ่ม)", targetPage: "dashboard", pageName: "หน้าแดชบอร์ดหลัก" },
  { id: "aicoach", name: "AI Coach กวน ๆ (คำแนะนำส่วนตัว)", targetPage: "notifications", pageName: "หน้าศูนย์แจ้งเตือน AI Coach" },
];

export const getRandomMessageBySystemKey = (systemId: string): string => {
  switch (systemId) {
    case "morning":
      return getRandomItem([
        ...NOTIFICATION_MESSAGES.morningSystem.earlyBird.messages,
        ...NOTIFICATION_MESSAGES.morningSystem.goodMorning.messages,
        ...NOTIFICATION_MESSAGES.morningSystem.morningRoutine.messages
      ]);
    case "health":
      return getRandomItem(NOTIFICATION_MESSAGES.healthReminder.messages);
    case "mission":
      return getRandomItem([
        ...NOTIFICATION_MESSAGES.dailyMission.selectMode.messages,
        ...NOTIFICATION_MESSAGES.dailyMission.startMission.messages
      ]);
    case "artist":
      return getRandomItem([
        ...NOTIFICATION_MESSAGES.artistMode.singing.messages,
        ...NOTIFICATION_MESSAGES.artistMode.dancing.messages
      ]);
    case "timer":
      return getRandomItem([
        NOTIFICATION_MESSAGES.timerNotification.start.message,
        NOTIFICATION_MESSAGES.timerNotification.rem30m.message,
        NOTIFICATION_MESSAGES.timerNotification.rem15m.message,
        NOTIFICATION_MESSAGES.timerNotification.rem10m.message,
        NOTIFICATION_MESSAGES.timerNotification.rem5m.message,
        NOTIFICATION_MESSAGES.timerNotification.complete.message
      ]);
    case "achievement":
      return getRandomItem([
        ...NOTIFICATION_MESSAGES.achievement.levelUp.messages,
        NOTIFICATION_MESSAGES.achievement.streak3.message,
        NOTIFICATION_MESSAGES.achievement.streak7.message,
        NOTIFICATION_MESSAGES.achievement.streak30.message,
        NOTIFICATION_MESSAGES.achievement.streak100.message
      ]);
    case "sleep":
      return getRandomItem([
        NOTIFICATION_MESSAGES.sleepSystem.time2100.message,
        NOTIFICATION_MESSAGES.sleepSystem.time2130.message,
        ...NOTIFICATION_MESSAGES.sleepSystem.time2200.messages
      ]);
    case "exam":
      return getRandomItem([
        NOTIFICATION_MESSAGES.examMode.before7Days.message,
        NOTIFICATION_MESSAGES.examMode.before3Days.message,
        NOTIFICATION_MESSAGES.examMode.before1Day.message,
        ...NOTIFICATION_MESSAGES.examMode.duringStudy.messages
      ]);
    case "antilazy":
      return getRandomItem([
        ...NOTIFICATION_MESSAGES.antiLazy.missedMission.messages,
        NOTIFICATION_MESSAGES.antiLazy.inactivity1Day.message,
        NOTIFICATION_MESSAGES.antiLazy.inactivity3Days.message,
        NOTIFICATION_MESSAGES.antiLazy.inactivity7Days.message,
        NOTIFICATION_MESSAGES.antiLazy.inactivity30Days.message
      ]);
    case "motivation":
      return getRandomItem(NOTIFICATION_MESSAGES.randomMotivation.messages);
    case "aicoach":
      return getRandomItem(NOTIFICATION_MESSAGES.aiCoach.messages);
    default:
      return "สู้ ๆ นะศิลปินฝึกหัด! ความพยายามไม่เคยทรยศใคร";
  }
};

export interface SchoolDayScheduleItem {
  time: string;
  title: string;
  message: string;
  category: string;
  targetPage?: string;
}

export const SCHOOL_DAY_SCHEDULE: SchoolDayScheduleItem[] = [
  { time: "06:00", title: "Wake Up", message: "ตื่นได้แล้ว! ความฝันไม่ทำงานแทนเรานะ", category: "ตื่นนอน", targetPage: "daily" },
  { time: "06:05", title: "Wake Up Again", message: "อีก 5 นาที = อีก 30 นาที อย่าหลอกตัวเอง!", category: "ตื่นนอน", targetPage: "daily" },
  { time: "06:15", title: "Get Up", message: "ลุกจากเตียงได้แล้ว!", category: "ตื่นนอน", targetPage: "daily" },
  { time: "06:30", title: "Shower Time", message: "ไปอาบน้ำกัน ศิลปินต้องดูดีตั้งแต่เช้า", category: "เตรียมตัว", targetPage: "daily" },
  { time: "06:45", title: "Check Bag", message: "เช็กกระเป๋าให้ครบ อย่าลืมสมองไว้บนเตียงนะ", category: "เตรียมตัว", targetPage: "daily" },
  { time: "07:00", title: "Ready!", message: "พร้อมลุยวันนี้!", category: "เตรียมตัว", targetPage: "daily" },
  { time: "07:10", title: "Drink Water", message: "ดื่มน้ำ 1 แก้วก่อนออกจากบ้าน", category: "สุขภาพ", targetPage: "health" },
  { time: "07:30", title: "Travel Safe", message: "เดินทางปลอดภัยนะ", category: "การเดินทาง", targetPage: "daily" },
  { time: "08:20", title: "Before Class", message: "อีก 10 นาทีจะเข้าเรียนแล้ว!", category: "เข้าเรียน", targetPage: "calendar" },
  { time: "08:30", title: "Class Started", message: "ตั้งใจเรียน! EXP วิชาการกำลังรออยู่", category: "เข้าเรียน", targetPage: "calendar" },
  { time: "09:00", title: "Drink Water", message: "ดื่มน้ำหน่อย สมองจะได้ไม่โหลดช้า", category: "สุขภาพ", targetPage: "health" },
  { time: "09:30", title: "Sit Properly", message: "หลังตรงด้วย! อย่านั่งเป็นกุ้ง", category: "สุขภาพ", targetPage: "health" },
  { time: "10:00", title: "Don’t Sleep", message: "ถ้าง่วงให้ล้างหน้า ไม่ใช่หลับคาโต๊ะ", category: "เตือนสติ", targetPage: "daily" },
  { time: "10:30", title: "Keep Going", message: "ใกล้พักกลางวันแล้ว สู้ ๆ", category: "กำลังใจ", targetPage: "daily" },
  { time: "10:50", title: "Lunch Incoming", message: "อีก 10 นาทีได้กินข้าวแล้ว!", category: "พักกลางวัน", targetPage: "health" },
  { time: "11:00", title: "Lunch Time", message: "พักกลางวัน! กินข้าวให้ครบนะ", category: "พักกลางวัน", targetPage: "health" },
  { time: "11:30", title: "Drink Water", message: "ดื่มน้ำหลังอาหารด้วย", category: "สุขภาพ", targetPage: "health" },
  { time: "11:45", title: "Afternoon Class", message: "เตรียมตัวเรียนคาบบ่าย!", category: "เข้าเรียน", targetPage: "calendar" },
  { time: "11:50", title: "Class Started", message: "คาบบ่ายเริ่มแล้ว อย่าปล่อยให้ความง่วงชนะ!", category: "เข้าเรียน", targetPage: "calendar" },
  { time: "12:30", title: "Afternoon Energy", message: "เติมพลังหน่อย ยังเหลืออีกหลายคาบ", category: "กำลังใจ", targetPage: "daily" },
  { time: "13:00", title: "Drink Water", message: "ดื่มน้ำกัน!", category: "สุขภาพ", targetPage: "health" },
  { time: "13:30", title: "Fighting!", message: "เหลืออีกไม่กี่คาบแล้ว", category: "กำลังใจ", targetPage: "daily" },
  { time: "14:00", title: "Sleep Alert", message: "ระบบตรวจพบความง่วงเพิ่มขึ้น 89%", category: "เตือนสติ", targetPage: "daily" },
  { time: "14:30", title: "Last Push", message: "อีกนิดเดียวก็เลิกเรียนแล้ว!", category: "กำลังใจ", targetPage: "daily" },
  { time: "15:00", title: "Almost Done", message: "อีก 10 นาทีเป็นอิสระ!", category: "กำลังใจ", targetPage: "daily" },
  { time: "15:10", title: "School Complete", message: "ภารกิจโรงเรียนสำเร็จ! +50 EXP", category: "เลิกเรียน", targetPage: "achievements" },
  { time: "15:30", title: "Going Home", message: "เดินทางกลับบ้านปลอดภัยนะ", category: "การเดินทาง", targetPage: "daily" },
  { time: "16:00", title: "Home Time", message: "ถึงบ้านแล้วหรือยัง?", category: "การเดินทาง", targetPage: "daily" },
  { time: "16:30", title: "Daily Mode", message: "ได้เวลาเลือกโหมดของวันนี้!", category: "ภารกิจ", targetPage: "daily" },
  { time: "16:45", title: "Rest Time", message: "พักสัก 15-30 นาทีได้", category: "พักผ่อน", targetPage: "daily" },
  { time: "17:00", title: "Start Mission", message: "Future Artist รอคุณอยู่!", category: "ภารกิจ", targetPage: "daily" },
  { time: "17:15", title: "Lazy Alert", message: "ความขี้เกียจกำลังจะโจมตี!", category: "เตือนสติ", targetPage: "daily" },
  { time: "17:30", title: "Warm Up", message: "วอร์มอัป 20 นาทีได้แล้ว!", category: "ฝึกซ้อม", targetPage: "timer" },
  { time: "18:00", title: "Drink Water", message: "ดื่มน้ำกันหน่อย", category: "สุขภาพ", targetPage: "health" },
  { time: "18:15", title: "Singing Time", message: "ไมค์ถามหาคุณอยู่", category: "ฝึกซ้อม", targetPage: "timer" },
  { time: "18:30", title: "Dance Time", message: "ได้เวลาเต้นแล้ว!", category: "ฝึกซ้อม", targetPage: "timer" },
  { time: "19:00", title: "English Time", message: "วันนี้เรียนภาษาอังกฤษหรือยัง?", category: "เรียนรู้", targetPage: "daily" },
  { time: "19:30", title: "Acting Time", message: "Oscar อาจรอคุณอยู่!", category: "ฝึกซ้อม", targetPage: "timer" },
  { time: "20:00", title: "Mission Check", message: "ภารกิจวันนี้เหลืออะไรอีกไหม?", category: "ภารกิจ", targetPage: "daily" },
  { time: "20:30", title: "Water Check", message: "ดื่มน้ำครบหรือยัง?", category: "สุขภาพ", targetPage: "health" },
  { time: "21:00", title: "Daily Score", message: "ให้คะแนนตัวเองวันนี้กี่คะแนน?", category: "ทบทวน", targetPage: "diary" },
  { time: "21:15", title: "Motivation", message: "ทำได้ 1% ก็ยังดีกว่า 0%", category: "กำลังใจ", targetPage: "dashboard" },
  { time: "21:30", title: "Prepare Sleep", message: "เตรียมตัวเข้านอนได้แล้ว", category: "เข้านอน", targetPage: "diary" },
  { time: "21:45", title: "Stop Scrolling", message: "เลิกไถมือถือได้แล้ว!", category: "เข้านอน", targetPage: "diary" },
  { time: "22:00", title: "Good Night", message: "Good Night! พรุ่งนี้เรามาเก่งขึ้นอีก 1% กัน", category: "เข้านอน", targetPage: "diary" }
];

export const RANDOM_MOTIVATIONAL_ALERTS: string[] = [
  "AI ตรวจพบว่าคุณกำลังจะขี้เกียจ!",
  "ถ้าความขี้เกียจเป็นวิชา คุณน่าจะได้เกรด 4",
  "BTS ไม่ได้เดบิวต์เพราะนอนทั้งวันนะ!",
  "ความฝันโทรมา แต่คุณกดวางสายอีกแล้ว",
  "Future You กำลังขอบคุณที่คุณไม่ยอมแพ้",
  "EXP ของวันนี้ยังเก็บไม่ครบ!",
  "ถ้าเหนื่อยก็พัก แต่ห้ามพักจนลืมเริ่ม",
  "ระบบตรวจพบว่าคุณกำลังเปิด YouTube แทนที่จะฝึก",
  "ศิลปินในอนาคตกำลังถูกสร้างขึ้นจากสิ่งที่คุณทำในวันนี้",
  "อย่าปล่อยให้ “พรุ่งนี้ค่อยทำ” ชนะอีกวันนะ!"
];

