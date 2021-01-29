import { BoxProps } from "grommet";
import styled from "styled-components";

import { Side } from "../../../lib/types";
import { colors } from "../../../theme/theme-new";
import Button from "../AppButton";
import ArrowDown from "../icons/ArrowDown";
import Selector from "../icons/Selector";

export type Direction = "down" | "up";
export type Type = "dark" | "light";

type Props = {
  className?: string;
  direction?: Direction;
  isOpen: boolean;
  label: string;
  noBorderSide?: Side;
  onClick: () => void;
  type?: Type;
  width?: BoxProps["width"];
};

function Chooser({
  className,
  direction,
  label,
  noBorderSide,
  onClick,
  type,
  width,
}: Props): JSX.Element {
  return (
    <Button
      IconComponent={direction === "up" ? Selector : ArrowDown}
      className={className}
      iconPosition="right"
      label={label}
      noBorderSide={noBorderSide}
      onClick={onClick}
      type={type === "dark" ? "dark" : "secondary"}
      width={width}
    />
  );
}

const StyledChooser = styled(Chooser)`
  ${(props) =>
    props.isOpen &&
    `border-color: ${props.type === "dark" ? colors.gray4 : colors.gray7};`}
`;

export default StyledChooser;
