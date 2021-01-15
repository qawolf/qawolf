import { Box } from "grommet";
import styled from "styled-components";

import {
  breakpoints,
  edgeSize,
  text,
  textDesktop,
} from "../../theme/theme-new";
import Text from "../shared-new/Text";

type Props = { error?: string };

const StyledBox = styled(Box)`
  height: ${text.xsmall.height};
  margin-top: ${edgeSize.xxsmall};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    height: ${textDesktop.xsmall.height};
  }
`;

export default function CodeError({ error }: Props): JSX.Element {
  // prevent height from changing if error appears
  if (!error) return <StyledBox />;

  return (
    <Box>
      <Text
        color="error"
        margin={{ top: "xxsmall" }}
        size="xsmall"
        weight="medium"
      >
        {error}
      </Text>
    </Box>
  );
}
