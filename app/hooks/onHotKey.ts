import { useEffect } from "react";

type UseOnHotKey = {
  hotKey: string;
  ignoreInput?: boolean;
  onHotKey: (e?: KeyboardEvent) => void;
  requireMeta?: boolean;
};

const isTextInput = (element: EventTarget): boolean => {
  if (!(element as HTMLElement)?.tagName) return false;
  if ((element as HTMLElement).tagName.toLowerCase() !== "input") return false;

  return (element as HTMLInputElement).type === "text";
};

export const useOnHotKey = ({
  hotKey,
  ignoreInput,
  onHotKey,
  requireMeta,
}: UseOnHotKey): void => {
  useEffect(() => {
    const handleHotKey = (e: KeyboardEvent): void => {
      if (ignoreInput && isTextInput(e.target)) {
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
  }, [ignoreInput, hotKey, onHotKey, requireMeta]);
};
