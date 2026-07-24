import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export type NotificationPermissionState = "granted" | "denied" | "prompt" | "unsupported";

export interface ScheduledNotificationInfo {
  id: number;
  title: string;
  body: string;
  category: string;
  scheduledTime?: string;
}

export const NOTIFICATION_IDS = {
  DAILY_GOAL: 1001,
  VOCAL_PRACTICE: 1002,
  DANCE_PRACTICE: 1003,
  PENDING_MISSION: 1004,
  TRAINING_LOG: 1005,
  SLEEP_REMINDER: 1006,
  TEST_INSTANT: 9001
};

export const AI_MOTIVATIONAL_QUOTES = [
  "BTS ไม่ได้เดบิวต์เพราะกด Snooze 7 รอบนะ!",
  "AI ตรวจพบว่าคุณกำลังจะขี้เกียจ!",
  "Future You ฝากมาบอกว่า 'ขอบคุณที่ไม่ยอมแพ้'",
  "EXP ของวันนี้ยังเก็บไม่ครบ!",
  "ถ้าเหนื่อยก็พัก แต่ห้ามพักจนลืมเริ่ม",
  "ความฝันของคุณกำลังส่ง Friend Request มาอยู่",
  "ศิลปินในอนาคตถูกสร้างขึ้นจากสิ่งที่คุณทำในวันนี้",
  "ระบบตรวจพบว่าคุณเปิด YouTube มา 47 นาทีแล้ว...",
  "ถ้าความขี้เกียจเป็นกีฬา คุณได้เหรียญทองไปแล้ว!",
  "Skip Day Pass ราคา 5,000,000 Coins พร้อมจ่ายไหม?"
];

export function isNotificationSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== "undefined" && "Notification" in window;
}

export async function checkNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "unsupported";

  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === "granted") return "granted";
      if (status.display === "denied") return "denied";
      return "prompt";
    } else {
      if (typeof Notification === "undefined") return "unsupported";
      const perm = Notification.permission;
      if (perm === "granted") return "granted";
      if (perm === "denied") return "denied";
      return "prompt";
    }
  } catch (err) {
    console.warn("[LocalNotifications] Error checking permissions:", err);
    return "prompt";
  }
}

export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  status: NotificationPermissionState;
}> {
  if (!isNotificationSupported()) {
    return { granted: false, status: "unsupported" };
  }

  try {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === "granted";
      return {
        granted,
        status: granted ? "granted" : "denied"
      };
    } else {
      const perm = await Notification.requestPermission();
      const granted = perm === "granted";
      return {
        granted,
        status: granted ? "granted" : perm === "denied" ? "denied" : "prompt"
      };
    }
  } catch (err) {
    console.error("[LocalNotifications] Error requesting permission:", err);
    return { granted: false, status: "denied" };
  }
}

export async function scheduleLocalNotification(options: {
  id?: number;
  title: string;
  body: string;
  scheduleAt?: Date;
  repeats?: boolean;
  every?: "day" | "week" | "hour";
  category?: string;
  extra?: Record<string, any>;
}): Promise<boolean> {
  const notifId = options.id || Math.floor(Math.random() * 899999) + 100000;
  const targetDate = options.scheduleAt || new Date(Date.now() + 1000);

  try {
    const perm = await checkNotificationPermission();
    if (perm !== "granted") {
      const req = await requestNotificationPermission();
      if (!req.granted) return false;
    }

    if (Capacitor.isNativePlatform()) {
      const notification: LocalNotificationSchema = {
        id: notifId,
        title: options.title,
        body: options.body,
        schedule: {
          at: targetDate,
          repeats: options.repeats || false,
          every: options.every,
          allowWhileIdle: true
        },
        sound: "beep.wav",
        extra: {
          category: options.category || "General",
          ...options.extra
        }
      };

      await LocalNotifications.schedule({
        notifications: [notification]
      });
      return true;
    } else {
      const delayMs = Math.max(0, targetDate.getTime() - Date.now());
      if (delayMs <= 0) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(options.title, { body: options.body });
        }
      } else {
        setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(options.title, { body: options.body });
          }
        }, Math.min(delayMs, 2147483647));
      }
      return true;
    }
  } catch (err) {
    console.error("[LocalNotifications] Schedule failed:", err);
    return false;
  }
}

