import { Box, CheckBox as GrommetCheckBox, CheckBoxProps } from "grommet";
import styled from "styled-components";

import { borderSize, colors, transitionDuration } from "../../theme/theme-new";

type Props = CheckBoxProps & {
  className?: string;
  onChange?: () => void;
};

function CheckBox({ className, ...props }: Props): JSX.Element {
  return (
    <Box className={className} round={borderSize.small}>
      <GrommetCheckBox {...props} />
    </Box>
  );
}

// monkey patch
// https://github.com/grommet/grommet/blob/master/src/js/components/CheckBox/StyledCheckBox.js#L11
const StyledCheckBox = styled(CheckBox)`
  background: ${colors.gray0};

  input:not([disabled]) + div,
  input:not([disabled]) + span {
    background: ${(props) => (props.checked ? colors.primary : "transparent")};
    border-radius: ${borderSize.small};
    transition: background ${transitionDuration}, border ${transitionDuration};

    svg {
      fill: ${colors.gray0};
    }

    &:hover {
      ${(props) =>
        props.checked
          ? `background: ${colors.primaryDark}; border-color: ${colors.primaryDark};`
          : `border-color: ${colors.gray6};`}
    }

    &:active {
      ${(props) =>
        props.checked
          ? `background: ${colors.primaryDarker}; border-color: ${colors.primaryDarker};`
          : `border-color: ${colors.gray9};`}
    }
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
