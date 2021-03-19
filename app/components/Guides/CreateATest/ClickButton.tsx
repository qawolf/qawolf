import { useEffect, useRef, useState } from "react";

import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";

type Props = { onClick: () => void };

const width = "98px"; // prevent resizing on click

export default function ClickButton({ onClick }: Props): JSX.Element {
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!isClicked) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      setIsClicked(false);
    }, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isClicked]);

  const handleClick = (): void => {
    setIsClicked(true);
    onClick();
  };

  return (
    <Button
      a11yTitle={copy.clickMe}
      isLarge
      justify="center"
      label={isClicked ? copy.clickMeClicked : copy.clickMe}
      onClick={handleClick}
      type="success"
      width={width}
    />
  );
}
