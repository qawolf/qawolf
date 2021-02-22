import { Box, CheckBox as GrommetCheckBox, CheckBoxProps } from "grommet";
import styled from "styled-components";

import { colors, transitionDuration } from "../../theme/theme-new";

type Props = CheckBoxProps & {
  className?: string;
  onChange?: () => void;
};

function CheckBox({ className, ...props }: Props): JSX.Element {
  return (
    <Box className={className}>
      <GrommetCheckBox {...props} />
    </Box>
  );
}

// monkey patch
// https://github.com/grommet/grommet/blob/master/src/js/components/CheckBox/StyledCheckBox.js#L11
const StyledCheckBox = styled(CheckBox)`
  input:not([disabled]) + div,
  input:not([disabled]) + span {
    transition: border ${transitionDuration};
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
