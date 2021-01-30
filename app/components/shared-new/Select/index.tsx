import { Box, BoxProps } from "grommet";
import { ReactNode, useRef, useState } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { Side } from "../../../lib/types";
import Button from "../../shared-new/AppButton";
import ArrowDown from "../icons/ArrowDown";
import Selector from "../icons/Selector";
import Menu from "./Menu";

export type Direction = "down" | "up";
type Type = "dark" | "light";

type Props = {
  children: ReactNode;
  direction?: Direction;
  label: string;
  noBorderSide?: Side;
  type?: Type;
  width?: BoxProps["width"];
};

export default function Select({
  children,
  direction,
  label,
  noBorderSide,
  type,
  width,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Button
        IconComponent={direction === "up" ? Selector : ArrowDown}
        iconPosition="right"
        label={label}
        noBorderSide={noBorderSide}
        onClick={handleClick}
        type={type === "dark" ? "dark" : "secondary"}
        width={width}
      />
      {isOpen && (
        <Menu direction={direction} onClick={handleClose}>
          {children}
        </Menu>
      )}
    </Box>
  );
}
