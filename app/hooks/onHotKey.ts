import { useEffect } from "react";

type UseOnHotKey = {
  hotKey: string;
  ignoreInput?: boolean;
  onHotKey: (e?: KeyboardEvent) => void;
  requireMeta?: boolean;
};

export const useOnHotKey = ({
  hotKey,
  ignoreInput,
  onHotKey,
  requireMeta,
}: UseOnHotKey): void => {
  useEffect(() => {
    const handleHotKey = (e: KeyboardEvent): void => {
      if (
        ignoreInput &&
        (e.target as HTMLElement)?.tagName.toLowerCase() === "input"
      ) {
        // prevent typing in an input from triggering a keyboard shortcut
        return;
      }

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
