import { Box, TextProps } from "grommet";
import styled from "styled-components";

import { breakpoints, edgeSize } from "../../theme/theme-new";
import Text from "../shared/Text";

type Props = {
  bottomMargin?: boolean;
  className?: string;
  detail: string;
  message: string;
  textAlign?: TextProps["textAlign"];
  topMargin?: boolean;
};

const StyledText = styled(Text)`
  margin-bottom: ${edgeSize.xxxsmall};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-bottom: ${edgeSize.xxsmall};
  }
`;

function DetailText({
  className,
  detail,
  message,
  textAlign,
}: Props): JSX.Element {
  const finalTextAlign = textAlign || "start";

  return (
    <Box className={className}>
      <StyledText
        color="textDark"
        size="medium"
        textAlign={finalTextAlign}
        weight="bold"
      >
        {message}
      </StyledText>
      <Text
        color="textLight"
        size="small"
        textAlign={finalTextAlign}
        weight="normal"
      >
        {detail}
      </Text>
    </Box>
  );
}

const StyledDetailText = styled(DetailText)`
  ${(props) =>
    props.bottomMargin &&
    `
  margin-bottom: ${edgeSize.medium};
  `}
  ${(props) =>
    props.topMargin &&
    `
  margin-top: ${edgeSize.large};
  `}

  @media screen and (min-width: ${breakpoints.small.value}px) {
    ${(props) =>
      props.bottomMargin &&
      `
    margin-bottom: ${edgeSize.large};
    `}
  }
`;

export default StyledDetailText;
