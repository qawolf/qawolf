import { Box } from "grommet";
import NextImage from "next/image";
import styled from "styled-components";

import { breakpoints, edgeSize } from "../../theme/theme";
import Text from "../shared/Text";

type Props = {
  alt: string;
  caption?: string;
  height: number;
  src: string;
  width: number;
};

const StyledBox = styled(Box)`
  margin-top: ${edgeSize.small};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-top: ${edgeSize.medium};
  }
`;

export default function Image({
  alt,
  caption,
  height,
  src,
  width,
}: Props): JSX.Element {
  const isExternal = src.includes("https://");

  return (
    <StyledBox flex={false}>
      {isExternal ? (
        <img alt={alt} src={src} width="100%" />
      ) : (
        <NextImage alt={alt} height={height} src={src} width={width} />
      )}
      {!!caption && (
        <Text
          color="textLight"
          size="xsmall"
          style={{ fontStyle: "italic" }}
          textAlign="center"
          weight="normal"
        >
          {caption}
        </Text>
      )}
    </StyledBox>
  );
}
