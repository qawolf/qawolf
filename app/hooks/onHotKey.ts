import { useEffect } from "react";

type UseOnHotKey = {
  hotKey: string;
  onHotKey: () => void;
};

export const useOnHotKey = ({ hotKey, onHotKey }: UseOnHotKey): void => {
  useEffect(() => {
    const handleHotKey = (e: KeyboardEvent): void => {
      // const isKeyboardShortcut = e.ctrlKey || e.metaKey;
      if (e.key !== hotKey) return;

      onHotKey();
    };

    document.addEventListener("keydown", handleHotKey);

    return () => {
      document.removeEventListener("keydown", handleHotKey);
    };
  }, [hotKey, onHotKey]);
};
