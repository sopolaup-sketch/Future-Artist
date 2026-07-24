export enum DailyModeType {
  FREE_DAY = "FREE_DAY",
  NORMAL_DAY = "NORMAL_DAY",
  STUDY_DAY = "STUDY_DAY",
  ACTIVITY_DAY = "ACTIVITY_DAY",
  LAZY_DAY = "LAZY_DAY",
  NO_TIME_DAY = "NO_TIME_DAY",
  EXAM_MODE = "EXAM_MODE",
  SICK_MODE = "SICK_MODE",
  NONE = "NONE"
}

export interface Mission {
  id: string;
  name: string;
  durationMinutes: number;
  completed: boolean;
}

export interface DailyModeConfig {
  type: DailyModeType;
  nameThai: string;
  nameEng?: string;
  durationMinutes: number;
  xpReward: number;
  color: string; // Tailwind color class or hex
  quotaPerMonth: number;
  missions: Omit<Mission, "completed">[];
}

export const DAILY_MODES_CONFIG: Record<DailyModeType, DailyModeConfig> = {
  [DailyModeType.FREE_DAY]: {
    type: DailyModeType.FREE_DAY,
    nameThai: "Free Day (วันฝึกหนัก)",
    durationMinutes: 240, // 4 hours
    xpReward: 100,
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10",
    quotaPerMonth: 6,
    missions: [
      { id: "fd-1", name: "วอร์มร่างกาย & ออกกำลังกาย (Exercise)", durationMinutes: 45 },
      { id: "fd-2", name: "ฝึกทักษะการเต้น (Dance practice)", durationMinutes: 90 },
      { id: "fd-3", name: "ฝึกทักษะการร้องเพลง (Singing vocal training)", durationMinutes: 60 },
      { id: "fd-4", name: "ฝึกการแสดง & อารมณ์ (Acting & Expression)", durationMinutes: 45 }
    ]
  },
  [DailyModeType.NORMAL_DAY]: {
    type: DailyModeType.NORMAL_DAY,
    nameThai: "Normal Day (วันทั่วไป)",
    durationMinutes: 90, // 1.5 hours
    xpReward: 70,
    color: "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/10",
    quotaPerMonth: 10,
    missions: [
      { id: "nd-1", name: "วอร์มร่างกาย (Exercise)", durationMinutes: 20 },
      { id: "nd-2", name: "ฝึกซ้อมเต้น (Dance)", durationMinutes: 30 },
      { id: "nd-3", name: "ซ้อมร้องเพลง (Singing)", durationMinutes: 20 },
      { id: "nd-4", name: "เรียนรู้ภาษาอังกฤษ (English)", durationMinutes: 10 },
      { id: "nd-5", name: "ฝึกการแสดง (Acting)", durationMinutes: 10 }
    ]
  },
  [DailyModeType.STUDY_DAY]: {
    type: DailyModeType.STUDY_DAY,
    nameThai: "Study Day (วันเรียนเยอะ)",
    durationMinutes: 50, // ~50 mins
    xpReward: 50,
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/10",
    quotaPerMonth: 6,
    missions: [
      { id: "sd-1", name: "ออกกำลังกายยืดกล้ามเนื้อ (Stretching)", durationMinutes: 10 },
      { id: "sd-2", name: "ซ้อมเต้นสั้นๆ (Dance session)", durationMinutes: 15 },
      { id: "sd-3", name: "ซ้อมร้องเพลง / วอร์มเสียง (Vocal warm-up)", durationMinutes: 15 },
      { id: "sd-4", name: "ทบทวนคำศัพท์อังกฤษ (English vocabulary)", durationMinutes: 10 }
    ]
  },
  [DailyModeType.ACTIVITY_DAY]: {
    type: DailyModeType.ACTIVITY_DAY,
    nameThai: "Activity Day (วันทำกิจกรรม)",
    durationMinutes: 30,
    xpReward: 30,
    color: "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/10",
    quotaPerMonth: 4,
    missions: [
      { id: "ad-1", name: "ซ้อมเต้น / ท่าฮิต (Dance choreo)", durationMinutes: 15 },
      { id: "ad-2", name: "ซ้อมร้องเพลงโปรด (Singing favorite song)", durationMinutes: 15 }
    ]
  },
  [DailyModeType.LAZY_DAY]: {
    type: DailyModeType.LAZY_DAY,
    nameThai: "Lazy Day (วันพักผ่อนเบาๆ)",
    durationMinutes: 15,
    xpReward: 10,
    color: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/10",
    quotaPerMonth: 3,
    missions: [
      { id: "ld-1", name: "ยืดกล้ามเนื้อคลายเครียด (Light Stretch)", durationMinutes: 5 },
      { id: "ld-2", name: "วอร์มเสียงเบาๆ ในห้องน้ำ (Humming & Vocal warm)", durationMinutes: 5 },
      { id: "ld-3", name: "ฝึกโพสท่าหน้ากระจก (Pose & Performance check)", durationMinutes: 5 }
    ]
  },
  [DailyModeType.NO_TIME_DAY]: {
    type: DailyModeType.NO_TIME_DAY,
    nameThai: "No Time Day (วันยุ่งสุดขีด)",
    durationMinutes: 5,
    xpReward: 5,
    color: "bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/10",
    quotaPerMonth: 1,
    missions: [
      { id: "ntd-1", name: "แพลงก์กระตุ้นกล้ามเนื้อ (Plank / Quick exercise)", durationMinutes: 5 }
    ]
  },
  [DailyModeType.EXAM_MODE]: {
    type: DailyModeType.EXAM_MODE,
    nameThai: "Exam Mode (โหมดสอบ)",
    durationMinutes: 45, // 30–45 นาที/วัน
    xpReward: 40,
    color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10",
    quotaPerMonth: 30, // ใช้ได้ตลอดช่วงสอบ
    missions: [
      { id: "em-1", name: "📖 อ่านหนังสือ / ทบทวนบทเรียน", durationMinutes: 25 },
      { id: "em-2", name: "🎤 วอร์มเสียง + ฝึกร้อง", durationMinutes: 10 },
      { id: "em-3", name: "🧘 ยืดเหยียด / ออกกำลังกายเบา ๆ", durationMinutes: 5 },
      { id: "em-4", name: "💧 ดื่มน้ำ (1 แก้ว)", durationMinutes: 1 },
      { id: "em-5", name: "😴 เข้านอนตรงเวลา (ก่อน 22:30 น.)", durationMinutes: 1 }
    ]
  },
  [DailyModeType.SICK_MODE]: {
    type: DailyModeType.SICK_MODE,
    nameThai: "Sick Mode (วันป่วยพักฟื้น)",
    durationMinutes: 0,
    xpReward: 0,
    color: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10",
    quotaPerMonth: 0,
    missions: [
      { id: "sm-1", name: "นอนหลับพักผ่อน & ดื่มน้ำอุ่น (Rest & Stay Hydrated)", durationMinutes: 0 }
    ]
  },
  [DailyModeType.NONE]: {
    type: DailyModeType.NONE,
    nameThai: "ยังไม่เลือกโหมด",
    durationMinutes: 0,
    xpReward: 0,
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    quotaPerMonth: 0,
    missions: []
  }
};

