import { Box } from "grommet";
import capitalize from "lodash/capitalize";

import { useOnStripeCheckout } from "../../../hooks/onStripeCheckout";
import { routes } from "../../../lib/routes";
import { TeamWithUsers } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Text from "../../shared/Text";

type Props = { team: TeamWithUsers };

export default function Plan({ team }: Props): JSX.Element {
  const { isLoading, onClick } = useOnStripeCheckout();

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
        {team.plan === "free" && (
          <Box align="center" direction="row">
            <Button
              href={routes.pricing}
              label={copy.seePricing}
              margin={{ right: "small" }}
              type="secondary"
            />
            <Button
              isDisabled={isLoading}
              label={copy.upgrade}
              onClick={onClick}
              type="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
