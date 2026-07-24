import { useState, useEffect, useRef } from "react";
import {
  DailyModeType,
  DAILY_MODES_CONFIG,
  Goal,
  HealthLog,
  DiaryEntry,
  DayProgress,
  UserProfile,
  AppSettings,
  Achievement,
  INITIAL_ACHIEVEMENTS,
  Mission,
  NotificationStatus,
  NotificationEventLog,
  getXpRequiredForLevel,
  LEVEL_UNLOCKS,
  TrainingAppeal
} from "../types";
import { playChime } from "../utils/audio";
import { getDailyResultTier } from "../utils/dailyResult";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { CATEGORY_PAGE_MAP } from "../data/notificationPresets";
import { notifyLevelUp, notifyStreakMilestone, scheduleLocalNotification } from "../services/notification";
import { ShopItem, getFinalItemPrice } from "../data/shopData";

const STORAGE_KEYS = {
  PROFILE: "future_artist_profile",
  SETTINGS: "future_artist_settings",
  HISTORY: "future_artist_history",
  GOALS: "future_artist_goals",
  HEALTH: "future_artist_health",
  DIARY: "future_artist_diary",
  ACHIEVEMENTS: "future_artist_achievements"
};

// Simple date helper
export function getTodayDateString(): string {
  // Return YYYY-MM-DD
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return "Legendary Artist (ตำนานศิลปิน)";
  if (level >= 40) return "Iconic Legend (ไอคอนระดับโลก)";
  if (level >= 30) return "Master Artist (ศิลปินชั้นครู)";
  if (level >= 25) return "Stage Legend (ตํานานเวที)";
  if (level >= 20) return "Superstar (ซูเปอร์สตาร์)";
  if (level >= 15) return "Professional Idol (ไอดอลมืออาชีพ)";
  if (level >= 10) return "Debut Artist (ศิลปินเดบิวต์)";
  if (level >= 7) return "Promising Talent (ดาวเด่นพุ่งแรง)";
  if (level >= 5) return "Artist Trainee (ศิลปินฝึกหัดเข้มข้น)";
  if (level >= 3) return "Stylized Artist (ศิลปินมีสไตล์)";
  if (level >= 2) return "Active Trainee (เด็กฝึกหัวไว)";
  return "Beginner Trainee (ผู้ฝึกหัดเริ่มต้น)";
}