export interface Goal {
  id: string;
  title: string;
  category: "Singing" | "Dancing" | "Acting" | "English" | "Exercise" | "Health" | "Confidence" | "Other";
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  notificationShown?: boolean;
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  sleepHours: number;
  waterIntakeMl: number; // in milliliters
  exerciseNotes: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string; // Happy, Tired, Motivated, Nervous, Sad, etc.
  prideText: string; // วันนี้ภูมิใจอะไร
  progressPercent: number; // 0 - 100
  tomorrowPlan: string; // พรุ่งนี้อยากทำอะไร
  createdAt: string;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  modeType: DailyModeType;
  missions: Mission[];
  xpEarned: number;
  completedAt?: string;
  completed: boolean;
}

export type NotificationStatus = "pending" | "sent" | "clicked" | "dismissed" | "expired";

export interface NotificationEventLog {
  id: string;
  time: string;
  title: string;
  category: string;
  message: string;
  soundType: "success" | "complete" | "click" | "warning";
  status: NotificationStatus;
  targetTab?: string;
  duplicateKey?: string;
  targetPage?: string;
  pageName?: string;
  userId?: string;
  createdAt: string;
}

export interface UserProfile {
  nickname: string;
  birthday: string; // YYYY-MM-DD
  age: number;
  level: number;
  xp: number;
  coins?: number; // Coins system: Level * 20 on each level up
  profileFrame?: string;
  profileEffect?: string;
  unlockedFeatures?: string[];
  unlockedThemes?: string[];
  currentStreak: number;
  bestStreak: number;
  lastTrainedDate?: string; // YYYY-MM-DD
  avatarUrl?: string;
  lastStreakSaverMonth?: string; // YYYY-MM format when Save My Streak was used
  lastStreakSaverDate?: string; // YYYY-MM-DD format
  lastVisitedDate?: string; // YYYY-MM-DD format
  lastActiveDaysAgo?: number;
  weeklyReportOpenedWeeks?: Record<string, boolean>; // e.g. { "2026-W30": true }
  monthlyReportOpenedMonths?: Record<string, boolean>; // e.g. { "2026-07": true }
  missionCompleteNotificationShownToday?: string; // YYYY-MM-DD
  extraPracticeMinutesToday?: number; // Bonus minutes bought from Time Shop
  activeBuffs?: {
    expX2Until?: string; // ISO timestamp
    coinsX2Until?: string; // ISO timestamp
    dailyRewardX2?: boolean;
    perfectDayBonus?: boolean;
    weeklyRewardX2?: boolean;
  };
  inventory?: Record<string, number>; // itemId -> count
  trainingAppeals?: TrainingAppeal[];
}

