export interface PlatformInfo {
  isIOS: boolean;
  isIPhone: boolean;
  isIPad: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  platformName: "iOS" | "Android" | "Desktop";
  osVersion?: string;
}

export function detectPlatform(): PlatformInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isIOS: false,
      isIPhone: false,
      isIPad: false,
      isAndroid: false,
      isDesktop: true,
      platformName: "Desktop"
    };
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";

  // iOS Detection (iPhone, iPod, iPad including iPadOS 13+)
  const isIPhone = /iPhone|iPod/i.test(userAgent);
  const isIPadUA = /iPad/i.test(userAgent);
  const isMacTouch = /Macintosh/i.test(userAgent) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  const isIPad = isIPadUA || isMacTouch;
  const isIOS = isIPhone || isIPad;

  // Android Detection
  const isAndroid = /Android/i.test(userAgent);

  // Desktop
  const isDesktop = !isIOS && !isAndroid;

  let platformName: "iOS" | "Android" | "Desktop" = "Desktop";
  if (isIOS) platformName = "iOS";
  else if (isAndroid) platformName = "Android";

  // Extract OS version if possible
  let osVersion = "";
  if (isIOS) {
    const match = userAgent.match(/OS (\d+_\d+(?:_\d+)?)/);
    if (match) {
      osVersion = match[1].replace(/_/g, ".");
    }
  } else if (isAndroid) {
    const match = userAgent.match(/Android (\d+(?:\.\d+)?)/);
    if (match) {
      osVersion = match[1];
    }
  }

  return {
    isIOS,
    isIPhone,
    isIPad,
    isAndroid,
    isDesktop,
    platformName,
    osVersion
  };
}
