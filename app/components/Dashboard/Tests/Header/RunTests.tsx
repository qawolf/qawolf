import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../../../theme/copy";
import {
  borderSize,
  colors,
  transitionDuration,
} from "../../../../theme/theme-new";
import Button from "../../../shared-new/AppButton";
import ArrowDown from "../../../shared-new/icons/ArrowDown";
import Play from "../../../shared-new/icons/Play";

const dividerId = "run-tests-divider";

const StyledBox = styled(Box)`
  #${dividerId} {
    transition: background ${transitionDuration};
  }

  &:hover {
    #${dividerId} {
      background: ${colors.gray5};
    }
  }

  &:active {
    #${dividerId} {
      background: ${colors.gray7};
    }
  }
`;

export default function RunTests(): JSX.Element {
  return (
    <StyledBox direction="row" margin={{ right: "small" }}>
      <Button
        IconComponent={Play}
        a11yTitle={copy.runTests}
        label={copy.runTests}
        noBorderSide="right"
        type="secondary"
      />
      <Box background={colors.gray3} id={dividerId} width={borderSize.xsmall} />
      <Button
        a11yTitle="choose environment"
        IconComponent={ArrowDown}
        noBorderSide="left"
        type="secondary"
      />
    </StyledBox>
  );
}
