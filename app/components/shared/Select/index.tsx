import { Box, BoxProps } from "grommet";
import { ReactNode, useRef, useState } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { Side } from "../../../lib/types";
import Button from "../AppButton";
import ArrowDown from "../icons/ArrowDown";
import Selector from "../icons/Selector";
import Menu, { Direction } from "../Menu";

type Type = "dark" | "light";

type Props = {
  children: ReactNode[];
  direction?: Direction;
  flex?: BoxProps["flex"];
  hasError?: boolean;
  isDisabled?: boolean;
  label: string;
  noBorderSide?: Side;
  type?: Type;
  width?: BoxProps["width"];
};

export default function Select({
  children,
  direction,
  flex,
  hasError,
  isDisabled,
  label,
  noBorderSide,
  type,
  width,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    if (!children.length) return;
    setIsOpen((prev) => !prev);
  };

  const handleClose = (): void => setIsOpen(false);

  useOnClickOutside({ onClickOutside: handleClose, ref });

  return (
    <Box
      flex={flex}
      ref={ref}
      style={{ position: "relative" }}
      width={width || "full"}
    >
      <Button
        IconComponent={direction === "up" ? Selector : ArrowDown}
        iconPosition="right"
        hasError={hasError}
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
