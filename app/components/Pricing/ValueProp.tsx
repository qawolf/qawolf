import { Box } from "grommet";
import { RiCheckFill } from "react-icons/ri";
import styled from "styled-components";

import {
  breakpoints,
  colors,
  edgeSize,
  text,
  textDesktop,
} from "../../theme/theme-new";
import Text from "../shared/Text";

type Props = { label: string };

const iconSize = "20px";

const StyledBox = styled(Box)`
  margin-top: calc((${text.xsmall.height} - ${iconSize}) / 2);

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-top: calc((${textDesktop.xsmall.height} - ${iconSize}) / 2);
  }
`;

export default function ValueProp({ label }: Props): JSX.Element {
  return (
    <Box align="start" direction="row" margin={{ bottom: "small" }}>
      <StyledBox
        align="center"
        background="primaryFill"
        flex={false}
        height={iconSize}
        justify="center"
        round="full"
        width={iconSize}
      >
        <RiCheckFill color={colors.white} size={edgeSize.small} />
      </StyledBox>
      <Text
        color="textLight"
        margin={{ left: "xxsmall" }}
        size="xsmall"
        weight="normal"
      >
        {label}
      </Text>
    </Box>
  );
}
