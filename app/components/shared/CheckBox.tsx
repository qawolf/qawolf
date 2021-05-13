import {
  Box,
  BoxProps,
  CheckBox as GrommetCheckBox,
  CheckBoxProps,
} from "grommet";
import styled from "styled-components";

import { borderSize, colors, transitionDuration } from "../../theme/theme";

export type Props = CheckBoxProps & {
  className?: string;
  hasError?: boolean;
  onChange?: () => void;
  pad?: BoxProps["pad"];
  width?: BoxProps["width"];
};

function CheckBox({ className, pad, width, ...props }: Props): JSX.Element {
  return (
    <Box
      className={className}
      flex={false}
      pad={pad}
      round={borderSize.small}
      width={width}
    >
      <GrommetCheckBox {...props} />
    </Box>
  );
}

// monkey patch
// https://github.com/grommet/grommet/blob/master/src/js/components/CheckBox/StyledCheckBox.js#L11
const StyledCheckBox = styled(CheckBox)`
  &:hover {
    input:not([disabled]) + div,
    input:not([disabled]) + span {
      ${(props) =>
        props.checked
          ? `background: ${colors.primaryDark}; border-color: ${colors.primaryDark};`
          : `border-color: ${colors.gray6};`}
    }
  }

  &:active {
    input:not([disabled]) + div,
    input:not([disabled]) + span {
      ${(props) =>
        props.checked
          ? `background: ${colors.primaryDarker}; border-color: ${colors.primaryDarker};`
          : `border-color: ${colors.gray9};`}
    }
  }

  input:not([disabled]) + div,
  input:not([disabled]) + span {
    background: ${(props) => (props.checked ? colors.primary : "transparent")};
    border-radius: ${borderSize.small};
    transition: background ${transitionDuration}, border ${transitionDuration};

    svg {
      fill: ${colors.gray0};
    }

    ${(props) =>
      props.hasError && !props.checked && `border-color: ${colors.danger5};`}
  }

  ${(props) =>
    props.indeterminate &&
    `
    svg {
      stroke: ${colors.gray6};
    }
  `}
`;

export default StyledCheckBox;
