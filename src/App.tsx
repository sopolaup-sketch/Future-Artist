import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DailyMode from "./components/DailyMode";
import TimerView from "./components/TimerView";
import CalendarView from "./components/CalendarView";
import ProgressView from "./components/ProgressView";
import GoalView from "./components/GoalView";
import AchievementsView from "./components/AchievementsView";
import HealthView from "./components/HealthView";
import DiaryView from "./components/DiaryView";
import SettingsView from "./components/SettingsView";
import NotificationsView from "./components/NotificationsView";
import ShopView from "./components/ShopView";
import LevelUpModal from "./components/LevelUpModal";
import CookieBanner from "./components/CookieBanner";
import VersionAndRemoteConfigModal from "./components/VersionAndRemoteConfigModal";
import OfflineMode from "./components/OfflineMode";
import { useAppState } from "./hooks/useAppState";
import { Flame, Bell, Volume2, Sparkles, AlertCircle, CheckCircle2, Droplet, BookOpen, Award, Calendar, Moon } from "lucide-react";
import { playChime } from "./utils/audio";

export default function App() {
  const {
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
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [forceOpenCookieModal, setForceOpenCookieModal] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isRetryingOffline, setIsRetryingOffline] = useState<boolean>(false);

  // Monitor network connectivity for Offline Mode
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetryOffline = async () => {
    setIsRetryingOffline(true);
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`).catch(() => null);
      if (res && res.ok) {
        setIsOffline(false);
      } else if (navigator.onLine) {
        setIsOffline(false);
      }
    } catch (e) {
      console.warn("Offline retry error:", e);
    } finally {
      setTimeout(() => setIsRetryingOffline(false), 500);
    }
  };

  // Fire an automated simulated reminder or checking for empty daily mode on startup & handle Notification deep linking
  useEffect(() => {
    // Standard chime sound on start to confirm system audio works
    playChime("click");
    
    // Parse deep-linking query parameters from URL (e.g. ?tab=timer or ?tab=notifications)
    const handleUrlTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    };

    handleUrlTab();

    // Listen to window focus and popstate events
    window.addEventListener("focus", handleUrlTab);
    window.addEventListener("popstate", handleUrlTab);

    // Listen for Service Worker postMessage for deep link tab switching
    if ("serviceWorker" in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === "NAVIGATE_TAB" && event.data.url) {
          try {
            const rawUrl = String(event.data.url);
            let tabParam: string | null = null;
            if (rawUrl.includes("tab=")) {
              const match = rawUrl.match(/[?&]tab=([^&]+)/);
              if (match) tabParam = match[1];
            }
            if (!tabParam) {
              const origin = window.location.origin && window.location.origin !== "null" ? window.location.origin : "http://localhost";
              const targetUrl = new URL(rawUrl, origin);
              tabParam = targetUrl.searchParams.get("tab");
            }
            if (tabParam) {
              setActiveTab(tabParam);
            }
          } catch (e) {
            console.warn("Error parsing navigate tab data:", e);
          }
        }
      };

      navigator.serviceWorker.addEventListener("message", messageHandler);

      return () => {
        window.removeEventListener("focus", handleUrlTab);
        window.removeEventListener("popstate", handleUrlTab);
        navigator.serviceWorker.removeEventListener("message", messageHandler);
      };
    }

    // Check if notification permission is allowed on desktop
    if ("Notification" in window && Notification.permission === "default" && settings.notificationsEnabled) {
      setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
    }

    return () => {
      window.removeEventListener("focus", handleUrlTab);
      window.removeEventListener("popstate", handleUrlTab);
    };
  }, []);

  // View router
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            profile={profile}
            settings={settings}
            history={history}
            activeMissions={activeMissions}
            selectedModeToday={selectedModeToday}
            setActiveTab={setActiveTab}
            saveMyStreak={saveMyStreak}
          />
        );
      case "daily-mode":
        return (
          <DailyMode
            selectedModeToday={selectedModeToday}
            selectDailyMode={selectDailyMode}
            getQuotaCounts={getQuotaCounts}
            getTotalModeUsageCounts={getTotalModeUsageCounts}
            checkConsecutiveLazyDays={checkConsecutiveLazyDays}
            activeExamMode={activeExamMode}
            toggleExamPeriod={toggleExamPeriod}
          />
        );
      case "timer":
        return (
          <TimerView
            profile={profile}
            selectedModeToday={selectedModeToday}
            activeMissions={activeMissions}
            toggleMissionComplete={toggleMissionComplete}
            completeAllMissionsToday={completeAllMissionsToday}
            setActiveTab={setActiveTab}
            triggerNotification={triggerNotification}
            submitTrainingAppeal={submitTrainingAppeal}
          />
        );
      case "shop":
        return (
          <ShopView
            profile={profile}
            buyShopItem={buyShopItem}
            openMysteryBox={openMysteryBox}
            useInventoryItem={useInventoryItem}
            getMissedDaysStraight={getMissedDaysStraight}
            isHardWorkerToday={isHardWorkerToday}
          />
        );
      case "calendar":
        return (
          <CalendarView
            history={history}
            diaryEntries={diaryEntries}
            healthLogs={healthLogs}
          />
        );
      case "progress":
        return (
          <ProgressView 
            history={history} 
            goals={goals} 
            achievements={achievements} 
            healthLogs={healthLogs} 
            diaryEntries={diaryEntries}
            profile={profile}
          />
        );
      case "goals":
        return (
          <GoalView
            goals={goals}
            addGoal={addGoal}
            deleteGoal={deleteGoal}
            updateGoalProgress={updateGoalProgress}
          />
        );
      case "achievements":
        return (
          <AchievementsView 
            achievements={achievements} 
            addAchievement={addAchievement}
            deleteAchievement={deleteAchievement}
            updateAchievementProgress={updateAchievementProgress}
          />
        );
      case "health":
        return (
          <HealthView
            healthLogs={healthLogs}
            logHealth={logHealth}
          />
        );
      case "diary":
        return (
          <DiaryView
            diaryEntries={diaryEntries}
            logDiary={logDiary}
          />
        );
      case "notifications":
        return (
          <NotificationsView
            notificationLogs={notificationLogs}
            activeExamMode={activeExamMode}
            setActiveExamMode={setActiveExamMode}
            activeVacationMode={activeVacationMode}
            setActiveVacationMode={setActiveVacationMode}
            triggerNotification={triggerNotification}
            clearNotificationLogs={clearNotificationLogs}
            settings={settings}
            setSettings={setSettings}
            subscribeToPushNotifications={subscribeToPushNotifications}
            triggerServerPush={triggerServerPush}
            userId={userId}
          />
        );
      case "settings":
        return (
          <SettingsView
            profile={profile}
            setProfile={setProfile}
            settings={settings}
            setSettings={setSettings}
            seedMockData={seedMockData}
            resetAllData={resetAllData}
            userId={userId}
            syncStatus={syncStatus}
            lastSyncedAt={lastSyncedAt}
            syncMessage={syncMessage}
            importDataFromCloud={importDataFromCloud}
            triggerManualSync={triggerManualSync}
            reloadAppAndFetchData={reloadAppAndFetchData}
            onOpenCookieModal={() => setForceOpenCookieModal(true)}
          />
        );
      default:
        return (
          <div className="text-center text-gray-500 py-12">
            ไม่พบหน้าที่คุณเลือกในระบบ
          </div>
        );
    }
  };

  const getToastIcon = (category: string = "", soundType: string = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("น้ำ") || cat.includes("water") || cat.includes("ดื่ม")) {
      return <Droplet className="text-blue-400 shrink-0" size={20} />;
    }
    if (cat.includes("สอบ") || cat.includes("exam") || cat.includes("เรียน")) {
      return <BookOpen className="text-amber-400 shrink-0" size={20} />;
    }
    if (cat.includes("นอน") || cat.includes("sleep") || cat.includes("หลับ")) {
      return <Moon className="text-indigo-400 shrink-0" size={20} />;
    }
    if (cat.includes("เป้า") || cat.includes("goal") || cat.includes("ความคืบหน้า")) {
      return <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />;
    }
    if (cat.includes("เกียรติ") || cat.includes("achievement") || cat.includes("สำเร็จ")) {
      return <Award className="text-yellow-400 shrink-0" size={20} />;
    }
    if (cat.includes("ตาราง") || cat.includes("ปฏิทิน") || cat.includes("calendar")) {
      return <Calendar className="text-purple-400 shrink-0" size={20} />;
    }
    
    if (soundType === "warning") {
      return <AlertCircle className="text-amber-400 shrink-0" size={20} />;
    }
    if (soundType === "complete" || soundType === "success") {
      return <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />;
    }
    return <Bell className="text-purple-400 shrink-0" size={20} />;
  };

  const fontScaleClass = `font-scale-${settings.fontScale || "normal"}`;

  return (
    <div 
      id="app-root-container" 
      className={`min-h-screen bg-[var(--bg-color)] text-gray-100 flex flex-col md:flex-row font-sans safe-area-top ${fontScaleClass}`}
    >
      
      {/* 1. Global Navigation sidebar for desktop / bottom sheet bar for mobile */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lastAutoSaveTime={lastAutoSaveTime} />

      {/* 2. Main Content Wrapper Frame */}
      <main 
        id="main-app-content-area"
        className="flex-1 md:ml-64 px-3 sm:px-4 py-4 sm:py-6 md:p-8 overflow-y-auto pb-28 md:pb-8 min-h-screen"
      >
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Mobile Floating Glass Top Bar Header */}
          <header className="md:hidden sticky top-2 z-30 glass-panel border border-white/15 bg-white/10 backdrop-blur-2xl rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png" 
                alt="Future Artist Logo" 
                className="w-8 h-8 rounded-[8px] object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs tracking-tight text-white leading-tight">Future Artist</span>
                <span className="text-[9px] text-blue-300 font-medium">App พัฒนาตนเองสู่การเป็นศิลปิน</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-orange-400 bg-orange-400/10 border border-orange-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                <Flame size={11} className="fill-orange-400" />
                <span>{profile.currentStreak} วัน</span>
              </span>

              <button 
                id="mobile-header-settings"
                onClick={() => setActiveTab("settings")}
                className="text-gray-300 hover:text-white bg-white/10 p-1.5 rounded-full border border-white/15 active:scale-95 transition-all"
                title="ตั้งค่า"
              >
                <Sparkles size={14} className="text-yellow-400" />
              </button>
            </div>
          </header>

          {/* Active Routed View Component */}
          <div id="rendered-view-card" className="w-full">
            {renderActiveView()}
          </div>

        </div>
      </main>



      {/* Level Up Celebration Modal */}
      {levelUpModalData && (
        <LevelUpModal
          show={levelUpModalData.show}
          oldLevel={levelUpModalData.oldLevel}
          newLevel={levelUpModalData.newLevel}
          totalCoinsEarned={levelUpModalData.totalCoinsEarned}
          bonusXpEarned={levelUpModalData.bonusXpEarned}
          unlockedFeatures={levelUpModalData.unlockedFeatures}
          badgeEarned={levelUpModalData.badgeEarned}
          frameEarned={levelUpModalData.frameEarned}
          onClose={closeLevelUpModal}
        />
      )}

      {/* Web Cookie Consent & Privacy Preferences Overlay */}
      <CookieBanner
        forceOpenModal={forceOpenCookieModal}
        onCloseModal={() => setForceOpenCookieModal(false)}
      />

      {/* Online Remote Config & Version Checker */}
      <VersionAndRemoteConfigModal />

      {/* Offline Connectivity Screen */}
      {isOffline && (
        <OfflineMode
          onRetry={handleRetryOffline}
          isRetrying={isRetryingOffline}
        />
      )}

    </div>
  );
}
