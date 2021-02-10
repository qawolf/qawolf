import { useEffect } from "react";

type UseOnHotKey = {
  hotKey: string;
  onHotKey: () => void;
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

      onHotKey();
    };

    document.addEventListener("keydown", handleHotKey);

    return () => {
      document.removeEventListener("keydown", handleHotKey);
    };
  }, [hotKey, onHotKey]);
};
