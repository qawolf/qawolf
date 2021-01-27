import { Box } from "grommet";
import { ReactNode, useState } from "react";

import { Side } from "../../../lib/types";
import Chooser from "./Chooser";
import Menu from "./Menu";

type Props = {
  children: ReactNode;
  label: string;
  noBorderSide?: Side;
};

export default function Select({
  children,
  label,
  noBorderSide,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  return (
    <Box style={{ position: "relative" }}>
      <Chooser
        isOpen={isOpen}
        label={label}
        noBorderSide={noBorderSide}
        onClick={handleClick}
      />
      {isOpen && <Menu onClick={handleClose}>{children}</Menu>}
    </Box>
  );
}
