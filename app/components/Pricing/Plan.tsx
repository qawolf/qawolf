import { Box } from "grommet";
import styled from "styled-components";

import {
  borderSize,
  breakpoints,
  colors,
  edgeSize,
  text,
  textDesktop,
} from "../../theme/theme-new";
import Button from "../shared-new/Button";
import Paw from "../shared-new/icons/Paw";
import Text from "../shared-new/Text";
import Price from "./Price";

export type PlanType = {
  highlight: boolean;
  href: string;
  label: string;
  name: string;
  price: number | string;
  valueProps: string[];
};

type Props = { plan: PlanType };

const iconSize = edgeSize.small;

const StyledBox = styled(Box)`
  margin-bottom: ${edgeSize.medium};
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-bottom: 0;
    width: calc((100% - 2 * ${edgeSize.xlarge}) / 3);
  }
`;

const StyledPaw = styled(Paw)`
  margin-top: calc((${text.xsmall.height} - ${iconSize}) / 2);

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-top: calc((${textDesktop.xsmall.height} - ${iconSize}) / 2);
  }
`;

export default function Plan({ plan }: Props): JSX.Element {
  const { highlight, href, label, name, price, valueProps } = plan;

  const valuePropsHtml = valueProps.map((valueProp, i) => {
    return (
      <Box align="start" direction="row" key={i}>
        <StyledPaw color="primaryFill" size={iconSize} />
        <Text
          color="textLight"
          margin={{ left: "xxsmall" }}
          size="xsmall"
          weight="normal"
        >
          {valueProp}
        </Text>
      </Box>
    );
  });

  return (
    <StyledBox
      border={{
        color: highlight ? "primaryFill" : "fill30",
        size: borderSize.medium,
      }}
      pad="xlarge"
      round="xsmall"
    >
      <Text color={highlight ? "primaryFill" : "textLight"} size="eyebrow">
        {name}
      </Text>
      <Price price={price} />
      <Box gap="xxsmall" margin={{ bottom: "medium" }}>
        {valuePropsHtml}
      </Box>
      <Button
        borderColor={highlight ? undefined : colors.fill30}
        href={href}
        label={label}
        size="medium"
        type={highlight ? "primary" : "outlineDark"}
      />
    </StyledBox>
  );
}
