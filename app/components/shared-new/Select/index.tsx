import { Box } from "grommet";
import { ReactNode, useRef, useState } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { Side } from "../../../lib/types";
import Button from "../../shared-new/AppButton";
import ArrowDown from "../icons/ArrowDown";
import Selector from "../icons/Selector";
import Menu, { Direction } from "../Menu";

type Type = "dark" | "light";

type Props = {
  children: ReactNode;
  direction?: Direction;
  isDisabled?: boolean;
  label: string;
  noBorderSide?: Side;
  type?: Type;
};

export default function Select({
  children,
  direction,
  isDisabled,
  label,
  noBorderSide,
  type,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }} width="full">
      <Button
        IconComponent={direction === "up" ? Selector : ArrowDown}
        iconPosition="right"
        isDisabled={isDisabled}
        label={label}
        noBorderSide={noBorderSide}
        onClick={handleClick}
        type={type === "dark" ? "dark" : "secondary"}
      />
      {isOpen && (
        <Menu direction={direction} onClick={handleClose}>
          {children}
        </Menu>
      )}
    </Box>
  );
}
