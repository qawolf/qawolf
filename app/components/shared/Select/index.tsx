import { Box, BoxProps, DropProps } from "grommet";
import { ReactNode, useRef, useState } from "react";

import { Side } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";
import Button from "../AppButton";
import Drop from "../Drop";
import ArrowDown from "../icons/ArrowDown";
import Selector from "../icons/Selector";
import { Direction } from "../Menu";

type Type = "dark" | "secondary" | "snippet";

type Props = {
  children: ReactNode[];
  className?: string;
  direction?: Direction;
  flex?: BoxProps["flex"];
  hasError?: boolean;
  isDisabled?: boolean;
  label: string;
  noBorderSide?: Side;
  stretch?: DropProps["stretch"];
  type?: Type;
  width?: BoxProps["width"];
};

export default function Select({
  children,
  className,
  direction,
  flex,
  hasError,
  isDisabled,
  label,
  noBorderSide,
  stretch,
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

  return (
    <Box
      flex={flex}
      ref={ref}
      style={{ position: "relative" }}
      width={width || "full"}
    >
      <Button
        IconComponent={direction === "up" ? Selector : ArrowDown}
        className={className}
        iconPosition="right"
        hasError={hasError}
        isDisabled={isDisabled}
        label={label}
        noBorderSide={noBorderSide}
        onClick={handleClick}
        type={type || "secondary"}
      />
      {isOpen && (
        <Drop
          align={direction === "up" ? { bottom: "top" } : { top: "bottom" }}
          onClick={handleClose}
          onClickOutside={handleClose}
          stretch={stretch || true}
          style={
            direction === "up"
              ? { marginBottom: edgeSize.xxxsmall }
              : { marginTop: edgeSize.xxxsmall }
          }
          target={ref.current}
        >
          {children}
        </Drop>
      )}
    </Box>
  );
}