export interface TrainingAppeal {
  id: string;
  date: string;
  modeType: string;
  category: "extra_practice" | "bonus_mission" | "time_override" | "other";
  reasonText: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level === 2) return 150;
  if (level === 3) return 225;
  if (level === 4) return 340;
  if (level === 5) return 510;
  return Math.round(100 * Math.pow(1.5, level - 1));
}

export interface LevelUnlockInfo {
  level: number;
  title: string;
  features: string[];
  coins: number;
  bonusXp?: number;
  bonusCoins?: number;
  specialReward?: string;
  badge?: string;
  frame?: string;
}

export const LEVEL_UNLOCKS: Record<number, LevelUnlockInfo> = {
  1: { level: 1, title: "Beginner Trainee", features: ["Basic Daily Missions", "Streak System"], coins: 20 },
  2: { level: 2, title: "Active Trainee", features: ["📊 Daily Statistics", "📈 Progress Chart"], coins: 40 },
  3: { level: 3, title: "Stylized Artist", features: ["🎭 เปลี่ยน Avatar ได้อิสระ"], coins: 60 },
  4: { level: 4, title: "Colorful Idol", features: ["🎨 เปลี่ยนธีมสี Accent Colors"], coins: 80 },
  5: { level: 5, title: "Rising Star", features: ["🤖 AI Coach Lite", "🎯 Weekly Challenge"], coins: 100, bonusXp: 100, bonusCoins: 150, frame: "Silver Profile Frame" },
  6: { level: 6, title: "Rhythm & Voice Trainee", features: ["🎵 Audio Metronome & Vocal Pitch Warmups"], coins: 120 },
  7: { level: 7, title: "Promising Talent", features: ["🏆 Achievement Showcase"], coins: 140 },
  8: { level: 8, title: "Stage Performer", features: ["🔊 Studio Sound FX Packs"], coins: 160 },
  9: { level: 9, title: "Dedicated Practice", features: ["📁 Performance History Export"], coins: 180 },
  10: { level: 10, title: "Debut Artist", features: ["⚡ Custom Daily Mode", "✏️ Custom Mission"], coins: 200, bonusXp: 200, bonusCoins: 300, badge: "🏅 Top Debutant", specialReward: "✨ Holographic Profile Effect" },
  15: { level: 15, title: "Professional Idol", features: ["📅 Smart Schedule"], coins: 300, bonusXp: 300, bonusCoins: 450, frame: "Ruby Profile Frame" },
  20: { level: 20, title: "Superstar Performer", features: ["📉 Advanced Analytics"], coins: 400, bonusXp: 400, bonusCoins: 600, badge: "🎖️ Pro Artist", specialReward: "💎 Diamond Profile FX" },
  25: { level: 25, title: "Stage Legend", features: ["👑 Exclusive Badge", "🥇 Golden Profile Frame"], coins: 500, bonusXp: 500, bonusCoins: 750, badge: "🏅 Stage Legend", frame: "Golden Profile Frame" },
  30: { level: 30, title: "Master Artist", features: ["🌟 Master Artist Title & Crown"], coins: 600, bonusXp: 600, bonusCoins: 900, badge: "👑 Master Artist" },
  40: { level: 40, title: "Iconic Legend", features: ["🔮 Premium Theme (Cyber Neon & Golden Stage)"], coins: 800, bonusXp: 800, bonusCoins: 1200 },
  50: { level: 50, title: "Legendary Artist", features: ["🌌 Legendary Artist Crown", "🏛️ Immortal Hall of Fame"], coins: 1000, bonusXp: 1000, bonusCoins: 2000, frame: "Legendary Crown Frame" }
};

export interface NotificationSettingItem {
  enabled: boolean;
  time: string; // "HH:MM" format
}

export interface AppSettings {
  notificationsEnabled: boolean;
  theme: "dark"; // Fixed dark theme as per requested style
  targetEndDate: string; // YYYY-MM-DD (target end of year / target artistic showcase)
  quotaExceededWarning: boolean;
  fontScale?: "normal" | "large" | "xlarge"; // Dynamic mobile font sizing support
  
