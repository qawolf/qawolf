import { Box, CheckBox as GrommetCheckBox, CheckBoxProps } from "grommet";
import styled from "styled-components";

import { transitionDuration } from "../../theme/theme-new";

// monkey patch
// https://github.com/grommet/grommet/blob/master/src/js/components/CheckBox/StyledCheckBox.js#L11
const StyledBox = styled(Box)`
  input:not([disabled]) + div,
  input:not([disabled]) + span {
    transition: border ${transitionDuration};
  }
`;

export default function CheckBox(props: CheckBoxProps): JSX.Element {
  return (
    <StyledBox>
      <GrommetCheckBox {...props} />
    </StyledBox>
  );
}
