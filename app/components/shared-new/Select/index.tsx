import { Box, BoxProps } from "grommet";
import { ReactNode, useRef, useState } from "react";
import { useOnClickOutside } from "../../../hooks/onClickOutside";

import { Side } from "../../../lib/types";
import Chooser, { Direction, Type } from "./Chooser";
import Menu from "./Menu";

type Props = {
  children: ReactNode;
  direction?: Direction;
  label: string;
  noBorderSide?: Side;
  type?: Type;
  width?: BoxProps["width"];
};

export default function Select({ children, ...props }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Chooser {...props} isOpen={isOpen} onClick={handleClick} />
      {isOpen && (
        <Menu direction={props.direction} onClick={handleClose}>
          {children}
        </Menu>
      )}
    </Box>
  );
}
