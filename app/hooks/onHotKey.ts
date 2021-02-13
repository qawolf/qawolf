import { useEffect } from "react";

type UseOnHotKey = {
  hotKey: string;
  onHotKey: (e?: KeyboardEvent) => void;
  requireMeta?: boolean;
};

export const useOnHotKey = ({
  hotKey,
  onHotKey,
  requireMeta,
}: UseOnHotKey): void => {
  useEffect(() => {
    const handleHotKey = (e: KeyboardEvent): void => {
      const isKeyboardShortcut = !requireMeta || e.ctrlKey || e.metaKey;
      if (!isKeyboardShortcut || e.key !== hotKey) return;

      onHotKey(e);
    };

    document.addEventListener("keydown", handleHotKey);

    return () => {
      document.removeEventListener("keydown", handleHotKey);
    };
  }, [hotKey, onHotKey, requireMeta]);
};
