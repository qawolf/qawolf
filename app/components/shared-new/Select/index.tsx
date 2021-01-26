import { Box, Button } from "grommet";
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
      <Button onClick={handleClick} plain>
        <Chooser isOpen={isOpen} label={label} />
      </Button>
      {isOpen && <Menu onClick={handleClose}>{children}</Menu>}
    </Box>
  );
}
