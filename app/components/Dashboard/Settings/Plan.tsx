import { Box } from "grommet";
import capitalize from "lodash/capitalize";

import { useOnStripeCheckout } from "../../../hooks/onStripeCheckout";
import { useOnStripePortal } from "../../../hooks/onStripePortal";
import { routes } from "../../../lib/routes";
import { TeamWithUsers } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Text from "../../shared/Text";

type Props = { team: TeamWithUsers };

const contactHref = "mailto:hello@qawolf.com";

export default function Plan({ team }: Props): JSX.Element {
  const {
    isLoading: isCheckoutLoading,
    onClick: onCheckoutClick,
  } = useOnStripeCheckout();
  const {
    isLoading: isPortalLoading,
    onClick: onPortalClick,
  } = useOnStripePortal();

  const isSubscribed = team.plan === "business";
  const showButtons = ["business", "free"].includes(team.plan);

  const plan = capitalize(team.plan);

  return (
    <Box border={{ ...border, side: "bottom" }} pad={{ vertical: "medium" }}>
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.plan}
      </Text>
      <Box align="center" direction="row" justify="between">
        <Text color="gray9" size="component">
          {plan}
        </Text>
        {showButtons && (
          <Box align="center" direction="row">
            <Button
              href={isSubscribed ? contactHref : routes.pricing}
              label={isSubscribed ? copy.contactUs : copy.seePricing}
              margin={{ right: "small" }}
              type="secondary"
            />
            <Button
              isDisabled={isCheckoutLoading || isPortalLoading}
              label={isSubscribed ? copy.manageBilling : copy.upgrade}
              onClick={isSubscribed ? onPortalClick : onCheckoutClick}
              type="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
