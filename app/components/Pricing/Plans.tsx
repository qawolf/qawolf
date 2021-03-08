import { Box } from "grommet";
import styled from "styled-components";

import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import { breakpoints } from "../../theme/theme-new";
import Section from "../shared/Section";
import Text from "../shared/Text";
import OpenSource from "./OpenSource";
import Plan, { PlanType } from "./Plan";

const plans: PlanType[] = [
  {
    highlight: false,
    href: routes.signUp,
    label: copy.getStarted,
    name: "Starter",
    price: "Free",
    valueProps: [copy.oneTeamMember, copy.communitySupport],
  },
  {
    highlight: true,
    href: routes.signUp,
    label: copy.tryForFree,
    name: "Business",
    price: 40,
    valueProps: [copy.tenTeamMembers, copy.prioritySupport],
  },
  {
    highlight: false,
    href: "mailto:hello@qawolf.com",
    label: copy.contactUs,
    name: "Enterprise",
    price: "Custom",
    valueProps: [copy.onPremise, copy.dedicatedSupport],
  },
];

const StyledBox = styled(Box)`
  flex-direction: column;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export default function Plans(): JSX.Element {
  const plansHtml = plans.map((plan) => {
    return <Plan key={plan.name} plan={plan} />;
  });

  return (
    <Section background="white">
      <Text color="textDark" size="large" weight="bold">
        {copy.pricing}
      </Text>
      <StyledBox margin={{ bottom: "xlarge", top: "xxlarge" }} width="full">
        {plansHtml}
      </StyledBox>
      <Text color="textLight" size="xsmall" textAlign="center" weight="normal">
        {copy.subjectToFairUse}
      </Text>
      <OpenSource />
    </Section>
  );
}