export function useAppState() {
  // --- States ---
  const [userId, setUserId] = useState<string>(() => {
    const saved = localStorage.getItem("future_artist_user_id");
    if (saved) return saved;
    const id = "ARTIST-GLOBAL-ACCOUNT";
    localStorage.setItem("future_artist_user_id", id);
    return id;
  });

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => {
    return localStorage.getItem("future_artist_last_synced") || "";
  });
  const [syncMessage, setSyncMessage] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
    return {
      nickname: "ศิลปินฝึกหัด (Trainee)",
      birthday: "2008-01-01",
      age: 18,
      level: 1,
      xp: 0,
      currentStreak: 0,
      bestStreak: 0
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults = {
      notificationsEnabled: true,
      theme: "dark" as const,
      targetEndDate: "2026-12-31",
      quotaExceededWarning: true,
      fontScale: "normal" as const,
      dailyNotification: { enabled: true, time: "06:00" },
      waterReminder: { enabled: true, time: "08:00" },
      healthReminder: { enabled: true, time: "12:00" },
      timerReminder: { enabled: true, time: "17:00" },
      missionReminder: { enabled: true, time: "19:30" },
      achievementNotification: { enabled: true, time: "20:00" },
      goalNotification: { enabled: true, time: "20:30" },
      weeklyReport: { enabled: true, time: "20:00" },
      monthlyReport: { enabled: true, time: "21:00" },
      countdownNotification: { enabled: true, time: "10:00" },
      sleepNotification: { enabled: true, time: "22:00" },
      birthdayNotification: { enabled: true, time: "09:00" },
      emergencyNotification: { enabled: true, time: "15:00" }
    };
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [history, setHistory] = useState<DayProgress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) return JSON.parse(saved);
    // Seed with empty initial
    return [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HEALTH);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIARY);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) return JSON.parse(saved);
    return INITIAL_ACHIEVEMENTS;
  });

  const isFirstAchievementCheckRef = useRef(true);

  // --- Core Active States ---
  const [selectedModeToday, setSelectedModeToday] = useState<DailyModeType>(DailyModeType.NONE);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);

  // --- Automatic PWA Notifications States ---
  const [notificationLogs, setNotificationLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("future_artist_notification_logs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "log-initial-1",
        time: "06:00 น.",
        category: "แจ้งเตือนประจำวัน",
        message: "Good Morning! วันนี้คุณอยากเป็น Future Artist กี่เปอร์เซ็นต์?",
        soundType: "click"
      },
      {
        id: "log-initial-2",
        time: "06:05 น.",
        category: "แจ้งเตือนประจำวัน",
        message: "ดื่มน้ำ 1 แก้ว และจัดที่นอนให้เรียบร้อย",
        soundType: "success"
      }
    ];
  });

  const [activeExamMode, setActiveExamMode] = useState<boolean>(() => {
    return localStorage.getItem("future_artist_exam_mode") === "true";
  });

  const [activeVacationMode, setActiveVacationMode] = useState<boolean>(() => {
    return localStorage.getItem("future_artist_vacation_mode") === "true";
  });

  const [globalToast, setGlobalToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    category: string;
    soundType: string;
  }>({
    show: false,
    title: "",
    message: "",
    category: "",
    soundType: "success"
  });

  // --- Notifications Helper Functions ---
  const triggerNotification = (
    title: string,
    message: string,
    category: string,
    sound: "success" | "complete" | "click" | "warning" = "success",
    targetPageOverride?: string
  ) => {
    try {
      // 1. Play chime if notificationsEnabled
      if (settings.notificationsEnabled) {
        try {
          playChime(sound);
        } catch (e) {
          console.warn("Could not play chime:", e);
        }
      }

      // 2. Show HTML5 browser notification if allowed
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        settings.notificationsEnabled
      ) {
        try {
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
              if (registration && typeof registration.showNotification === "function") {
                registration.showNotification(`[${category}] ${title}`, {
                  body: message,
                  icon: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png",
                  badge: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png"
                }).catch((err) => {
                  console.warn("SW showNotification error:", err);
                });
              }
            }).catch((err) => {
              console.warn("SW ready error:", err);
            });
          } else {
            try {
              new Notification(`[${category}] ${title}`, {
                body: message,
                icon: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png"
              });
            } catch (err) {
              console.warn("new Notification constructor warning:", err);
            }
          }
        } catch (e) {
          console.warn("Could not fire standard browser notification: ", e);
        }
      }

      // Determine target page and page name from CATEGORY_PAGE_MAP
      const pageMapping = CATEGORY_PAGE_MAP[category] || CATEGORY_PAGE_MAP[title] || { targetPage: "notifications", pageName: "หน้าการแจ้งเตือน" };
      const targetPage = targetPageOverride || pageMapping.targetPage;
      const pageName = pageMapping.pageName;

      // 3. Set global toast state for custom in-app visual popup (Suppress achievement toasts on mobile)
      const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
      const isAchievementCategory = category.includes("เกียรติ") || category.includes("Achievement") || category.includes("ความสำเร็จ");

      if (!isMobile || !isAchievementCategory) {
        setGlobalToast({
          show: true,
          title,
          message,
          category,
          soundType: sound
        });
      }

      // 4. Record log in history list with status tracking & category / target page metadata
      const now = new Date();
      const timeStr = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
      const logId = "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const newLog: NotificationEventLog = {
        id: logId,
        time: timeStr,
        title,
        category,
        message,
        soundType: sound,
        status: "sent",
        targetTab: targetPage,
        targetPage,
        pageName,
        userId,
        createdAt: now.toISOString()
      };

      setNotificationLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep up to 50 logs

      // 5. Instantly persist notification log document into Firebase Firestore under users/{userId}/notifications subcollection
      if (userId) {
        try {
          const notifDocRef = doc(db, "users", userId, "notifications", logId);
          setDoc(notifDocRef, newLog).catch(err => {
            console.warn("Firestore notification subcollection write skipped:", err);
          });
        } catch (e) {
          console.warn("Firestore connection warning:", e);
        }
      }
    } catch (globalErr) {
      console.warn("Global exception inside triggerNotification caught:", globalErr);
    }
  };

  const markLogAsClicked = (logId: string) => {
    setNotificationLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, status: "clicked" as NotificationStatus } : log
    ));
  };

  const markLogAsDismissed = (logId: string) => {
    setNotificationLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, status: "dismissed" as NotificationStatus } : log
    ));
  };

  const clearNotificationLogs = () => {
    setNotificationLogs([]);
  };

  // Mark today as visited to track inactive days for Emergency Notifications
  useEffect(() => {
    const todayStr = getTodayDateString();
    setProfile(prev => {
      if (prev.lastVisitedDate !== todayStr) {
        return { ...prev, lastVisitedDate: todayStr };
      }
      return prev;
    });
  }, []);

  // On mount, synchronize active mode for today from history
  useEffect(() => {
    const todayStr = getTodayDateString();
    const todayProgress = history.find(h => h.date === todayStr);
    if (todayProgress) {
      setSelectedModeToday(todayProgress.modeType);
      setActiveMissions(todayProgress.missions);
    } else {
      setSelectedModeToday(DailyModeType.NONE);
      setActiveMissions([]);
    }
  }, [history]);

  // --- States for 1-Second Real-Time Auto Save ---
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(() => {
    return new Date().toLocaleTimeString("th-TH");
  });
  const [isAutoSaveActive] = useState<boolean>(true);

  // --- Save to localStorage when state changes AND every 1 second continuously ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(healthLogs));
  }, [healthLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem("future_artist_exam_mode", String(activeExamMode));
  }, [activeExamMode]);

  useEffect(() => {
    localStorage.setItem("future_artist_vacation_mode", String(activeVacationMode));
  }, [activeVacationMode]);

  useEffect(() => {
    localStorage.setItem("future_artist_notification_logs", JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  // ⚡ 1-Second Continuous Auto Save Engine
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(healthLogs));
        localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(diaryEntries));
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        localStorage.setItem("future_artist_exam_mode", String(activeExamMode));
        localStorage.setItem("future_artist_vacation_mode", String(activeVacationMode));
        localStorage.setItem("future_artist_notification_logs", JSON.stringify(notificationLogs));
        localStorage.setItem("future_artist_last_auto_save_ts", new Date().toISOString());

        const nowStr = new Date().toLocaleTimeString("th-TH");
        setLastAutoSaveTime(nowStr);
      } catch (err) {
        console.warn("Realtime auto save error:", err);
      }
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [profile, settings, history, goals, healthLogs, diaryEntries, achievements, activeExamMode, activeVacationMode, notificationLogs]);

  const isCloudLoadedRef = useRef<boolean>(false);
  const isRemoteUpdateRef = useRef<boolean>(false);
  const lastSavedHashRef = useRef<string>("");

  // Real-time Firestore document listener across all devices
  useEffect(() => {
    if (!userId) return;
    setIsInitialLoading(true);
    setSyncStatus("syncing");
    setSyncMessage("กำลังเชื่อมต่อฐานข้อมูลส่วนกลาง...");

    const docRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        // Skip local snapshot writes to avoid infinite echo loops
        if (docSnap.metadata.hasPendingWrites) {
          return;
        }

        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          isRemoteUpdateRef.current = true;

          // 1. Profile - Intelligent Merge (Preserve local progression if higher)
          if (cloudData.profile) {
            setProfile(prev => {
              const cloudProf = cloudData.profile;
              const cloudLevel = Number(cloudProf.level) || 1;
              const localLevel = Number(prev.level) || 1;
              const maxLevel = Math.max(localLevel, cloudLevel);

              let mergedXp = prev.xp || 0;
              if (cloudLevel > localLevel) {
                mergedXp = cloudProf.xp || 0;
              } else if (cloudLevel === localLevel) {
                mergedXp = Math.max(prev.xp || 0, cloudProf.xp || 0);
              }

              const mergedCoins = cloudProf.coins !== undefined ? cloudProf.coins : (prev.coins ?? 0);
              const mergedCurrentStreak = Math.max(prev.currentStreak ?? 0, cloudProf.currentStreak ?? 0);
              const mergedBestStreak = Math.max(prev.bestStreak ?? 0, cloudProf.bestStreak ?? 0);

              const mergedProfile = {
                ...prev,
                ...cloudProf,
                level: maxLevel,
                xp: mergedXp,
                coins: mergedCoins,
                currentStreak: mergedCurrentStreak,
                bestStreak: mergedBestStreak,
                inventory: cloudProf.inventory || prev.inventory || {},
                activeBuffs: cloudProf.activeBuffs || prev.activeBuffs || {},
                extraPracticeMinutesToday: cloudProf.extraPracticeMinutesToday !== undefined ? cloudProf.extraPracticeMinutesToday : (prev.extraPracticeMinutesToday || 0),
                lastTrainedDate: cloudProf.lastTrainedDate || prev.lastTrainedDate
              };

              try {
                localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(mergedProfile));
              } catch (_) {}

              return mergedProfile;
            });
          }

          // 2. History - Intelligent Union Merge by Date
          if (Array.isArray(cloudData.history)) {
            setHistory(prev => {
              const historyMap = new Map<string, DayProgress>();
              prev.forEach(item => {
                if (item && item.date) {
                  historyMap.set(item.date, item);
                }
              });
              cloudData.history.forEach((cloudItem: DayProgress) => {
                if (!cloudItem || !cloudItem.date) return;
                const existing = historyMap.get(cloudItem.date);
                if (!existing) {
                  historyMap.set(cloudItem.date, cloudItem);
                } else {
                  if (cloudItem.completed && !existing.completed) {
                    historyMap.set(cloudItem.date, cloudItem);
                  } else if ((cloudItem.xpEarned || 0) > (existing.xpEarned || 0)) {
                    historyMap.set(cloudItem.date, cloudItem);
                  } else if (existing.modeType === DailyModeType.NONE && cloudItem.modeType !== DailyModeType.NONE) {
                    historyMap.set(cloudItem.date, cloudItem);
                  }
                }
              });
              const mergedHistory = Array.from(historyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
              try {
                localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mergedHistory));
              } catch (_) {}
              return mergedHistory;
            });
          }

          // 3. Goals - Merge by ID
          if (Array.isArray(cloudData.goals)) {
            setGoals(prev => {
              const map = new Map<string, Goal>();
              prev.forEach(g => map.set(g.id, g));
              cloudData.goals.forEach((cg: Goal) => {
                if (!map.has(cg.id)) map.set(cg.id, cg);
                else {
                  const local = map.get(cg.id)!;
                  if (cg.completed && !local.completed) map.set(cg.id, cg);
                  else if (cg.currentValue > local.currentValue) map.set(cg.id, cg);
                }
              });
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(merged)); } catch (_) {}
              return merged;
            });
          }

          // 4. HealthLogs - Merge by Date
          if (Array.isArray(cloudData.healthLogs)) {
            setHealthLogs(prev => {
              const map = new Map<string, HealthLog>();
              prev.forEach(h => map.set(h.date, h));
              cloudData.healthLogs.forEach((ch: HealthLog) => {
                if (!map.has(ch.date)) map.set(ch.date, ch);
              });
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(merged)); } catch (_) {}
              return merged;
            });
          }

          // 5. DiaryEntries - Merge by ID
          if (Array.isArray(cloudData.diaryEntries)) {
            setDiaryEntries(prev => {
              const map = new Map<string, DiaryEntry>();
              prev.forEach(d => map.set(d.id, d));
              cloudData.diaryEntries.forEach((cd: DiaryEntry) => {
                if (!map.has(cd.id)) map.set(cd.id, cd);
              });
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(merged)); } catch (_) {}
              return merged;
            });
          }

          // 6. Achievements - Merge by ID
          if (Array.isArray(cloudData.achievements)) {
            setAchievements(prev => {
              const map = new Map<string, Achievement>();
              prev.forEach(a => map.set(a.id, a));
              cloudData.achievements.forEach((ca: Achievement) => {
                const local = map.get(ca.id);
                if (!local) map.set(ca.id, ca);
                else {
                  const unlocked = local.unlocked || ca.unlocked;
                  const progressCurrent = Math.max(local.progressCurrent || 0, ca.progressCurrent || 0);
                  map.set(ca.id, { ...local, ...ca, unlocked, progressCurrent });
                }
              });
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(merged)); } catch (_) {}
              return merged;
            });
          }

          // 7. Settings & Notification Logs
          if (cloudData.settings) {
            setSettings(prev => ({ ...prev, ...cloudData.settings }));
          }
          if (Array.isArray(cloudData.notificationLogs)) {
            setNotificationLogs(cloudData.notificationLogs);
          }

          // Keep hash of cloud snapshot to prevent echo sync
          const cloudPayloadString = JSON.stringify({
            profile: cloudData.profile,
            settings: cloudData.settings,
            history: cloudData.history,
            goals: cloudData.goals,
            healthLogs: cloudData.healthLogs,
            diaryEntries: cloudData.diaryEntries,
            achievements: cloudData.achievements,
            notificationLogs: cloudData.notificationLogs
          });
          lastSavedHashRef.current = cloudPayloadString;

          const nowStr = new Date().toLocaleTimeString("th-TH");
          setLastSyncedAt(nowStr);
          localStorage.setItem("future_artist_last_synced", nowStr);
          setSyncStatus("success");
          setSyncMessage("เชื่อมต่อฐานข้อมูลส่วนกลางเรียบร้อย (ทุกอุปกรณ์ใช้ชุดเดียวกัน)");
        } else {
          // Document does not exist yet
          const initialPayload = {
            profile,
            settings,
            history,
            goals,
            healthLogs,
            diaryEntries,
            achievements,
            notificationLogs,
            updatedAt: new Date().toISOString()
          };
          setDoc(docRef, initialPayload).catch(err => {
            console.warn("Error creating initial cloud database document:", err);
          });
          const nowStr = new Date().toLocaleTimeString("th-TH");
          setLastSyncedAt(nowStr);
          localStorage.setItem("future_artist_last_synced", nowStr);
          setSyncStatus("success");
          setSyncMessage("สร้างและเชื่อมต่อฐานข้อมูลส่วนกลางใหม่เรียบร้อย");
        }

        isCloudLoadedRef.current = true;
        setIsInitialLoading(false);
      },
      (err) => {
        console.warn("Firestore real-time listener warning (Offline fallback active): ", err);
        setSyncStatus("error");
        setSyncMessage("เชื่อมต่อฐานข้อมูลส่วนกลางไม่ได้ (กำลังใช้โหมดออฟไลน์)");
        isCloudLoadedRef.current = true;
        setIsInitialLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Auto upload to Firestore when coming back online
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored. Syncing local changes to Firestore...");
      triggerManualSync();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [profile, settings, history, goals, healthLogs, diaryEntries, achievements, notificationLogs]);

  // Debounced push to cloud when state changes (safely guarded by isCloudLoadedRef)
  useEffect(() => {
    if (!isCloudLoadedRef.current) return;

    // Skip if state was updated from remote Firestore
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const currentPayload = {
      profile,
      settings,
      history,
      goals,
      healthLogs,
      diaryEntries,
      achievements,
      notificationLogs
    };

    const currentHash = JSON.stringify(currentPayload);

    // Skip push if nothing actually changed
    if (currentHash === lastSavedHashRef.current) {
      setSyncStatus("success");
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("กำลังบันทึกลงฐานข้อมูลส่วนกลาง...");

    const delayDebounce = setTimeout(async () => {
      try {
        const docRef = doc(db, "users", userId);
        const payload = {
          ...currentPayload,
          updatedAt: new Date().toISOString()
        };
        lastSavedHashRef.current = currentHash;
        await setDoc(docRef, payload);
        const nowStr = new Date().toLocaleTimeString("th-TH");
        setLastSyncedAt(nowStr);
        localStorage.setItem("future_artist_last_synced", nowStr);
        setSyncStatus("success");
        setSyncMessage("ซิงค์ข้อมูลคลาวด์สำเร็จ");
      } catch (err) {
        setSyncStatus("error");
        setSyncMessage("ซิงค์ข้อมูลไม่สำเร็จ (บันทึกในเครื่องชั่วคราว)");
        try {
          handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
        } catch (_) {}
      }
    }, 2500);

    return () => clearTimeout(delayDebounce);
  }, [profile, settings, history, goals, healthLogs, diaryEntries, achievements, notificationLogs, userId]);

  const importDataFromCloud = async (targetKey: string): Promise<boolean> => {
    if (!targetKey || !targetKey.trim()) {
      alert("กรุณากรอกรหัส Sync Key");
      return false;
    }
    
    const formattedKey = targetKey.trim().toUpperCase();
    setSyncStatus("syncing");
    setSyncMessage(`กำลังนำเข้าข้อมูลจากรหัส ${formattedKey}...`);
    
    try {
      const docRef = doc(db, "users", formattedKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData.profile) setProfile(cloudData.profile);
        if (cloudData.settings) setSettings(cloudData.settings);
        if (cloudData.history) setHistory(cloudData.history);
        if (cloudData.goals) setGoals(cloudData.goals);
        if (cloudData.healthLogs) setHealthLogs(cloudData.healthLogs);
        if (cloudData.diaryEntries) setDiaryEntries(cloudData.diaryEntries);
        if (cloudData.achievements) setAchievements(cloudData.achievements);
        
        setUserId(formattedKey);
        localStorage.setItem("future_artist_user_id", formattedKey);
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncedAt(nowStr);
        localStorage.setItem("future_artist_last_synced", nowStr);
        
        setSyncStatus("success");
        setSyncMessage("ดึงข้อมูลและเปลี่ยนรหัส Sync Key สำเร็จ!");
        playChime("success");
        return true;
      } else {
        alert(`ไม่พบข้อมูลสำหรับรหัส Sync Key: ${formattedKey}`);
        setSyncStatus("error");
        setSyncMessage("ไม่พบข้อมูลบนคลาวด์");
        return false;
      }
    } catch (err) {
      console.error("Error importing data: ", err);
      alert("ไม่สามารถเชื่อมต่อคลาวด์ได้ในขณะนี้");
      setSyncStatus("error");
      setSyncMessage("การดึงข้อมูลผิดพลาด");
      return false;
    }
  };

  const triggerManualSync = async () => {
    setSyncStatus("syncing");
    setSyncMessage("กำลังซิงค์ข้อมูลด้วยตนเอง...");
    try {
      const docRef = doc(db, "users", userId);
      const payload = {
        profile,
        settings,
        history,
        goals,
        healthLogs,
        diaryEntries,
        achievements,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload);
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedAt(nowStr);
      localStorage.setItem("future_artist_last_synced", nowStr);
      setSyncStatus("success");
      setSyncMessage("ซิงค์ข้อมูลคลาวด์สำเร็จ");
      playChime("complete");
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage("ซิงค์ข้อมูลล้มเหลว");
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      } catch (_) {}
    }
  };

  const reloadAppAndFetchData = async () => {
    setSyncStatus("syncing");
    setSyncMessage("กำลังดึงข้อมูลล่าสุดจากฐานข้อมูลส่วนกลางและรีเฟรชแอป...");
    playChime("click");
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData.profile) {
          setProfile(cloudData.profile);
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(cloudData.profile));
        }
        if (cloudData.settings) {
          setSettings(cloudData.settings);
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudData.settings));
        }
        if (cloudData.history) {
          setHistory(cloudData.history);
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(cloudData.history));
        }
        if (cloudData.goals) {
          setGoals(cloudData.goals);
          localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(cloudData.goals));
        }
        if (cloudData.healthLogs) {
          setHealthLogs(cloudData.healthLogs);
          localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(cloudData.healthLogs));
        }
        if (cloudData.diaryEntries) {
          setDiaryEntries(cloudData.diaryEntries);
          localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(cloudData.diaryEntries));
        }
        if (cloudData.achievements) {
          setAchievements(cloudData.achievements);
          localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(cloudData.achievements));
        }
      }
    } catch (e) {
      console.warn("Error fetching data on app reload:", e);
    }

    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  // --- Helper calculations ---

  // Quota Counter for current month
  const getQuotaCounts = () => {
    const d = new Date();
    const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    
    // Initial quota counts
    const counts: Record<DailyModeType, number> = {
      [DailyModeType.FREE_DAY]: 0,
      [DailyModeType.NORMAL_DAY]: 0,
      [DailyModeType.STUDY_DAY]: 0,
      [DailyModeType.ACTIVITY_DAY]: 0,
      [DailyModeType.LAZY_DAY]: 0,
      [DailyModeType.NO_TIME_DAY]: 0,
      [DailyModeType.EXAM_MODE]: 0,
      [DailyModeType.SICK_MODE]: 0,
      [DailyModeType.NONE]: 0
    };

    history.forEach(item => {
      if (item && item.date && item.date.startsWith(currentMonthStr) && item.modeType !== DailyModeType.NONE) {
        counts[item.modeType] = (counts[item.modeType] || 0) + 1;
      }
    });

    return counts;
  };

  // Total All-Time Usage Counter across all history
  const getTotalModeUsageCounts = () => {
    const counts: Record<DailyModeType, number> = {
      [DailyModeType.FREE_DAY]: 0,
      [DailyModeType.NORMAL_DAY]: 0,
      [DailyModeType.STUDY_DAY]: 0,
      [DailyModeType.ACTIVITY_DAY]: 0,
      [DailyModeType.LAZY_DAY]: 0,
      [DailyModeType.NO_TIME_DAY]: 0,
      [DailyModeType.EXAM_MODE]: 0,
      [DailyModeType.SICK_MODE]: 0,
      [DailyModeType.NONE]: 0
    };

    history.forEach(item => {
      if (item && item.modeType && item.modeType !== DailyModeType.NONE) {
        counts[item.modeType] = (counts[item.modeType] || 0) + 1;
      }
    });

    return counts;
  };

  // Check if lazy day has been used consecutively for more than 2 days
  const checkConsecutiveLazyDays = (): boolean => {
    // Sort history by date descending
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const h of sorted) {
      if (h.modeType === DailyModeType.LAZY_DAY) {
        count++;
      } else if (h.modeType === DailyModeType.NONE) {
        continue;
      } else {
        break; // stop when we see any non-lazy day
      }
    }
    return count >= 2;
  };

  // Select today's daily mode
  const selectDailyMode = (modeType: DailyModeType) => {
    const todayStr = getTodayDateString();
    
    // Check if quota exceeded for the month
    const quotas = getQuotaCounts();
    const config = DAILY_MODES_CONFIG[modeType];
    
    if (modeType !== DailyModeType.NONE && config.quotaPerMonth > 0) {
      if (quotas[modeType] >= config.quotaPerMonth) {
        alert(`โควตาสำหรับโหมด ${config.nameThai} ในเดือนนี้หมดลงแล้ว!`);
        return false;
      }
    }

    // Set missions
    const newMissions: Mission[] = config.missions.map(m => ({
      ...m,
      completed: false
    }));

    // Update history
    setHistory(prev => {
      const idx = prev.findIndex(p => p.date === todayStr);
      const entry: DayProgress = {
        date: todayStr,
        modeType,
        missions: newMissions,
        xpEarned: 0,
        completed: false
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      } else {
        return [...prev, entry];
      }
    });

    setSelectedModeToday(modeType);
    setActiveMissions(newMissions);
    playChime("click");
    return true;
  };

  // Complete a mission in the active list
  const toggleMissionComplete = (missionId: string) => {
    const todayStr = getTodayDateString();
    
    setActiveMissions(prev => {
      const updated = prev.map(m => m.id === missionId ? { ...m, completed: !m.completed } : m);
      
      // Update in history as well
      setHistory(hPrev => {
        const hIdx = hPrev.findIndex(p => p.date === todayStr);
        if (hIdx >= 0) {
          const hUpdated = [...hPrev];
          const item = hUpdated[hIdx];
          
          if (item.modeType !== DailyModeType.NONE) {
            const totalMissions = item.missions.length;
            const config = DAILY_MODES_CONFIG[item.modeType];
            const maxDayXp = config.xpReward;
            
            // Count completed missions in the updated list
            const completedCount = updated.filter(m => m.completed).length;
            const allCompleted = completedCount === totalMissions;
            const completionPercent = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
            const tier = getDailyResultTier(completionPercent);
            
            // Proportional XP calculation (Spec #4)
            const newXpEarned = totalMissions > 0 ? Math.round((completedCount / totalMissions) * maxDayXp) : 0;
            const xpDifference = newXpEarned - item.xpEarned;

            hUpdated[hIdx] = {
              ...item,
              missions: updated,
              completed: allCompleted,
              xpEarned: newXpEarned
            };

            // Award or adjust XP based on difference
            if (xpDifference !== 0) {
              setTimeout(() => {
                awardXP(xpDifference);
              }, 50);
            }

            // Award Coins when completing a mission (Hard Earned Rate: 3 Coins per mission, +10 Coins for 100% completion)
            const missionObj = updated.find(m => m.id === missionId);
            if (missionObj?.completed) {
              setProfile(p => {
                let coinReward = 3; // base per mission (HARD RATE)
                const nowIso = new Date().toISOString();
                let multiplier = 1;

                if (p.activeBuffs?.coinsX2Until && p.activeBuffs.coinsX2Until > nowIso) {
                  multiplier *= 2;
                }
                if (p.activeBuffs?.dailyRewardX2) {
                  multiplier *= 2;
                }

                coinReward *= multiplier;

                if (allCompleted) {
                  let bonus100 = 10 * multiplier;
                  if (p.activeBuffs?.perfectDayBonus) bonus100 += 15;
                  coinReward += bonus100;
                }

                return {
                  ...p,
                  coins: (p.coins ?? 0) + coinReward
                };
              });
            }

            // At least 1 mission completed = Daily Streak +1! (Spec #3 & #5)
            if (completedCount >= 1) {
              setTimeout(() => {
                updateStreaksOnCompletion();
              }, 60);
            }

            // Trigger notification whenever mission is completed
            if (missionObj?.completed) {
              setTimeout(() => {
                const title = `${config.nameThai.split(" ")[0]} • ${completionPercent}% Complete!`;
                const message = `${tier.title}\nวันนี้คุณทำสำเร็จ ${completedCount} จาก ${totalMissions} ภารกิจแล้ว\n+${newXpEarned} XP • +1 Daily Streak\n${tier.positiveQuote}`;
                
                triggerNotification(
                  title,
                  message,
                  "ความคืบหน้าภารกิจ",
                  completionPercent === 100 ? "complete" : "success"
                );
                triggerServerPush(
                  title,
                  message,
                  "/?tab=dashboard",
                  "ความคืบหน้าภารกิจ",
                  `mission-${todayStr}`
                );
                playChime(completionPercent === 100 ? "complete" : "click");
              }, 70);
            }
          }
          
          return hUpdated;
        }
        return hPrev;
      });

      return updated;
    });
  };

  // Complete all remaining missions today instantly
  const completeAllMissionsToday = () => {
    const todayStr = getTodayDateString();
    setActiveMissions(prev => {
      const updated = prev.map(m => ({ ...m, completed: true }));
      
      setHistory(hPrev => {
        const hIdx = hPrev.findIndex(p => p.date === todayStr);
        if (hIdx >= 0) {
          const hUpdated = [...hPrev];
          const item = hUpdated[hIdx];
          const config = DAILY_MODES_CONFIG[item.modeType];
          const maxDayXp = config.xpReward;

          hUpdated[hIdx] = {
            ...item,
            missions: updated,
            completed: true,
            xpEarned: maxDayXp
          };

          setTimeout(() => {
            awardXP(maxDayXp - item.xpEarned);
            updateStreaksOnCompletion();

            const title = `${config.nameThai.split(" ")[0]} • 100% Complete!`;
            const message = `PERFECT!\nวันนี้คุณทำสำเร็จ ${updated.length} จาก ${updated.length} ภารกิจแล้ว\n+${maxDayXp} XP • +1 Daily Streak\nสุดยอดสมบูรณ์แบบ! วันนี้คุณทำลายขีดจำกัดตัวเองได้ 100%!`;

            triggerNotification(
              title,
              message,
              "ความคืบหน้าภารกิจ",
              "complete"
            );
            triggerServerPush(
              title,
              message,
              "/?tab=dashboard",
              "ความคืบหน้าภารกิจ",
              `mission-${todayStr}`
            );
            playChime("complete");
          }, 50);

          return hUpdated;
        }
        return hPrev;
      });

      return updated;
    });
  };

  // Save My Streak System (Spec #6)
  const saveMyStreak = (): { success: boolean; message: string } => {
    const todayStr = getTodayDateString();
    const d = new Date();
    const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

    // Condition 1: Check if already used this month
    if (profile.lastStreakSaverMonth === currentMonthStr) {
      return {
        success: false,
        message: "คุณใช้สิทธิ์ Save My Streak ของเดือนนี้ไปแล้ว (ใช้ได้เดือนละ 1 ครั้ง)"
      };
    }

    // Condition 2: Check if user completed any missions today
    const todayHistory = history.find(h => h.date === todayStr);
    const completedCount = todayHistory ? todayHistory.missions.filter(m => m.completed).length : 0;

    if (completedCount > 0) {
      return {
        success: false,
        message: "คุณทำภารกิจสำเร็จในวันนี้แล้ว ไม่จำเป็นต้องใช้ Save My Streak"
      };
    }

    // Activate Save My Streak: Preserve streak count without XP
    setProfile(p => {
      const preservedStreak = Math.max(1, p.currentStreak);
      return {
        ...p,
        currentStreak: preservedStreak,
        lastStreakSaverMonth: currentMonthStr,
        lastStreakSaverDate: todayStr
      };
    });

    playChime("success");

    triggerNotification(
      "Save My Streak Activated! 🛡️",
      "Streak ของคุณได้รับการรักษาแล้ว (ไม่ได้รับ XP)",
      "รักษา Streak",
      "success"
    );

    return {
      success: true,
      message: "Save My Streak Activated! Streak ของคุณได้รับการรักษาแล้ว"
    };
  };

  // --- Level Up Modal Celebration State ---
  const [levelUpModalData, setLevelUpModalData] = useState<{
    show: boolean;
    oldLevel: number;
    newLevel: number;
    totalCoinsEarned: number;
    bonusXpEarned: number;
    unlockedFeatures: string[];
    badgeEarned?: string;
    frameEarned?: string;
  }>({
    show: false,
    oldLevel: 1,
    newLevel: 1,
    totalCoinsEarned: 0,
    bonusXpEarned: 0,
    unlockedFeatures: []
  });

  const closeLevelUpModal = () => {
    setLevelUpModalData(prev => ({ ...prev, show: false }));
  };

  // Helper to award XP and handle level ups (supports negative adjustments)
  const awardXP = (amount: number) => {
    if (amount === 0) return;
    setProfile(p => {
      let currentXp = p.xp + amount;
      let level = p.level;
      const oldLevel = p.level;
      let coins = p.coins ?? 100;
      let totalCoinsEarned = 0;
      let totalBonusXpEarned = 0;
      const unlockedFeaturesAcc: string[] = [];
      let badgeEarned = "";
      let frameEarned = "";

      if (amount > 0) {
        let requiredXp = getXpRequiredForLevel(level);
        while (currentXp >= requiredXp) {
          currentXp -= requiredXp;
          level += 1;
          requiredXp = getXpRequiredForLevel(level);

          // Coins reward = Level * 20
          const coinsThisLevel = level * 20;
          totalCoinsEarned += coinsThisLevel;
          coins += coinsThisLevel;

          // Check level unlock info
          const unlockInfo = LEVEL_UNLOCKS[level];
          if (unlockInfo) {
            unlockedFeaturesAcc.push(...unlockInfo.features);
            if (unlockInfo.badge) badgeEarned = unlockInfo.badge;
            if (unlockInfo.frame) frameEarned = unlockInfo.frame;
          } else {
            unlockedFeaturesAcc.push(`✨ ยกระดับทักษะศิลปิน Level ${level}`);
          }

          // Bonus every 5 levels
          if (level % 5 === 0) {
            const bx = level * 20;
            const bc = level * 50;
            totalBonusXpEarned += bx;
            totalCoinsEarned += bc;
            coins += bc;
            unlockedFeaturesAcc.push(`🎁 Bonus L${level}: +${bx} XP, +${bc} Coins!`);
          }

          // Bonus every 10 levels
          if (level % 10 === 0) {
            unlockedFeaturesAcc.push(`🏆 Milestone L${level}: Special Badge & Profile Effects`);
          }
        }

        if (level > oldLevel) {
          setTimeout(() => {
            setLevelUpModalData({
              show: true,
              oldLevel,
              newLevel: level,
              totalCoinsEarned,
              bonusXpEarned: totalBonusXpEarned,
              unlockedFeatures: unlockedFeaturesAcc,
              badgeEarned,
              frameEarned
            });
            triggerNotification(
              `🎉 LEVEL UP! Level ${level}`,
              `ยินดีด้วย! คุณอัปเลเวลเป็น Level ${level} (${getLevelTitle(level)})\nปลดล็อกฟีเจอร์ใหม่ & รับ +${totalCoinsEarned} Coins 🪙!`,
              "ระบบเลเวล",
              "complete"
            );
            playChime("complete");
          }, 100);
        }
      } else {
        // Subtraction
        while (currentXp < 0 && level > 1) {
          level -= 1;
          const prevReq = getXpRequiredForLevel(level);
          currentXp += prevReq;
        }
        if (currentXp < 0) currentXp = 0;
      }

      return {
        ...p,
        level,
        xp: currentXp,
        coins,
        profileFrame: frameEarned || p.profileFrame
      };
    });
  };

  // Update streaks when today's tasks are completed
  const updateStreaksOnCompletion = () => {
    const todayStr = getTodayDateString();
    
    setProfile(p => {
      if (p.lastTrainedDate === todayStr) {
        // already trained today, no change to streak
        return p;
      }

      const lastDate = p.lastTrainedDate;
      let streak = p.currentStreak;

      if (!lastDate) {
        // first training ever
        streak = 1;
      } else {
        const todayObj = new Date(todayStr);
        const lastObj = new Date(lastDate);
        const diffTime = Math.abs(todayObj.getTime() - lastObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          // consecutive day!
          streak += 1;
        } else {
          // broke streak, reset
          streak = 1;
        }
      }

      const best = Math.max(p.bestStreak, streak);
      return {
        ...p,
        currentStreak: streak,
        bestStreak: best,
        lastTrainedDate: todayStr
      };
    });
  };

  // --- Shop & Coin System Logic ---
  const getMissedDaysStraight = (): number => {
    const todayStr = getTodayDateString();
    const lastDate = profile.lastTrainedDate;
    if (!lastDate) return 0;
    const todayObj = new Date(todayStr);
    const lastObj = new Date(lastDate);
    const diffTime = todayObj.getTime() - lastObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 0;
    return diffDays - 1;
  };

  const isHardWorkerToday = (): boolean => {
    const todayStr = getTodayDateString();
    const todayProgress = history.find(h => h.date === todayStr);
    if (!todayProgress || todayProgress.modeType === DailyModeType.NONE) return false;
    return todayProgress.completed || (todayProgress.missions.length > 0 && todayProgress.missions.every(m => m.completed));
  };

  const buyShopItem = (item: ShopItem): { success: boolean; message: string } => {
    const hardWorker = isHardWorkerToday();
    const missedDays = getMissedDaysStraight();
    const { finalPrice, discountPercent, penaltyMultiplier } = getFinalItemPrice(item, hardWorker, missedDays);

    const currentCoins = profile.coins ?? 0;
    if (currentCoins < finalPrice) {
      playChime("warning");
      return {
        success: false,
        message: `Coins ไม่พอ! คุณมี ${currentCoins.toLocaleString()} Coins แต่ต้องการ ${finalPrice.toLocaleString()} Coins`
      };
    }

    setProfile(p => {
      const nextCoins = (p.coins ?? 0) - finalPrice;
      const inv = { ...(p.inventory || {}) };
      const buffs = { ...(p.activeBuffs || {}) };
      let extraMins = p.extraPracticeMinutesToday || 0;

      if (item.category === "time") {
        extraMins += (item.minutesValue || 0);
      } else if (item.id === "reduce-skip-today") {
        setTimeout(() => {
          completeAllMissionsToday();
        }, 100);
      } else if (item.category === ("reduce-time" as any) || item.id.startsWith("reduce-")) {
        extraMins = Math.max(0, extraMins + (item.minutesValue || 0));
      } else if (item.category === "buff") {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        if (item.id === "buff-expx2") buffs.expX2Until = oneHourLater;
        if (item.id === "buff-coinsx2") buffs.coinsX2Until = oneHourLater;
        if (item.id === "buff-dailyx2") buffs.dailyRewardX2 = true;
        if (item.id === "buff-perfectday") buffs.perfectDayBonus = true;
        if (item.id === "buff-weeklyx2") buffs.weeklyRewardX2 = true;
      } else {
        inv[item.id] = (inv[item.id] || 0) + 1;
      }

      return {
        ...p,
        coins: nextCoins,
        inventory: inv,
        activeBuffs: buffs,
        extraPracticeMinutesToday: extraMins
      };
    });

    playChime("complete");
    triggerNotification(
      `🛒 ซื้อ ${item.name} สำเร็จ!`,
      `จ่าย ${finalPrice.toLocaleString()} Coins ${discountPercent > 0 ? `(ลด 20% Hard Worker Discount!)` : ""}${penaltyMultiplier > 1 ? `(มีค่าปรับความขี้เกียจ x${penaltyMultiplier})` : ""}`,
      "ร้านค้า",
      "complete"
    );

    return {
      success: true,
      message: `ซื้อ ${item.name} สำเร็จแล้ว!`
    };
  };

  const openMysteryBox = (boxId: string): { success: boolean; rewardTitle: string; rewardDesc: string } => {
    const count = profile.inventory?.[boxId] || 0;
    if (count <= 0) {
      return { success: false, rewardTitle: "ไม่มีกล่องสุ่ม", rewardDesc: "คุณยังไม่มีกล่องสุ่มนี้ในช่องเก็บของ" };
    }

    setProfile(p => ({
      ...p,
      inventory: {
        ...(p.inventory || {}),
        [boxId]: Math.max(0, (p.inventory?.[boxId] || 1) - 1)
      }
    }));

    let rewardCoins = 0;
    let rewardXp = 0;
    let specialRewardText = "";

    if (boxId === "box-common") {
      rewardCoins = Math.floor(Math.random() * 900) + 100;
      rewardXp = Math.floor(Math.random() * 50) + 10;
    } else if (boxId === "box-rare") {
      rewardCoins = Math.floor(Math.random() * 14000) + 1000;
      rewardXp = Math.floor(Math.random() * 150) + 50;
    } else if (boxId === "box-epic") {
      rewardCoins = Math.floor(Math.random() * 90000) + 10000;
      rewardXp = Math.floor(Math.random() * 500) + 100;
    } else if (boxId === "box-legendary") {
      rewardCoins = Math.floor(Math.random() * 450000) + 50000;
      rewardXp = Math.floor(Math.random() * 1000) + 300;
      specialRewardText = "👑 Golden Frame Voucher";
    } else if (boxId === "box-mythic") {
      rewardCoins = Math.floor(Math.random() * 4500000) + 500000;
      rewardXp = Math.floor(Math.random() * 2500) + 500;
      specialRewardText = "🛡️ Recovery Pass & Mythic Badge";
    } else {
      rewardCoins = Math.floor(Math.random() * 48000000) + 2000000;
      rewardXp = Math.floor(Math.random() * 10000) + 2000;
      specialRewardText = "💎 ULTIMATE JACKPOT & Crown Effect";
    }

    if (rewardCoins > 0) setProfile(p => ({ ...p, coins: (p.coins ?? 100) + rewardCoins }));
    if (rewardXp > 0) awardXP(rewardXp);

    const title = `🎁 เปิด ${boxId.replace("box-", "").toUpperCase()} BOX!`;
    const desc = `ได้รับ +${rewardCoins.toLocaleString()} Coins และ +${rewardXp} XP ${specialRewardText ? `\n${specialRewardText}` : ""}`;

    playChime("complete");
    triggerNotification(title, desc, "กล่องสุ่มรางวัล", "complete");

    return { success: true, rewardTitle: title, rewardDesc: desc };
  };

  const useInventoryItem = (itemId: string): { success: boolean; message: string } => {
    const count = profile.inventory?.[itemId] || 0;
    if (count <= 0) {
      return { success: false, message: "ไม่มีไอเทมนี้ในช่องเก็บของ" };
    }

    setProfile(p => {
      const inv = { ...(p.inventory || {}) };
      inv[itemId] = Math.max(0, (inv[itemId] || 1) - 1);
      
      let streak = p.currentStreak;
      if (itemId.includes("freeze")) {
        streak += itemId.includes("7d") ? 7 : itemId.includes("3d") ? 3 : 1;
      }

      return {
        ...p,
        currentStreak: streak,
        inventory: inv
      };
    });

    playChime("success");
    triggerNotification(`✨ ใช้งานไอเทมสำเร็จ`, `เปิดใช้งานไอเทม ${itemId} เรียบร้อยแล้ว`, "ช่องเก็บของ", "success");
    return { success: true, message: `เปิดใช้งาน ${itemId} สำเร็จ!` };
  };

  const submitTrainingAppeal = (appealData: {
    category: "extra_practice" | "bonus_mission" | "time_override" | "other";
    reasonText: string;
  }): { success: boolean; message: string } => {
    const newAppeal: TrainingAppeal = {
      id: `appeal-${Date.now()}`,
      date: getTodayDateString(),
      modeType: selectedModeToday,
      category: appealData.category,
      reasonText: appealData.reasonText,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setProfile(p => ({
      ...p,
      trainingAppeals: [newAppeal, ...(p.trainingAppeals || [])]
    }));

    playChime("complete");
    triggerNotification(
      "📝 ยื่นคำร้องสำเร็จ!",
      "คำร้องของคุณถูกบันทึกในระบบเรียบร้อยแล้ว อยู่ระหว่างการพิจารณา",
      "ยื่นคำร้อง",
      "complete"
    );

    return { success: true, message: "ยื่นคำร้องเรียบร้อยแล้ว!" };
  };

  // Manage goal progression
  const addGoal = (g: Omit<Goal, "id" | "createdAt" | "completed">) => {
    const newGoal: Goal = {
      ...g,
      id: "goal-" + Date.now(),
      createdAt: getTodayDateString(),
      completed: g.currentValue >= g.targetValue
    };
    setGoals(prev => [newGoal, ...prev]);
    playChime("click");
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalProgress = (id: string, value: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newVal = value;
        const completed = g.category === "Health" && g.title.includes("น้ำหนัก")
          ? (newVal <= g.targetValue) // Weight goal is usually to lose/gain towards target, let's treat target as matched
          : (newVal >= g.targetValue);
        
        const wasCompletedBefore = g.completed;
        let notificationShown = g.notificationShown || false;

        if (completed && !wasCompletedBefore && !notificationShown) {
          notificationShown = true;
          setTimeout(() => {
            triggerNotification(
              "เป้าหมายสำเร็จ! 🎉",
              `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
              "เป้าหมายความฝัน",
              "complete"
            );
            triggerServerPush(
              "เป้าหมายสำเร็จ! 🎉",
              `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
              "/?tab=goals",
              "เป้าหมายความฝัน",
              `goal-${g.id}`
            );
          }, 100);
        }

        return {
          ...g,
          currentValue: newVal,
          completed: completed,
          notificationShown
        };
      }
      return g;
    }));
  };

  // Manage health logging
  const logHealth = (log: Omit<HealthLog, "date">) => {
    const todayStr = getTodayDateString();
    setHealthLogs(prev => {
      const idx = prev.findIndex(h => h.date === todayStr);
      const entry: HealthLog = {
        ...log,
        date: todayStr
      };

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      } else {
        return [entry, ...prev];
      }
    });

    // Also update goals related to weight/height if matched
    setGoals(prev => prev.map(g => {
      if (g.category === "Health") {
        if (g.title.includes("น้ำหนัก")) {
          const completed = Math.abs(log.weightKg - g.targetValue) < 1;
          const wasCompleted = g.completed;
          let notificationShown = g.notificationShown || false;
          
          if (completed && !wasCompleted && !notificationShown) {
            notificationShown = true;
            setTimeout(() => {
              triggerNotification(
                "เป้าหมายสำเร็จ! 🎉",
                `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
                "เป้าหมายความฝัน",
                "complete"
              );
              triggerServerPush(
                "เป้าหมายสำเร็จ! 🎉",
                `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
                "/?tab=goals",
                "เป้าหมายความฝัน",
                `goal-${g.id}`
              );
            }, 100);
          }
          return { ...g, currentValue: log.weightKg, completed, notificationShown };
        }
        if (g.title.includes("ส่วนสูง")) {
          const completed = log.heightCm >= g.targetValue;
          const wasCompleted = g.completed;
          let notificationShown = g.notificationShown || false;
          
          if (completed && !wasCompleted && !notificationShown) {
            notificationShown = true;
            setTimeout(() => {
              triggerNotification(
                "เป้าหมายสำเร็จ! 🎉",
                `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
                "เป้าหมายความฝัน",
                "complete"
              );
              triggerServerPush(
                "เป้าหมายสำเร็จ! 🎉",
                `ยินดีด้วย! คุณบรรลุเป้าหมายสำเร็จแล้ว: ${g.title}`,
                "/?tab=goals",
                "เป้าหมายความฝัน",
                `goal-${g.id}`
              );
            }, 100);
          }
          return { ...g, currentValue: log.heightCm, completed, notificationShown };
        }
      }
      return g;
    }));

    playChime("success");
  };

  // Manage diary logging
  const logDiary = (entry: Omit<DiaryEntry, "id" | "date" | "createdAt">) => {
    const todayStr = getTodayDateString();
    const newEntry: DiaryEntry = {
      ...entry,
      id: "diary-" + Date.now(),
      date: todayStr,
      createdAt: new Date().toISOString()
    };

    setDiaryEntries(prev => {
      const filtered = prev.filter(e => e.date !== todayStr);
      return [newEntry, ...filtered];
    });
    playChime("success");
  };

  // Auto achievements evaluator
  useEffect(() => {
    // Total hours calculations
    let totalDanceMinutes = 0;
    let totalSingingMinutes = 0;

    history.forEach(day => {
      if (day.completed) {
        const conf = DAILY_MODES_CONFIG[day.modeType];
        if (conf) {
          conf.missions.forEach(m => {
            if (m.name.toLowerCase().includes("dance") || m.name.includes("เต้น")) {
              totalDanceMinutes += m.durationMinutes;
            }
            if (m.name.toLowerCase().includes("sing") || m.name.includes("ร้อง")) {
              totalSingingMinutes += m.durationMinutes;
            }
          });
        }
      }
    });

    // No lazy streak: check last 15 completed training days, whether any are Lazy / Sick / No time
    const completedTrainingDays = history.filter(h => h.completed).sort((a,b) => b.date.localeCompare(a.date));
    const recent15 = completedTrainingDays.slice(0, 15);
    const hasLazyInRecent15 = recent15.some(h => h.modeType === DailyModeType.LAZY_DAY || h.modeType === DailyModeType.SICK_MODE || h.modeType === DailyModeType.NO_TIME_DAY);
    const noLazyDaysStreakValue = (recent15.length >= 15 && !hasLazyInRecent15) ? 15 : recent15.length;

    setAchievements(prev => {
      let changed = false;
      const updated = prev.map(ach => {
        let currentProgress = ach.progressCurrent;
        let unlocked = ach.unlocked;

        if (ach.id === "first_step") {
          currentProgress = history.length > 0 ? 1 : 0;
        } else if (ach.id === "7_days_streak") {
          currentProgress = profile.currentStreak;
        } else if (ach.id === "30_days_streak") {
          currentProgress = profile.currentStreak;
        } else if (ach.id === "no_lazy_month") {
          currentProgress = noLazyDaysStreakValue;
        } else if (ach.id === "100_hours_dance") {
          currentProgress = totalDanceMinutes;
        } else if (ach.id === "100_hours_singing") {
          currentProgress = totalSingingMinutes;
        } else if (ach.id === "super_rookie") {
          currentProgress = profile.level;
        } else if (ach.id === "future_star") {
          currentProgress = profile.level;
        } else if (ach.id === "future_artist") {
          currentProgress = profile.level;
        }

        const shouldUnlock = currentProgress >= ach.progressTarget;
        const wasUnlocked = ach.unlocked;
        let notificationShown = ach.notificationShown || false;

        if (shouldUnlock) {
          unlocked = true;
          if (!wasUnlocked) changed = true;

          if (!notificationShown) {
            notificationShown = true;
            changed = true;

            // Trigger notification ONLY if NOT during initial startup evaluation AND NOT on mobile
            const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
            if (!isFirstAchievementCheckRef.current && !isMobile) {
              setTimeout(() => {
                triggerNotification(
                  "Achievement Unlocked! 🏆",
                  `คุณปลดล็อกความสำเร็จใหม่แล้ว: ${ach.title}`,
                  "ตราเกียรติยศ",
                  "complete"
                );
                triggerServerPush(
                  "Achievement Unlocked! 🏆",
                  `คุณปลดล็อกความสำเร็จใหม่แล้ว: ${ach.title}`,
                  "/?tab=achievements",
                  "ตราเกียรติยศ",
                  `achievement-${ach.id}`
                );
              }, 300);
            }
          }
        }

        return {
          ...ach,
          progressCurrent: currentProgress,
          unlocked: shouldUnlock ? true : unlocked,
          unlockedAt: shouldUnlock && !wasUnlocked ? new Date().toISOString() : ach.unlockedAt,
          notificationShown
        };
      });

      if (changed) {
        return updated;
      }
      return prev;
    });

    if (isFirstAchievementCheckRef.current) {
      isFirstAchievementCheckRef.current = false;
    }
  }, [history, profile.level, profile.currentStreak]);

  // Seed mock historical data for demonstration / beautiful presentation
  const seedMockData = () => {
    const today = new Date();
    const mockHistory: DayProgress[] = [];
    const mockDiary: DiaryEntry[] = [];
    const mockHealth: HealthLog[] = [];

    // Let's seed 15 days back
    for (let i = 15; i >= 1; i--) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      const dateStr = pastDate.toISOString().split("T")[0];

      // Distribute various modes randomly
      const modes = [DailyModeType.NORMAL_DAY, DailyModeType.STUDY_DAY, DailyModeType.ACTIVITY_DAY, DailyModeType.FREE_DAY, DailyModeType.LAZY_DAY];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      const config = DAILY_MODES_CONFIG[randomMode];

      const missions: Mission[] = config.missions.map(m => ({
        ...m,
        completed: true // auto completed
      }));

      mockHistory.push({
        date: dateStr,
        modeType: randomMode,
        missions,
        xpEarned: config.xpReward,
        completed: true,
        completedAt: new Date(pastDate.setHours(18, 0, 0)).toISOString()
      });

      // Diary
      if (i % 3 === 0) {
        mockDiary.push({
          id: `diary-mock-${i}`,
          date: dateStr,
          mood: "🤩 มีแรงบันดาลใจ",
          prideText: `ฝึกเต้นท่าท่อนฮุคผ่านฉลุยในวันที่ ${16 - i} ของปี!`,
          progressPercent: 100,
          tomorrowPlan: "ซ้อมร้องเพลงระดับเสียงกลาง และวิ่งคาร์ดิโอ",
          createdAt: new Date().toISOString()
        });
      }

      // Health
      mockHealth.push({
        date: dateStr,
        heightCm: 172,
        weightKg: 64.5 - (15 - i) * 0.1, // gradual slight weight drop
        sleepHours: 7 + Math.random(),
        waterIntakeMl: 1500 + Math.floor(Math.random() * 1000),
        exerciseNotes: "ฝึกซ้อมเต็มสูบ รู้สึกกระปรี้กระเปร่า"
      });
    }

    setHistory(mockHistory);
    setDiaryEntries(prev => [...mockDiary, ...prev.filter(e => !e.id.startsWith("diary-mock"))]);
    setHealthLogs(mockHealth);
    
    // Update profile
    setProfile(p => ({
      ...p,
      level: 6,
      xp: 220,
      currentStreak: 15,
      bestStreak: 15,
      lastTrainedDate: mockHistory[mockHistory.length - 1].date
    }));

    playChime("complete");
    alert("เสร็จสิ้น! บันทึกข้อมูลจำลองความคืบหน้า 15 วันเรียบร้อยแล้ว");
  };

  const resetAllData = () => {
    localStorage.clear();
    // Reset to defaults
    setProfile({
      nickname: "ศิลปินฝึกหัด (Trainee)",
      birthday: "2008-01-01",
      age: 18,
      level: 1,
      xp: 0,
      currentStreak: 0,
      bestStreak: 0
    });
    setSettings({
      notificationsEnabled: true,
      theme: "dark",
      targetEndDate: "2026-12-31",
      quotaExceededWarning: true
    });
    setHistory([]);
    setDiaryEntries([]);
    setHealthLogs([]);
    setGoals([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSelectedModeToday(DailyModeType.NONE);
    setActiveMissions([]);
    playChime("warning");
    alert("รีเซ็ตข้อมูลทั้งหมดเรียบร้อยแล้ว");
  };

  const addAchievement = (ach: Omit<Achievement, "id" | "unlocked" | "progressCurrent">) => {
    const newAch: Achievement = {
      ...ach,
      id: "ach-" + Date.now(),
      unlocked: false,
      progressCurrent: 0
    };
    setAchievements(prev => [...prev, newAch]);
    playChime("success");
  };

  const deleteAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const updateAchievementProgress = (id: string, progress: number) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === id) {
        const nextProgress = Math.min(a.progressTarget, Math.max(0, progress));
        const unlocked = nextProgress >= a.progressTarget;
        return {
          ...a,
          progressCurrent: nextProgress,
          unlocked,
          unlockedAt: unlocked && !a.unlocked ? new Date().toISOString() : a.unlockedAt
        };
      }
      return a;
    }));
  };

  const toggleExamPeriod = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !activeExamMode;
    setActiveExamMode(nextState);
    localStorage.setItem("future_artist_exam_mode", String(nextState));

    if (nextState) {
      triggerNotification(
        "📚 เปิดใช้งาน EXAM MODE (โหมดสอบ)",
        "ปรับระบบให้เข้าสู่ช่วงสอบแล้ว! ภารกิจเน้นทบทวนบทเรียน รักษาสุขภาพ และถนอมสายตา",
        "โหมดเตรียมสอบ",
        "warning"
      );
      playChime("click");
    } else {
      setProfile(prev => ({
        ...prev,
        xp: prev.xp + 100
      }));

      setAchievements(prev => prev.map(a => {
        if (a.id === "exam_warrior") {
          return {
            ...a,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            progressCurrent: 1
          };
        }
        return a;
      }));

      triggerNotification(
        "🏅 สิ้นสุดช่วงสอบ! (Exam Period Complete)",
        "ยินดีด้วยศิลปิน! คุณผ่านพ้นช่วงสอบอย่างสมบูรณ์แบบ ปลดล็อก Badge 'Exam Warrior' 🏅 และรับโบนัส +100 XP!",
        "โหมดเตรียมสอบ",
        "complete"
      );
      playChime("complete");
    }
  };

  const isFirstMountExam = useRef(true);
  const isFirstMountVacation = useRef(true);

  // Exam & Vacation Mode side-effect notification triggers
  useEffect(() => {
    if (isFirstMountExam.current) {
      isFirstMountExam.current = false;
      return;
    }
    if (activeExamMode) {
      triggerNotification(
        "Exam Mode Activated!",
        "Exam Mode Activated! ระบบได้ปรับภารกิจให้เหมาะกับช่วงสอบแล้ว",
        "โหมดเตรียมสอบ",
        "warning"
      );
    }
  }, [activeExamMode]);

  useEffect(() => {
    if (isFirstMountVacation.current) {
      isFirstMountVacation.current = false;
      return;
    }
    if (activeVacationMode) {
      triggerNotification(
        "Vacation Mode Activated!",
        "Vacation Mode Activated! ถึงเวลาพัฒนาตัวเองแบบเต็มที่แล้ว",
        "โหมดปิดเทอม",
        "success"
      );
    }
  }, [activeVacationMode]);

  // Automatic Schedule and Condition Checker
  useEffect(() => {
    const runAutomaticChecks = () => {
      const todayDate = getTodayDateString();
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

      // Load notified keys for today
      let notifiedKeys: string[] = [];
      try {
        const savedKeys = localStorage.getItem(`future_artist_notified_${todayDate}`);
        if (savedKeys) notifiedKeys = JSON.parse(savedKeys);
      } catch (e) {}

      const markAsNotified = (key: string) => {
        notifiedKeys.push(key);
        localStorage.setItem(`future_artist_notified_${todayDate}`, JSON.stringify(notifiedKeys));
      };

      const hasBeenNotified = (key: string) => notifiedKeys.includes(key);

      // 1. Time-Based Schedule Rules
      const scheduleRules = [
        {
          time: "06:00",
          title: "อรุณสวัสดิ์ขวัญใจทีมงาน!",
          message: "Good Morning! วันนี้คุณอยากเป็น Future Artist กี่เปอร์เซ็นต์?",
          category: "แจ้งเตือนประจำวัน",
          sound: "success" as const
        },
        {
          time: "06:05",
          title: "ระเบียบวินัยยามเช้า",
          message: "ดื่มน้ำ 1 แก้ว และจัดที่นอนให้เรียบร้อย",
          category: "แจ้งเตือนประจำวัน",
          sound: "click" as const
        },
        {
          time: "06:15",
          title: "ดูแลตัวเองยามเช้า",
          message: "ล้างหน้า แปรงฟัน และดูแลตัวเอง",
          category: "แจ้งเตือนประจำวัน",
          sound: "click" as const
        },
        {
          time: "08:00",
          title: "จิบน้ำเพิ่มพลัง",
          message: "ดื่มน้ำอีก 1 แก้วนะ!",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "success" as const
        },
        {
          time: "10:00",
          title: "จิบน้ำเพิ่มพลัง",
          message: "อย่าลืมดื่มน้ำด้วยนะ",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "click" as const
        },
        {
          time: "12:00",
          title: "พลังงานกลางวัน",
          message: "ทานข้าวกลางวันให้ครบมื้อ และดื่มน้ำให้เพียงพอ",
          category: "แจ้งเตือนประจำวัน",
          sound: "click" as const
        },
        {
          time: "14:00",
          title: "จิบน้ำเพิ่มพลัง",
          message: "ได้เวลาดื่มน้ำแล้ว!",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "success" as const
        },
        {
          time: "16:00",
          title: "จิบน้ำเพิ่มพลัง",
          message: "ดื่มน้ำก่อนเริ่มทำกิจกรรมช่วงเย็น",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "click" as const
        },
        {
          time: "16:30",
          title: "กลับถึงบ้านแล้ว!",
          message: "กลับถึงบ้านแล้ว! เลือกโหมดประจำวันของคุณ",
          category: "แจ้งเตือนประจำวัน",
          sound: "success" as const
        },
        {
          time: "17:00",
          title: "เริ่มภารกิจวันใหม่!",
          message: "เริ่มภารกิจแรกของวันนี้กันเลย!",
          category: "แจ้งเตือนประจำวัน",
          sound: "complete" as const
        },
        {
          time: "18:00",
          title: "จิบน้ำเพิ่มพลัง",
          message: "ดื่มน้ำอีก 1 แก้วนะ!",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "success" as const
        },
        {
          time: "19:30",
          title: "ตรวจสอบความคืบหน้า",
          message: "ตรวจสอบว่าทำภารกิจประจำวันครบหรือยัง",
          category: "แจ้งเตือนประจำวัน",
          sound: "click" as const
        },
        {
          time: "20:00",
          title: "รายงานความก้าวหน้ารายสัปดาห์",
          message: "Weekly Report พร้อมแล้ว! มาดูสรุปความก้าวหน้าของคุณกัน",
          category: "รายงานรายสัปดาห์",
          sound: "complete" as const
        },
        {
          time: "20:01",
          title: "จิบน้ำก่อนนอน",
          message: "ดื่มน้ำก่อนเข้านอนกันนะ",
          category: "แจ้งเตือนดื่มน้ำ",
          sound: "success" as const
        },
        {
          time: "21:00",
          title: "ช่วงเวลาสะท้อนตนเอง",
          message: "เขียน Diary วันนี้ของคุณกันเถอะ",
          category: "แจ้งเตือนประจำวัน",
          sound: "click" as const
        },
        {
          time: "21:30",
          title: "เตรียมตัวพักผ่อน",
          message: "เตรียมตัวเข้านอนได้แล้ว",
          category: "แจ้งเตือนการนอน",
          sound: "warning" as const
        },
        {
          time: "22:00",
          title: "เข้าสู่โหมดหลับใหล",
          message: "Sleep Mode Activated",
          category: "แจ้งเตือนการนอน",
          sound: "warning" as const
        },
        {
          time: "22:30",
          title: "ดึกมากแล้วนะ...",
          message: "ยังไม่นอนเหรอ? พรุ่งนี้ต้องสดใสนะ!",
          category: "แจ้งเตือนการนอน",
          sound: "warning" as const
        }
      ];

      // Run fixed time schedule checks
      scheduleRules.forEach(rule => {
        const key = `time-${rule.time}`;
        if (timeStr === rule.time && !hasBeenNotified(key)) {
          triggerNotification(rule.title, rule.message, rule.category, rule.sound);
          markAsNotified(key);
        }
      });

      // Special Post-Midnight Check (00:00 - 04:00)
      if (currentHour >= 0 && currentHour < 4) {
        const key = "time-midnight";
        if (!hasBeenNotified(key)) {
          triggerNotification(
            "ได้เวลาพักผ่อนแล้วนะ",
            "วันนี้พักผ่อนก่อนนะ พรุ่งนี้เรามาเริ่มใหม่กัน",
            "แจ้งเตือนการนอน",
            "warning"
          );
          markAsNotified(key);
        }
      }

      // 2. State-Based Checkers

      // - ยังไม่เลือกโหมด: Triggers past 12:00 if they haven't selected a mode today
      if (currentHour >= 12 && selectedModeToday === DailyModeType.NONE) {
        const key = "state-no-mode-chosen";
        if (!hasBeenNotified(key)) {
          triggerNotification(
            "ยังไม่ได้เลือกโหมดประจำวัน",
            "วันนี้คุณยังไม่ได้เลือกโหมดประจำวัน",
            "เลือกโหมดประจำวัน",
            "warning"
          );
          markAsNotified(key);
        }
      }

      // - ยังไม่เริ่มภารกิจ: Triggers past 21:00 if mode is chosen but no missions completed/started
      if (currentHour >= 21) {
        const totalMissions = activeMissions.length;
        const completedMissions = activeMissions.filter(m => m.completed).length;
        if (selectedModeToday !== DailyModeType.NONE && completedMissions === 0 && totalMissions > 0) {
          const key = "state-no-missions-started";
          if (!hasBeenNotified(key)) {
            triggerNotification(
              "ยังไม่ได้เริ่มซ้อมเลยนะ",
              "วันนี้คุณยังไม่ได้เริ่มภารกิจเลยนะ!",
              "ความคืบหน้าภารกิจ",
              "warning"
            );
            markAsNotified(key);
          }
        }
      }

      // - ยังไม่เริ่มภารกิจ (General fallback trigger for state)
      if (selectedModeToday !== DailyModeType.NONE && activeMissions.length > 0 && !hasBeenNotified("state-general-not-started")) {
        if (currentHour >= 18 && activeMissions.every(m => !m.completed)) {
          triggerNotification(
            "แวะมาฝึกซ้อมกันเถอะ",
            "คุณยังไม่ได้เริ่มภารกิจของวันนี้เลยนะ",
            "ความคืบหน้าภารกิจ",
            "warning"
          );
          markAsNotified("state-general-not-started");
        }
      }

      // - เหลือ 1 ภารกิจ: Triggers when only 1 mission is left incomplete today
      if (selectedModeToday !== DailyModeType.NONE && activeMissions.length > 1) {
        const incompleteMissions = activeMissions.filter(m => !m.completed);
        if (incompleteMissions.length === 1) {
          const key = "state-one-mission-left";
          if (!hasBeenNotified(key)) {
            triggerNotification(
              "เป้าหมายอยู่ใกล้แค่เอื้อม!",
              "เหลืออีกเพียง 1 ภารกิจ ก็จะครบวันนี้แล้ว!",
              "ความคืบหน้าภารกิจ",
              "success"
            );
            markAsNotified(key);
          }
        }
      }

      // - ใช้ LAZY DAY ใกล้หมด: Trigger when lazy day used matches 2 (out of monthly quota 3)
      if (selectedModeToday === DailyModeType.LAZY_DAY) {
        const quotas = getQuotaCounts();
        if (quotas[DailyModeType.LAZY_DAY] >= 2) {
          const key = `lazy-day-limit-${new Date().getMonth()}`;
          if (!hasBeenNotified(key)) {
            triggerNotification(
              "โควตาพักผ่อนใกล้หมดแล้ว",
              "คุณใช้ LAZY DAY ไปแล้ว 2/3 วัน",
              "แจ้งเตือนโควตา",
              "warning"
            );
            markAsNotified(key);
          }
        }
      }

      // - NO TIME DAY ใกล้หมด: Trigger when NO TIME DAY used matches 1
      if (selectedModeToday === DailyModeType.NO_TIME_DAY) {
        const quotas = getQuotaCounts();
        if (quotas[DailyModeType.NO_TIME_DAY] >= 1) {
          const key = `notime-day-limit-${new Date().getMonth()}`;
          if (!hasBeenNotified(key)) {
            triggerNotification(
              "โควตาโหมดลดเวลากรณีพิเศษหมดแล้ว",
              "NO TIME DAY เหลืออีกเพียง 1 วันในเดือนนี้",
              "แจ้งเตือนโควตา",
              "warning"
            );
            markAsNotified(key);
          }
        }
      }

      // - เป้าหมายใกล้สำเร็จ (Goal progress >= 80% and not yet 100%)
      goals.forEach(goal => {
        if (!goal.completed && goal.targetValue > 0) {
          const progressPercent = Math.min(100, Math.floor((goal.currentValue / goal.targetValue) * 100));
          if (progressPercent >= 80) {
            const key = `goal-near-complete-${goal.id}`;
            if (!hasBeenNotified(key)) {
              triggerNotification(
                "เป้าหมายใกล้สำเร็จแล้ว!",
                `คุณทำเป้าหมายสำเร็จแล้ว ${progressPercent}% เหลืออีกนิดเดียว!`,
                "แจ้งเตือนเป้าหมาย",
                "success"
              );
              markAsNotified(key);
            }
          }
        }
      });

      // - นับถอยหลังสู่สิ้นปี / Showcase targetDate countdown
      const targetEndDateStr = settings.targetEndDate || "2026-12-31";
      const targetDateObj = new Date(targetEndDateStr);
      const todayDateObj = new Date(todayDate);
      const diffTime = targetDateObj.getTime() - todayDateObj.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 150) {
        const key = "countdown-150";
        if (!hasBeenNotified(key)) {
          triggerNotification("นับถอยหลังสู่สิ้นปี", "เหลือเวลาอีก 150 วันก่อนสิ้นปีแล้ว!", "นับถอยหลังปี", "success");
          markAsNotified(key);
        }
      } else if (diffDays === 100) {
        const key = "countdown-100";
        if (!hasBeenNotified(key)) {
          triggerNotification("100 DAYS LEFT!", "100 DAYS LEFT! พร้อมเป็น Future Artist แล้วหรือยัง?", "นับถอยหลังปี", "success");
          markAsNotified(key);
        }
      } else if (diffDays === 50) {
        const key = "countdown-50";
        if (!hasBeenNotified(key)) {
          triggerNotification("นับถอยหลังสู่สิ้นปี", "เหลือเวลาอีก 50 วัน อย่าหยุดพัฒนาตัวเองนะ!", "นับถอยหลังปี", "success");
          markAsNotified(key);
        }
      } else if (diffDays === 30) {
        const key = "countdown-30";
        if (!hasBeenNotified(key)) {
          triggerNotification("นับถอยหลังสู่สิ้นปี", "เหลืออีกเพียง 30 วันก่อนสิ้นปีแล้ว!", "นับถอยหลังปี", "success");
          markAsNotified(key);
        }
      } else if (diffDays === 7) {
        const key = "countdown-7";
        if (!hasBeenNotified(key)) {
          triggerNotification("นับถอยหลังสู่สิ้นปี", "อีก 7 วันก็จะสิ้นปีแล้ว ลุยให้เต็มที่!", "นับถอยหลังปี", "success");
          markAsNotified(key);
        }
      } else if (diffDays === 0) {
        const key = "countdown-last-day";
        if (!hasBeenNotified(key)) {
          triggerNotification("วันสุดท้ายของปี!", "วันนี้คือวันสุดท้ายของปี! ภูมิใจกับสิ่งที่ทำมาตลอดทั้งปีนะ", "นับถอยหลังปี", "complete");
          markAsNotified(key);
        }
      }

      // - ตรวจเช็กการห่างหายไม่เข้าซ้อม (Inactivity Checker)
      if (profile.lastTrainedDate) {
        const lastTrainedObj = new Date(profile.lastTrainedDate);
        const inactivityDiff = Math.ceil(Math.abs(todayDateObj.getTime() - lastTrainedObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (inactivityDiff === 3) {
          const key = "inactivity-3";
          if (!hasBeenNotified(key)) {
            triggerNotification("คิดถึงนะศิลปินฝึกหัด!", "ไม่เข้าใช้งาน 3 วัน: คิดถึงนะ! กลับมาพัฒนาตัวเองกันเถอะ", "หายไปจากระบบ", "warning");
            markAsNotified(key);
          }
        } else if (inactivityDiff === 7) {
          const key = "inactivity-7";
          if (!hasBeenNotified(key)) {
            triggerNotification("ยินดีต้อนรับการเริ่มต้นใหม่", "ไม่เข้าใช้งาน 7 วัน: ยังไม่สายที่จะเริ่มต้นใหม่", "หายไปจากระบบ", "warning");
            markAsNotified(key);
          }
        } else if (inactivityDiff === 14) {
          const key = "inactivity-14";
          if (!hasBeenNotified(key)) {
            triggerNotification("ความฝันของคุณยังคงอยู่ตรงนี้", "ไม่เข้าใช้งาน 14 วัน: เป้าหมายของคุณยังอยู่ตรงนี้เสมอ", "หายไปจากระบบ", "warning");
            markAsNotified(key);
          }
        } else if (inactivityDiff >= 30) {
          const key = "inactivity-30";
          if (!hasBeenNotified(key)) {
            triggerNotification("อนาคตรอคุณอยู่เสมอ", "ไม่เข้าใช้งาน 30 วัน: Future Artist ยังรอคุณกลับมา!", "หายไปจากระบบ", "warning");
            markAsNotified(key);
          }
        }
      }

      // - วันเกิด (Birthday checker)
      if (profile.birthday) {
        const bday = new Date(profile.birthday);
        if (now.getMonth() === bday.getMonth() && now.getDate() === bday.getDate()) {
          const key = "birthday-checker";
          if (!hasBeenNotified(key)) {
            triggerNotification(
              "สุขสันต์วันเกิด!",
              "สุขสันต์วันเกิด! ขอให้ปีนี้เป็นปีที่ดีที่สุดของคุณ รับ Bonus XP ฟรี!",
              "แจ้งเตือนวันเกิด",
              "complete"
            );
            awardXP(200); // Give 200 XP bonus
            markAsNotified(key);
          }
        }
      }

      // - สุ่มให้กำลังใจระหว่างวัน (Inspirational trigger at 15:00)
      if (currentHour === 15 && currentMin === 0) {
        const key = "random-inspiration";
        if (!hasBeenNotified(key)) {
          const quotes = [
            "อนาคตของคุณเริ่มต้นจากวันนี้",
            "ถ้าวันนี้ทำได้เพียง 1% ก็ยังดีกว่า 0%",
            "ตัวคุณในวัย 20 ปีกำลังรอคุณอยู่",
            "ขอบคุณที่ไม่ยอมแพ้กับความฝันของตัวเอง"
          ];
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          triggerNotification("กำลังใจดวงดาว", randomQuote, "กำลังใจรายวัน", "success");
          markAsNotified(key);
        }
      }
    };

    // Run first immediately
    runAutomaticChecks();

    // Check periodically every 15 seconds
    const checkInterval = setInterval(runAutomaticChecks, 15000);
    return () => clearInterval(checkInterval);
  }, [selectedModeToday, activeMissions, goals, profile.birthday, profile.lastTrainedDate, settings.targetEndDate]);

  // --- Local Notification Helpers ---
  const triggerServerPush = async (title: string, message: string, _url?: string, category?: string, _duplicateKey?: string) => {
    try {
      await scheduleLocalNotification({
        title,
        body: message,
        category: category || "General"
      });
    } catch (e) {
      console.warn("Could not trigger local notification:", e);
    }
  };

  const subscribeToPushNotifications = async (): Promise<boolean> => {
    return true;
  };

  return {
    profile,
    setProfile,
    settings,
    setSettings,
    history,
    goals,
    healthLogs,
    diaryEntries,
    achievements,
    selectedModeToday,
    activeMissions,
    userId,
    syncStatus,
    lastSyncedAt,
    syncMessage,
    importDataFromCloud,
    triggerManualSync,
    reloadAppAndFetchData,
    getQuotaCounts,
    getTotalModeUsageCounts,
    checkConsecutiveLazyDays,
    selectDailyMode,
    toggleMissionComplete,
    completeAllMissionsToday,
    saveMyStreak,
    addGoal,
    deleteGoal,
    updateGoalProgress,
    logHealth,
    logDiary,
    seedMockData,
    resetAllData,
    addAchievement,
    deleteAchievement,
    updateAchievementProgress,
    notificationLogs,
    markLogAsClicked,
    markLogAsDismissed,
    activeExamMode,
    setActiveExamMode,
    toggleExamPeriod,
    activeVacationMode,
    setActiveVacationMode,
    globalToast,
    setGlobalToast,
    triggerNotification,
    clearNotificationLogs,
    subscribeToPushNotifications,
    triggerServerPush,
    lastAutoSaveTime,
    isAutoSaveActive,
    levelUpModalData,
    closeLevelUpModal,
    buyShopItem,
    openMysteryBox,
    useInventoryItem,
    getMissedDaysStraight,
    isHardWorkerToday,
    submitTrainingAppeal
  };
}

