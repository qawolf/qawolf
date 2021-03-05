import {
  Box,
  RadioButton as GrommetRadioButton,
  RadioButtonProps,
} from "grommet";
import { ChangeEvent } from "react";
import styled from "styled-components";

import { colors, transitionDuration } from "../../theme/theme-new";

type Props = RadioButtonProps & {
  className?: string;
  onChange: (e?: ChangeEvent<HTMLInputElement>) => void;
  value?: number | string;
};

function RadioButton({ className, ...props }: Props): JSX.Element {
  return (
    <Box className={className}>
      <GrommetRadioButton {...props} />
    </Box>
  );
}

const StyledRadioButton = styled(RadioButton)`
  input:not([disabled]) + div,
  input:not([disabled]) + span {
    svg {
      transition: fill ${transitionDuration};
    }
  }

  &:hover {
    input:not([disabled]) + div,
    input:not([disabled]) + span {
      border-color: ${(props) =>
        props.checked ? colors.primaryDark : colors.gray6};

      svg {
        fill: ${colors.primaryDark};
      }
    }
  }

  &:active {
    input:not([disabled]) + div,
    input:not([disabled]) + span {
      border-color: ${(props) =>
        props.checked ? colors.primaryDarker : colors.gray9};

      svg {
        fill: ${colors.primaryDarker};
      }
    }
  }
`;

export default StyledRadioButton;