export async function triggerImmediateNotification(
  title: string,
  body: string,
  category: string = "Daily Training"
): Promise<boolean> {
  return scheduleLocalNotification({
    id: NOTIFICATION_IDS.TEST_INSTANT,
    title,
    body,
    scheduleAt: new Date(Date.now() + 1000),
    category
  });
}

/**
  Schedule comprehensive Future Artist reminders according to School Days, Weekend, Vacation, Exam, Random & Special events.
 */
export async function scheduleAllDailyArtistReminders(isHoliday = false, isExam = false): Promise<number> {
  const perm = await checkNotificationPermission();
  if (perm !== "granted") {
    const res = await requestNotificationPermission();
    if (!res.granted) return 0;
  }

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const createTime = (hour: number, minute: number): Date => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  };

  let scheduleList: { id: number; hour: number; min: number; title: string; body: string; category: string }[] = [];

  if (isExam) {
    // Exam Period Notifications
    scheduleList = [
      { id: 4001, hour: 7, min: 0, title: "Exam Mode Activated!", body: "ทบทวนบทเรียนลุยสอบกันวันนี้!", category: "Exam" },
      { id: 4002, hour: 17, min: 0, title: "Exam Reminder", body: "อ่านหนังสือสอบแล้วหรือยัง?", category: "Exam" },
      { id: 4003, hour: 18, min: 0, title: "Netflix รอได้!", body: "Netflix รอได้ คะแนนสอบรอไม่ได้! ทบทวนบทเรียนกันเถอะ", category: "Exam" },
      { id: 4004, hour: 20, min: 0, title: "Rest Your Eyes", body: "อย่าลืมพักสายตา ดื่มน้ำ และพักผ่อน", category: "Exam" },
      { id: 4005, hour: 21, min: 0, title: "Sleep Early!", body: "นอนได้แล้ว! อย่าอ่านถึงตี 3 พรุ่งนี้สอบ!", category: "Exam" }
    ];
  } else if (isHoliday) {
    // Vacation / Training Camp
    scheduleList = [
      { id: 5001, hour: 8, min: 0, title: "Welcome to Training Camp!", body: "ตื่นมารับพลังวันปิดเทอมกัน!", category: "Holiday" },
      { id: 5002, hour: 9, min: 0, title: "Training Plan", body: "วันนี้จะซ้อมกี่ชั่วโมงดี?", category: "Holiday" },
      { id: 5003, hour: 10, min: 0, title: "Idol Mode Ready!", body: "Idol Mode พร้อมแล้วสำหรับการฝึกซ้อม!", category: "Holiday" },
      { id: 5004, hour: 11, min: 0, title: "Drink Water", body: "ดื่มน้ำ 1 แก้วเติมพลัง", category: "Health" },
      { id: 5005, hour: 12, min: 0, title: "Lunch Break", body: "พักกินข้าวเที่ยงเติมพลังกัน", category: "Holiday" },
      { id: 5006, hour: 13, min: 0, title: "Serious Training", body: "ได้เวลาฝึกอย่างจริงจัง!", category: "Holiday" },
      { id: 5007, hour: 14, min: 0, title: "Trainee Mindset", body: "ถ้าเป็นเด็กฝึกจริง ตอนนี้เขาซ้อมไปแล้วหลายชั่วโมงนะ", category: "Holiday" },
      { id: 5008, hour: 15, min: 0, title: "Water Break", body: "พักดื่มน้ำ 5 นาที", category: "Health" },
      { id: 5009, hour: 16, min: 0, title: "Keep Going!", body: "ฝึกต่อ! ความฝันรออยู่ตรงหน้า", category: "Holiday" },
      { id: 5010, hour: 17, min: 0, title: "Stretch Muscle", body: "อย่าลืมยืดกล้ามเนื้อหลังซ้อม", category: "Health" },
      { id: 5011, hour: 18, min: 0, title: "Mission Check", body: "เช็กภารกิจประจำวัน", category: "Holiday" },
      { id: 5012, hour: 19, min: 0, title: "Extra EXP", body: "ได้เวลาเก็บ EXP เพิ่มเติม!", category: "Holiday" },
      { id: 5013, hour: 20, min: 0, title: "Great Job!", body: "วันนี้ทำได้ดีมาก!", category: "Holiday" },
      { id: 5014, hour: 21, min: 0, title: "Daily Summary", body: "สรุปผลการฝึกของวันนี้", category: "Holiday" },
      { id: 5015, hour: 22, min: 0, title: "Rest Time", body: "เตรียมตัวพักผ่อน ฝันดี!", category: "Health" }
    ];
  } else if (isWeekend) {
    // Weekend Schedule
    scheduleList = [
      { id: 3001, hour: 8, min: 0, title: "Weekend Morning", body: "อรุณสวัสดิ์! วันนี้มีเวลาเก็บ EXP เยอะเลยนะ", category: "Weekend" },
      { id: 3002, hour: 8, min: 30, title: "Drink Water", body: "ดื่มน้ำ 1 แก้ว (+10 HP)", category: "Health" },
      { id: 3003, hour: 9, min: 0, title: "Morning Routine", body: "ไปล้างหน้า แปรงฟันกัน!", category: "Weekend" },
      { id: 3004, hour: 9, min: 30, title: "Training Plan", body: "วางแผนการฝึกของวันนี้", category: "Weekend" },
      { id: 3005, hour: 10, min: 0, title: "Wake Up Alert", body: "ถ้ายังไม่ตื่น ถือว่าอาหารเช้ากลายเป็นอาหารกลางวันแล้ว!", category: "Weekend" },
      { id: 3006, hour: 10, min: 30, title: "Future Artist Waiting", body: "Future Artist กำลังรอคุณอยู่!", category: "Weekend" },
      { id: 3007, hour: 11, min: 0, title: "Lunch Time", body: "กินข้าวกลางวันด้วยนะ อย่าอดอาหาร!", category: "Weekend" },
      { id: 3008, hour: 12, min: 0, title: "Select Daily Mode", body: "เลือกโหมดการฝึกของวันนี้", category: "Weekend" },
      { id: 3009, hour: 13, min: 0, title: "Drink Water", body: "ดื่มน้ำกันหน่อย", category: "Health" },
      { id: 3010, hour: 14, min: 0, title: "Mode Selection", body: "Idol Mode หรือ Superstar Mode ดีนะ?", category: "Weekend" },
      { id: 3011, hour: 15, min: 0, title: "Practice Time", body: "ได้เวลาเริ่มซ้อมแล้ว!", category: "Weekend" },
      { id: 3012, hour: 16, min: 0, title: "Water Break", body: "พักดื่มน้ำ 5 นาที", category: "Health" },
      { id: 3013, hour: 17, min: 0, title: "Skill Check", body: "ซ้อมครบทุกด้านหรือยัง?", category: "Weekend" },
      { id: 3014, hour: 18, min: 0, title: "Stretch Body", body: "อย่าลืมพักและยืดเหยียดร่างกาย", category: "Health" },
      { id: 3015, hour: 19, min: 0, title: "Check Missions", body: "เช็กภารกิจประจำวัน", category: "Weekend" },
      { id: 3016, hour: 20, min: 0, title: "EXP Check", body: "วันนี้ได้ EXP ไปเท่าไหร่แล้ว?", category: "Weekend" },
      { id: 3017, hour: 21, min: 0, title: "Daily Summary", body: "สรุปผลการฝึกของวันนี้", category: "Weekend" },
      { id: 3018, hour: 22, min: 0, title: "Good Night", body: "Good Night! พักผ่อนให้เต็มที่", category: "Health" }
    ];
  } else {
    // School Days (Mon-Fri)
    scheduleList = [
      { id: 2001, hour: 6, min: 0, title: "Wake Up!", body: "ตื่นได้แล้ว! ไอดอลคนอื่นเขาตื่นไปซ้อมกันแล้วนะ", category: "School Day" },
      { id: 2002, hour: 6, min: 5, title: "Don't Lie to Yourself", body: "อีก 5 นาที = อีก 30 นาที อย่าหลอกตัวเอง!", category: "School Day" },
      { id: 2003, hour: 6, min: 15, title: "Get Out of Bed!", body: "ลุกจากเตียงได้แล้ว! เตียงไม่ได้ให้สัญญาเดบิวต์กับเธอ", category: "School Day" },
      { id: 2004, hour: 6, min: 30, title: "Shower Time", body: "ไปอาบน้ำกัน! ศิลปินต้องดูดีตั้งแต่เช้า", category: "School Day" },
      { id: 2005, hour: 6, min: 45, title: "Check Bag", body: "เช็กกระเป๋า! อย่าลืมสมองไว้บนเตียงนะ", category: "School Day" },
      { id: 2006, hour: 7, min: 0, title: "Ready!", body: "Ready! วันนี้ไปเก็บ EXP ที่โรงเรียนกัน", category: "School Day" },
      { id: 2007, hour: 7, min: 10, title: "Drink Water", body: "ดื่มน้ำ 1 แก้ว (+10 HP)", category: "Health" },
      { id: 2008, hour: 7, min: 30, title: "Commute Safe", body: "เดินทางปลอดภัยนะ", category: "School Day" },
      { id: 2009, hour: 8, min: 0, title: "Almost Class", body: "อีก 30 นาทีจะเริ่มเรียนแล้ว!", category: "School Day" },
      { id: 2010, hour: 8, min: 30, title: "Class Started!", body: "เริ่มเรียน! วันนี้เก็บ EXP วิชาการกัน", category: "School Day" },
      { id: 2011, hour: 9, min: 30, title: "Drink Water", body: "ดื่มน้ำหน่อย! สมองจะได้ไม่ทำงานที่ 240p", category: "Health" },
      { id: 2012, hour: 10, min: 30, title: "Hang in there", body: "เหลืออีกนิดเดียวก็พักเที่ยงแล้ว!", category: "School Day" },
      { id: 2013, hour: 11, min: 0, title: "Lunch Break!", body: "พักกลางวัน! อย่ากินแต่ขนมนะ", category: "School Day" },
      { id: 2014, hour: 11, min: 30, title: "Drink Water", body: "ดื่มน้ำหลังอาหารด้วย", category: "Health" },
      { id: 2015, hour: 11, min: 50, title: "Afternoon Class", body: "คาบบ่ายเริ่มแล้ว! อย่าปล่อยให้ความง่วงชนะ", category: "School Day" },
      { id: 2016, hour: 13, min: 0, title: "Hydrate", body: "ดื่มน้ำกันหน่อย", category: "Health" },
      { id: 2017, hour: 14, min: 30, title: "Almost Home", body: "อีกนิดเดียวก็เลิกเรียนแล้ว!", category: "School Day" },
      { id: 2018, hour: 15, min: 10, title: "School Done!", body: "ภารกิจโรงเรียนสำเร็จ! +50 EXP", category: "School Day" },
      { id: 2019, hour: 16, min: 0, title: "Arrived Home?", body: "ถึงบ้านแล้วหรือยัง?", category: "School Day" },
      { id: 2020, hour: 16, min: 30, title: "Daily Mode", body: "ได้เวลาเลือกโหมดประจำวันแล้ว!", category: "School Day" },
      { id: 2021, hour: 17, min: 0, title: "Future Artist", body: "Future Artist กำลังรอคุณอยู่!", category: "Artist Training" },
      { id: 2022, hour: 17, min: 30, title: "Warm Up", body: "วอร์มอัปก่อนซ้อม 20 นาที", category: "Artist Training" },
      { id: 2023, hour: 18, min: 0, title: "Water & Rest", body: "ดื่มน้ำและพัก 5 นาที", category: "Health" },
      { id: 2024, hour: 18, min: 30, title: "Singing Check", body: "ร้องเพลงหรือยัง? ไมค์ถามหาคุณอยู่", category: "Artist Training" },
      { id: 2025, hour: 19, min: 0, title: "Dance Practice", body: "เต้นกัน! ขาซ้ายกับขาขวาพร้อมไหม?", category: "Artist Training" },
      { id: 2026, hour: 19, min: 30, title: "English Vocab", body: "ภาษาอังกฤษวันนี้ได้กี่คำศัพท์แล้ว?", category: "Artist Training" },
      { id: 2027, hour: 20, min: 0, title: "Acting Class", body: "Oscar อาจกำลังรอคุณอยู่! ไปฝึกการแสดงกัน", category: "Artist Training" },
      { id: 2028, hour: 20, min: 30, title: "Drink Water", body: "ดื่มน้ำกัน!", category: "Health" },
      { id: 2029, hour: 21, min: 0, title: "Self Score", body: "วันนี้ให้คะแนนตัวเองกี่คะแนนจาก 10?", category: "Artist Training" },
      { id: 2030, hour: 21, min: 30, title: "Prepare Sleep", body: "เตรียมตัวเข้านอนได้แล้ว", category: "Health" },
      { id: 2031, hour: 21, min: 45, title: "Stop Mobile", body: "เลิกไถมือถือได้แล้ว!", category: "Health" },
      { id: 2032, hour: 22, min: 0, title: "Good Night", body: "Good Night! ศิลปินในอนาคต", category: "Health" }
    ];
  }

  // Random Motivation Notification
  const randomMsg = AI_MOTIVATIONAL_QUOTES[Math.floor(Math.random() * AI_MOTIVATIONAL_QUOTES.length)];
  scheduleList.push({ id: 2999, hour: 14, min: 15, title: "🤖 AI Coach", body: randomMsg, category: "Random Motivation" });

  let count = 0;
  for (const item of scheduleList) {
    const time = createTime(item.hour, item.min);
    const success = await scheduleLocalNotification({
      id: item.id,
      title: item.title,
      body: item.body,
      scheduleAt: time,
      repeats: true,
      every: "day",
      category: item.category
    });
    if (success) count++;
  }

  return count;
}

