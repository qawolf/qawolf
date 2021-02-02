import { useState } from "react";

import History from "../../shared-new/icons/History";
import Button from "../../shared-new/AppButton";
import { Box } from "grommet";
import RunList from "./RunList";

export default function TestHistory(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  const handleClose = (): void => setIsOpen(false);

  return (
    <Box style={{ position: "relative" }}>
      <Button IconComponent={History} onClick={handleClick} type="ghost" />
      {isOpen && <RunList onClose={handleClose} />}
    </Box>
  );
}