  // Section 8 Notification settings options:
  dailyNotification: NotificationSettingItem;
  waterReminder: NotificationSettingItem;
  healthReminder: NotificationSettingItem;
  timerReminder: NotificationSettingItem;
  missionReminder: NotificationSettingItem;
  achievementNotification: NotificationSettingItem;
  goalNotification: NotificationSettingItem;
  weeklyReport: NotificationSettingItem;
  monthlyReport: NotificationSettingItem;
  countdownNotification: NotificationSettingItem;
  sleepNotification: NotificationSettingItem;
  birthdayNotification: NotificationSettingItem;
  emergencyNotification: NotificationSettingItem;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirementType: "streak" | "hours" | "level" | "no_lazy" | "first_step" | "custom";
  requirementValue: number;
  progressCurrent: number;
  progressTarget: number;
  notificationShown?: boolean;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    title: "FIRST STEP",
    description: "เริ่มต้นเส้นทางศิลปิน โดยเลือกโหมดและบันทึกวันแรก",
    icon: "Footprints",
    unlocked: false,
    requirementType: "first_step",
    requirementValue: 1,
    progressCurrent: 0,
    progressTarget: 1
  },
  {
    id: "exam_warrior",
    title: "EXAM WARRIOR 🏅",
    description: "ใช้ EXAM MODE ติดต่อกันจนจบช่วงสอบ รักษาวินัยการเรียนและการฝึกซ้อมอย่างยอดเยี่ยม",
    icon: "GraduationCap",
    unlocked: false,
    requirementType: "custom",
    requirementValue: 1,
    progressCurrent: 0,
    progressTarget: 1
  },
  {
    id: "7_days_streak",
    title: "7 DAYS STREAK",
    description: "มีวินัยการฝึกติดต่อกันครบ 7 วัน (One Week!)",
    icon: "Flame",
    unlocked: false,
    requirementType: "streak",
    requirementValue: 7,
    progressCurrent: 0,
    progressTarget: 7
  },
  {
    id: "30_days_streak",
    title: "30 DAYS STREAK",
    description: "มุ่งมั่นตั้งใจครบ 30 วันติดต่อกัน (Amazing!)",
    icon: "Award",
    unlocked: false,
    requirementType: "streak",
    requirementValue: 30,
    progressCurrent: 0,
    progressTarget: 30
  },
  {
    id: "no_lazy_month",
    title: "NO LAZY MONTH",
    description: "ฝึกซ้อมอย่างตั้งใจ โดยไม่พึ่งพา Lazy Day ติดต่อกัน 15 วัน",
    icon: "Zap",
    unlocked: false,
    requirementType: "no_lazy",
    requirementValue: 15,
    progressCurrent: 0,
    progressTarget: 15
  },
  {
    id: "100_hours_dance",
    title: "100 HOURS OF DANCE",
    description: "ฝึกเต้นสะสมครบ 100 ชั่วโมง (หรือ 6,000 นาที)",
    icon: "Activity",
    unlocked: false,
    requirementType: "hours",
    requirementValue: 6000, // minutes
    progressCurrent: 0,
    progressTarget: 6000
  },
  {
    id: "100_hours_singing",
    title: "100 HOURS OF SINGING",
    description: "ฝึกร้องเพลงสะสมครบ 100 ชั่วโมง (หรือ 6,000 นาที)",
    icon: "Mic",
    unlocked: false,
    requirementType: "hours",
    requirementValue: 6000, // minutes
    progressCurrent: 0,
    progressTarget: 6000
  },
  {
    id: "super_rookie",
    title: "SUPER ROOKIE",
    description: "บรรลุระดับผู้เริ่มฝึกหัด Level 5 (Artist Trainee)",
    icon: "Sparkles",
    unlocked: false,
    requirementType: "level",
    requirementValue: 5,
    progressCurrent: 1,
    progressTarget: 5
  },
  {
    id: "future_star",
    title: "FUTURE STAR",
    description: "พัฒนาฝีมือจนบรรลุ Level 15 (Performer)",
    icon: "Star",
    unlocked: false,
    requirementType: "level",
    requirementValue: 15,
    progressCurrent: 1,
    progressTarget: 15
  },
  {
    id: "future_artist",
    title: "FUTURE ARTIST",
    description: "ก้าวสู่การเป็นสุดยอดศิลปินอย่างสมบูรณ์แบบ Level 30",
    icon: "Crown",
    unlocked: false,
    requirementType: "level",
    requirementValue: 30,
    progressCurrent: 1,
    progressTarget: 30
  }
];
