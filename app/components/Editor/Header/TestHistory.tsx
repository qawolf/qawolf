import { Box } from "grommet";
import { useRef, useState } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import History from "../../shared/icons/History";
import RunList from "./RunList";

type Props = { testId: string | null };

export default function TestHistory({ testId }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Button
        a11yTitle={copy.history}
        IconComponent={History}
        onClick={handleClick}
        type="ghost"
      />
      {isOpen && <RunList onClose={handleClose} testId={testId} />}
    </Box>
  );
}
