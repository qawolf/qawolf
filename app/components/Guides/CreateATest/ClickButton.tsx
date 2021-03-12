import { Box } from "grommet";
import { useEffect, useRef, useState } from "react";

import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";
import { width } from "./NextButton";

export default function ClickButton(): JSX.Element {
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

  const handleClick = (): void => setIsClicked(true);

  return (
    <Box alignSelf="center" margin={{ vertical: "medium" }}>
      <Button
        a11yTitle={copy.clickMe}
        label={isClicked ? copy.clickMeClicked : copy.clickMe}
        onClick={handleClick}
        size="medium"
        width={width}
      />
    </Box>
  );
}
