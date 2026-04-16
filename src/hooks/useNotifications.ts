import React from "react";

export type NotificationSettings = {
  enabled: boolean;
  dailyFocusReminder: boolean;
  overdueDigest: boolean;
  tomorrowPreview: boolean;
  reminderHour: number;
  reminderMinute: number;
};

const STORAGE_KEY = "forge_notification_settings";
const PROMPT_KEY = "forge_notification_prompt_dismissed";

const defaultSettings: NotificationSettings = {
  enabled: false,
  dailyFocusReminder: true,
  overdueDigest: true,
  tomorrowPreview: true,
  reminderHour: 19,
  reminderMinute: 0,
};

const getDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const getSentKey = (kind: string, date: Date) =>
  `forge_notification_sent_${kind}_${getDayKey(date)}`;

async function showAppNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const options = {
    body,
    tag,
    icon: "/pwa-icon.svg",
    badge: "/pwa-icon.svg",
    data: { url: "/" },
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  }

  new Notification(title, options);
}

export function useNotifications({
  allCalendarItems,
  getItemsForDate,
}: {
  allCalendarItems: any[];
  getItemsForDate: (date: Date) => any[];
}) {
  const [settings, setSettings] = React.useState<NotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      return defaultSettings;
    }
  });
  const [permission, setPermission] = React.useState<
    NotificationPermission | "unsupported"
  >(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  React.useEffect(() => {
    if (permission === "unsupported") return;
    if (permission !== "default") return;
    if (localStorage.getItem(PROMPT_KEY) === "true") return;

    const timer = window.setTimeout(() => {
      setShowPrompt(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [permission]);

  const requestPermission = React.useCallback(async () => {
    if (permission === "unsupported") return permission;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setSettings((prev) => ({ ...prev, enabled: true }));
      setShowPrompt(false);
      localStorage.removeItem(PROMPT_KEY);
    }
    return result;
  }, [permission]);

  const dismissPrompt = React.useCallback(() => {
    localStorage.setItem(PROMPT_KEY, "true");
    setShowPrompt(false);
  }, []);

  const updateSettings = React.useCallback(
    (updates: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const todayOpenCount = React.useMemo(
    () => getItemsForDate(new Date()).filter((item) => !item.done).length,
    [allCalendarItems, getItemsForDate],
  );

  const overdueCount = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allCalendarItems.filter((item) => {
      if (item.isHabit) return false;
      if (item.repeat && item.repeat !== "None") return false;
      if (item.done) return false;
      const due = item.due_date || item.deadline;
      if (!due) return false;
      const dueDate = new Date(due);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
  }, [allCalendarItems]);

  const tomorrowOpenCount = React.useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getItemsForDate(tomorrow).filter((item) => !item.done).length;
  }, [allCalendarItems, getItemsForDate]);

  React.useEffect(() => {
    if (permission !== "granted" || !settings.enabled) return;

    const maybeNotify = async () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const hasReachedDailyReminder =
        hour > settings.reminderHour ||
        (hour === settings.reminderHour && minute >= settings.reminderMinute);

      if (settings.dailyFocusReminder && hasReachedDailyReminder) {
        const key = getSentKey("daily_focus", now);
        if (!localStorage.getItem(key) && todayOpenCount > 0) {
          await showAppNotification(
            "Your day is still in motion",
            `You still have ${todayOpenCount} task${todayOpenCount === 1 ? "" : "s"} open today.`,
            "daily-focus",
          );
          localStorage.setItem(key, "true");
        }
      }

      if (settings.overdueDigest && hour >= 9) {
        const key = getSentKey("overdue_digest", now);
        if (!localStorage.getItem(key) && overdueCount > 0) {
          await showAppNotification(
            "You have overdue work waiting",
            `${overdueCount} item${overdueCount === 1 ? "" : "s"} are overdue and need attention.`,
            "overdue-digest",
          );
          localStorage.setItem(key, "true");
        }
      }

      if (settings.tomorrowPreview && hour >= 18) {
        const key = getSentKey("tomorrow_preview", now);
        if (!localStorage.getItem(key) && tomorrowOpenCount > 0) {
          await showAppNotification(
            "Tomorrow is already filling up",
            `${tomorrowOpenCount} item${tomorrowOpenCount === 1 ? "" : "s"} are due tomorrow.`,
            "tomorrow-preview",
          );
          localStorage.setItem(key, "true");
        }
      }
    };

    maybeNotify();
    const interval = window.setInterval(maybeNotify, 60000);
    return () => window.clearInterval(interval);
  }, [
    overdueCount,
    permission,
    settings,
    todayOpenCount,
    tomorrowOpenCount,
  ]);

  return {
    permission,
    settings,
    showPrompt,
    setShowPrompt,
    showSettings,
    setShowSettings,
    requestPermission,
    dismissPrompt,
    updateSettings,
    isSupported: permission !== "unsupported",
    todayOpenCount,
    overdueCount,
    tomorrowOpenCount,
  };
}
