export const isMac: boolean =
  typeof navigator !== "undefined" && !!/mac/i.exec(navigator.platform);

export const isServer = (): boolean => !isWindowDefined();

export const isSafari = (): boolean => {
  if (isServer()) return false;

  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isWindowDefined = (): boolean => {
  return typeof window !== "undefined";
};

export const isWindows: boolean =
  typeof navigator !== "undefined" && !!/win/i.exec(navigator.platform);

export const hasIntersectionObserver = (): boolean => {
  if (isServer()) return false;

  return (
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "isIntersecting" in (window.IntersectionObserverEntry.prototype || {})
  );
};
