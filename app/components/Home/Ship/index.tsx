import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { breakpoints } from "../../../theme/theme";
import Section from "../../shared/Section";
import HeaderText from "../HeaderText";
import ValueProp from "./ValueProp";
import WolfBug from "./WolfBug";
import WolfGem from "./WolfGem";
import WolfPresent from "./WolfPresent";

type Props = { className?: string };

const valueProps = [
  {
    IconComponent: WolfPresent,
    detail: copy.delightUsersDetail,
    message: copy.delightUsers,
  },
  {
    IconComponent: WolfGem,
    detail: copy.growRevenueDetail,
    message: copy.growRevenue,
  },
  {
    IconComponent: WolfBug,
    detail: copy.shipFeaturesDetail,
    message: copy.shipFeatures,
  },
];

const StyledBox = styled(Box)`
  flex-direction: column;
  width: 100%;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export default function Ship({ className }: Props): JSX.Element {
  const valuePropsHtml = valueProps.map((props, i) => {
    return <ValueProp key={i} {...props} />;
  });

  return (
    <Section>
      <HeaderText detail={copy.shipTagline} message={copy.ship} />
      <StyledBox className={className}>{valuePropsHtml}</StyledBox>
    </Section>
  );
}
