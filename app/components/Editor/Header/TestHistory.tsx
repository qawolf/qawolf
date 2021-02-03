import { useRef, useState } from "react";

import History from "../../shared-new/icons/History";
import Button from "../../shared-new/AppButton";
import { Box } from "grommet";
import RunList from "./RunList";
import { useOnClickOutside } from "../../../hooks/onClickOutside";

type Props = { testId: string | null };

export default function TestHistory({ testId }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Button IconComponent={History} onClick={handleClick} type="ghost" />
      {isOpen && <RunList onClose={handleClose} testId={testId} />}
    </Box>
  );
}
