import { RefObject, useEffect } from "react";

type UseOnClickOutside = {
  onClickOutside: () => void;
  ref: RefObject<HTMLDivElement>;
};

export const useOnClickOutside = ({
  onClickOutside,
  ref,
}: UseOnClickOutside): void => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (ref.current && !ref.current.contains(e.target as any)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};
