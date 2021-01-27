import styled from "styled-components";

import { colors, edgeSize } from "../../../theme/theme-new";
import Button from "../AppButton";
import Selector from "../icons/Selector";

type Props = {
  className?: string;
  isOpen: boolean;
  label: string;
  onClick: () => void;
};

const width = "180px";

function Chooser({ className, label, onClick }: Props): JSX.Element {
  return (
    <Button
      IconComponent={Selector}
      className={className}
      iconPosition="right"
      label={label}
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
