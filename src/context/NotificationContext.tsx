import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  checkNotificationPermission,
  requestNotificationPermission,
  scheduleAllDailyArtistReminders,
  triggerImmediateNotification,
  getPendingScheduledNotifications,
  cancelNotificationById,
  cancelAllLocalNotifications,
  NotificationPermissionState,
  ScheduledNotificationInfo
} from "../services/notification";

interface NotificationContextType {
  permissionStatus: NotificationPermissionState;
  loading: boolean;
  pendingList: ScheduledNotificationInfo[];
  requestPermission: () => Promise<boolean>;
  scheduleDailyReminders: () => Promise<number>;
  triggerTestNotification: (title?: string, body?: string, category?: string) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  cancelNotification: (id: number) => Promise<boolean>;
  cancelAllNotifications: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  permissionStatus: "prompt",
  loading: true,
  pendingList: [],
  requestPermission: async () => false,
  scheduleDailyReminders: async () => 0,
  triggerTestNotification: async () => false,
  refreshStatus: async () => {},
  cancelNotification: async () => false,
  cancelAllNotifications: async () => false
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionState>("prompt");
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingList, setPendingList] = useState<ScheduledNotificationInfo[]>([]);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      const perm = await checkNotificationPermission();
      setPermissionStatus(perm);
      const pending = await getPendingScheduledNotifications();
      setPendingList(pending);
    } catch (e) {
      console.warn("Error refreshing notification status:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleRequestPermission = async (): Promise<boolean> => {
    setLoading(true);
    const result = await requestNotificationPermission();
    setPermissionStatus(result.status);
    if (result.granted) {
      // Automatically schedule daily local training reminders when permission granted
      await scheduleAllDailyArtistReminders();
      const pending = await getPendingScheduledNotifications();
      setPendingList(pending);
    }
    setLoading(false);
    return result.granted;
  };

  const handleScheduleDailyReminders = async (): Promise<number> => {
    setLoading(true);
    const count = await scheduleAllDailyArtistReminders();
    const pending = await getPendingScheduledNotifications();
    setPendingList(pending);
    setLoading(false);
    return count;
  };

  const handleTriggerTest = async (
    title: string = "🎤 เตือนซ้อมร้องเพลง (Vocal Training Test)",
    body: string = "ระบบ Local Notification บน iOS ทำงานสมบูรณ์แบบ! ทำงานภายในเครื่องโดยไม่ต้องผ่าน Server หรือ APNs",
    category: string = "Daily Training"
  ): Promise<boolean> => {
    const success = await triggerImmediateNotification(title, body, category);
    await refreshStatus();
    return success;
  };

  const handleCancelNotification = async (id: number): Promise<boolean> => {
    const success = await cancelNotificationById(id);
    await refreshStatus();
    return success;
  };

  const handleCancelAll = async (): Promise<boolean> => {
    const success = await cancelAllLocalNotifications();
    await refreshStatus();
    return success;
  };

  return (
    <NotificationContext.Provider
      value={{
        permissionStatus,
        loading,
        pendingList,
        requestPermission: handleRequestPermission,
        scheduleDailyReminders: handleScheduleDailyReminders,
        triggerTestNotification: handleTriggerTest,
        refreshStatus,
        cancelNotification: handleCancelNotification,
        cancelAllNotifications: handleCancelAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