export async function notifyLevelUp(level: number, titleName: string): Promise<boolean> {
  return scheduleLocalNotification({
    title: `🎉 LEVEL UP! เลเวล ${level} - ${titleName}`,
    body: `ยินดีด้วย! คุณก้าวสู่เลเวล ${level} ในฐานะ ${titleName} แล้ว!`,
    scheduleAt: new Date(Date.now() + 500),
    category: "Achievement"
  });
}

export async function notifyStreakMilestone(days: number): Promise<boolean> {
  return scheduleLocalNotification({
    title: `🔥 STREAK ${days} วันรวด!`,
    body: `สุดยอดมาก! คุณฝึกซ้อมอย่างต่อเนื่องติดต่อกัน ${days} วันแล้ว รับรางวัลพิเศษทันที!`,
    scheduleAt: new Date(Date.now() + 500),
    category: "Achievement"
  });
}

export async function getPendingScheduledNotifications(): Promise<ScheduledNotificationInfo[]> {
  try {
    if (Capacitor.isNativePlatform()) {
      const pending = await LocalNotifications.getPending();
      return pending.notifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        category: (n.extra && n.extra.category) || "Scheduled",
        scheduledTime: n.schedule?.at ? new Date(n.schedule.at).toLocaleString("th-TH") : "ทุกวัน"
      }));
    }
  } catch (err) {
    console.warn("[LocalNotifications] Could not fetch pending list:", err);
  }
  return [];
}

export async function cancelNotificationById(id: number): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      return true;
    }
  } catch (err) {
    console.warn(`[LocalNotifications] Could not cancel notification #${id}:`, err);
  }
  return false;
}

export async function cancelAllLocalNotifications(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
      return true;
    }
  } catch (err) {
    console.warn("[LocalNotifications] Could not cancel all notifications:", err);
  }
  return false;
}
