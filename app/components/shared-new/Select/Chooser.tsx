import styled from "styled-components";

import { Side } from "../../../lib/types";
import { colors } from "../../../theme/theme-new";
import Button from "../AppButton";
import Selector from "../icons/Selector";

type Props = {
  className?: string;
  isOpen: boolean;
  label: string;
  noBorderSide?: Side;
  onClick: () => void;
};

const width = "180px";

function Chooser({
  className,
  label,
  noBorderSide,
  onClick,
}: Props): JSX.Element {
  return (
    <Button
      IconComponent={Selector}
      className={className}
      iconPosition="right"
      label={label}
      noBorderSide={noBorderSide}
      onClick={onClick}
      type="dark"
      width={width}
    />
  );
}

const StyledChooser = styled(Chooser)`
  ${(props) => props.isOpen && `border-color: ${colors.gray4};`}
`;

export default StyledChooser;
