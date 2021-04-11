import { Box } from "grommet";
import kebabCase from "lodash/kebabCase";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { routes } from "../../lib/routes";
import { edgeSize, width } from "../../theme/theme";
import Text from "../shared/Text";

type Props = {
  date: string;
  imageUrl: string;
  title: string;
};

const StyledAnchor = styled.a`
  cursor: pointer;
  margin-bottom: ${edgeSize.medium};
  width: 100%;

  @media screen and (min-width: ${width.content}) {
    margin: 0 calc(${edgeSize.xlarge} / 2) ${edgeSize.xlarge};
    width: calc(50% - ${edgeSize.xlarge});
  }
`;

const StyledBox = styled(Box)`
  padding: ${edgeSize.medium};
  position: absolute;

  @media screen and (min-width: ${width.content}) {
    padding: ${edgeSize.xlarge};
  }
`;

export default function BlogLink({
  date,
  imageUrl,
  title,
}: Props): JSX.Element {
  const link = kebabCase(title);

  return (
    <Link href={`${routes.blog}/${link}`}>
      <StyledAnchor>
        <Box
          fill
          overflow="hidden"
          round="medium"
          style={{ position: "relative" }}
        >
          <Image alt={title} height={450} src={imageUrl} width={680} />
          <StyledBox
            background="rgba(23,23,76,0.72)"
            height="full"
            justify="between"
            width="full"
          >
            <Text color="white" size="large" weight="bold">
              {title}
            </Text>
            <Text color="white" size="small" weight="normal">
              {date}
            </Text>
          </StyledBox>
        </Box>
      </StyledAnchor>
    </Link>
  );
}
