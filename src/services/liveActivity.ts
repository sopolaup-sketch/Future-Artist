import { Capacitor, registerPlugin } from "@capacitor/core";

export interface LiveActivityOptions {
  title?: string;
  modeName?: string;
  timerType?: string;
  currentActivity?: string;
  currentActivityProgress?: string;
  totalSeconds: number;
  remainingSeconds: number;
  expGained?: number;
  coinsGained?: number;
  nextRewardInfo?: string;
  todaysGoalProgress?: string;
  aiCoachQuote?: string;
  waterReminder?: string;
  levelInfo?: string;
  dailyMissionInfo?: string;
  streakDays?: number;
  icon?: string;
  isPaused?: boolean;
  isFinished?: boolean;
}

export interface LiveActivityPluginInterface {
  startLiveActivity(options: LiveActivityOptions): Promise<{ success: boolean; activityId?: string; error?: string }>;
  updateLiveActivity(options: LiveActivityOptions): Promise<{ success: boolean; error?: string }>;
  pauseLiveActivity(options: LiveActivityOptions): Promise<{ success: boolean }>;
  resumeLiveActivity(options: LiveActivityOptions): Promise<{ success: boolean }>;
  stopLiveActivity(): Promise<{ success: boolean }>;
}

const LiveActivityNative = registerPlugin<LiveActivityPluginInterface>("LiveActivityPlugin");

export async function startLiveActivity(options: LiveActivityOptions): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[LiveActivity Web Fallback] Started:", options.modeName, options.currentActivity, `${options.remainingSeconds}s remaining`);
    return true;
  }

  try {
    const res = await LiveActivityNative.startLiveActivity({
      title: options.title || "Future Artist",
      modeName: options.modeName || "Artist Mode",
      timerType: options.timerType || "Training Timer",
      currentActivity: options.currentActivity || "🎤 Singing",
      currentActivityProgress: options.currentActivityProgress || "00:00",
      totalSeconds: options.totalSeconds,
      remainingSeconds: options.remainingSeconds,
      expGained: options.expGained ?? 250,
      coinsGained: options.coinsGained ?? 150,
      nextRewardInfo: options.nextRewardInfo || "+50 Coins",
      todaysGoalProgress: options.todaysGoalProgress || "1:25 / 2:00",
      aiCoachQuote: options.aiCoachQuote || "อีก 15 นาทีก็ได้พักแล้ว!",
      waterReminder: options.waterReminder || "",
      levelInfo: options.levelInfo || "LV 27",
      dailyMissionInfo: options.dailyMissionInfo || "7/10",
      streakDays: options.streakDays ?? 29,
      icon: options.icon || "🎤",
      isPaused: false,
      isFinished: false
    });
    return res.success;
  } catch (err) {
    console.warn("[LiveActivity] Error starting native activity:", err);
    return false;
  }
}

export async function updateLiveActivity(options: LiveActivityOptions): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;

  try {
    const res = await LiveActivityNative.updateLiveActivity({
      title: options.title || "Future Artist",
      modeName: options.modeName || "Artist Mode",
      timerType: options.timerType || "Training Timer",
      currentActivity: options.currentActivity || "🎤 Singing",
      currentActivityProgress: options.currentActivityProgress || "00:00",
      totalSeconds: options.totalSeconds,
      remainingSeconds: options.remainingSeconds,
      expGained: options.expGained ?? 250,
      coinsGained: options.coinsGained ?? 150,
      nextRewardInfo: options.nextRewardInfo || "+50 Coins",
      todaysGoalProgress: options.todaysGoalProgress || "1:25 / 2:00",
      aiCoachQuote: options.aiCoachQuote || "",
      waterReminder: options.waterReminder || "",
      levelInfo: options.levelInfo || "LV 27",
      dailyMissionInfo: options.dailyMissionInfo || "7/10",
      streakDays: options.streakDays ?? 29,
      icon: options.icon || "🎤",
      isPaused: options.isPaused || false,
      isFinished: options.isFinished || false
    });
    return res.success;
  } catch (err) {
    console.warn("[LiveActivity] Error updating native activity:", err);
    return false;
  }
}

export async function pauseLiveActivity(options: LiveActivityOptions): Promise<boolean> {
  return updateLiveActivity({ ...options, isPaused: true });
}

export async function resumeLiveActivity(options: LiveActivityOptions): Promise<boolean> {
  return updateLiveActivity({ ...options, isPaused: false });
}

export async function stopLiveActivity(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log("[LiveActivity Web Fallback] Stopped");
    return true;
  }

  try {
    const res = await LiveActivityNative.stopLiveActivity();
    return res.success;
  } catch (err) {
    console.warn("[LiveActivity] Error stopping native activity:", err);
    return false;
  }
}
