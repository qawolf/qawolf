import { Box } from "grommet";
import styled from "styled-components";

import { ValueProp } from "../../../lib/types";
import { breakpoints } from "../../../theme/theme";
import Section from "../../shared/Section";
import HeaderText from "../HeaderText";
import ProductGif from "../ProductVideo";
import ValueProps from "./ValueProps";

type Props = {
  className?: string;
  detail: string;
  href: string;
  isSecondary?: boolean;
  label: string;
  message: string;
  valueProps: ValueProp[];
  videoSrc: string;
};

function ProductSection({
  className,
  detail,
  isSecondary,
  href,
  label,
  message,
  valueProps,
  videoSrc,
}: Props): JSX.Element {
  const background = isSecondary ? "lightGray" : "white";

  return (
    <Section background={background}>
      <HeaderText detail={detail} message={message} />
      <Box align="center" className={className} justify="between" width="full">
        <ValueProps
          href={href}
          isSecondary={isSecondary}
          label={label}
          valueProps={valueProps}
        />
        <ProductGif
          background={isSecondary ? "darkYellow" : "teal"}
          reverse={isSecondary}
          src={videoSrc}
        />
      </Box>
    </Section>
  );
}

const StyledProductSection = styled(ProductSection)`
  flex-direction: column-reverse;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: ${(props) => (props.isSecondary ? "row-reverse" : "row")};
  }
`;

export default StyledProductSection;
