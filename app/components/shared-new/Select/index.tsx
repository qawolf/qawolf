import { Box } from "grommet";
import { ReactNode, useState } from "react";

import Chooser from "./Chooser";
import Menu from "./Menu";

type Props = {
  children: ReactNode;
  label: string;
};

export default function Select({ children, label }: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  return (
    <Box style={{ position: "relative" }}>
      <Chooser isOpen={isOpen} label={label} onClick={handleClick} />
      {isOpen && <Menu onClick={handleClose}>{children}</Menu>}
    </Box>
  );
}
