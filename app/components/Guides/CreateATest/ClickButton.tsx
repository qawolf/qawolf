import { Box } from "grommet";
import { useEffect, useRef, useState } from "react";

import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";

type Props = { onClick: () => void };

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
    <Box alignSelf="center" margin={{ vertical: "medium" }}>
      <Button
        a11yTitle={copy.clickMe}
        label={isClicked ? copy.clickMeClicked : copy.clickMe}
        onClick={handleClick}
        size="medium"
      />
    </Box>
  );
}
