import styled from "styled-components";

import { colors } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Select from "../../shared/icons/Select";

type Props = {
  className?: string;
  isActive: boolean;
  isDisabled: boolean;
};

function SelectButton({ className, isDisabled }: Props): JSX.Element {
  // TODO: fill out
  const handleClick = (): void => {};

  return (
    <Button
      IconComponent={Select}
      a11yTitle="choose element"
      className={className}
      isDisabled={isDisabled}
      onClick={handleClick}
      type="ghost"
    />
  );
}

const StyledSelectButton = styled(SelectButton)`
  ${(props) =>
    props.isActive &&
    `
    background: ${colors.primaryLight};
    border: 1px solid ${colors.primary};

    svg {
        fill: ${colors.primary};
    }

    &:hover {
        border-color: ${colors.primaryDark};

        svg {
            fill: ${colors.primaryDark};
        }
    }

    &:active {
        border-color: ${colors.primaryDarker};

        svg {
            fill: ${colors.primaryDarker};
        }
    }
    `}
`;

export default StyledSelectButton;
