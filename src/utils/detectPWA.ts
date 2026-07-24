import { useState, useEffect } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;

  // Standalone mode check in modern browsers
  const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;

  // iOS Safari standalone check
  const isIOSStandalone = (window.navigator as any).standalone === true;

  // Android TWA check
  const isAndroidTWA = document.referrer.includes("android-app://");

  return isDisplayStandalone || isIOSStandalone || isAndroidTWA;
}

export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] Future Artist app was successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted install prompt");
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log("[PWA] User dismissed install prompt");
        return false;
      }
    } catch (err) {
      console.error("[PWA] Error triggering install prompt:", err);
      return false;
    }
  };

  return {
    isInstalled,
    isInstallable,
    deferredPrompt,
    promptInstall
  };
}
