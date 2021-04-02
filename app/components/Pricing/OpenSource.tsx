import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../theme/copy";
import { breakpoints, colors, edgeSize } from "../../theme/theme";
import Button from "../shared/Button";
import Text from "../shared/Text";

const href = "mailto:hello@qawolf.com";

const StyledBox = styled(Box)`
  margin-top: ${edgeSize.xxxlarge};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-top: 80px;
  }
`;

export default function OpenSource(): JSX.Element {
  return (
    <StyledBox
      align="center"
      background="fill0"
      margin={{ top: "80px" }}
      pad={{ horizontal: "medium", vertical: "xlarge" }}
      round="xsmall"
      width="full"
    >
      <Text
        color="textDark"
        margin={{ bottom: "xxsmall" }}
        size="large"
        textAlign="center"
        weight="bold"
      >
        {copy.loveOpenSource}
      </Text>
      <Text color="textLight" size="small" textAlign="center" weight="normal">
        {copy.openSourceDiscount}
      </Text>
      <Button
        borderColor={colors.fill30}
        href={href}
        label={copy.getInTouch}
        margin={{ top: "medium" }}
        size="medium"
        type="outlineDark"
      />
    </StyledBox>
  );
}
