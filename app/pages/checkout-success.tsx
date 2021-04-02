import { Box } from "grommet";
import { useContext } from "react";
import Confetti from "react-confetti";

import Button from "../components/shared/AppButton";
import WolfParty from "../components/shared/icons/WolfParty";
import Text from "../components/shared/Text";
import { StateContext } from "../components/StateContext";
import { UserContext } from "../components/UserContext";
import { useEnsureUser } from "../hooks/ensureUser";
import { useWindowSize } from "../hooks/windowSize";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";
import { colors } from "../theme/theme";

const confettiColors = [
  colors.codeBlue,
  colors.codePink,
  colors.codePurple,
  colors.danger5,
  colors.darkYellow,
  colors.primary,
  colors.success5,
  colors.teal,
];

export default function CheckoutSuccess(): JSX.Element {
  useEnsureUser();
  const { height, width } = useWindowSize();

  const { dashboardUri } = useContext(StateContext);
  const { wolf } = useContext(UserContext);

  return (
    <Box align="center" margin={{ top: "xxlarge" }}>
      {!!width && (
        <Confetti colors={confettiColors} height={height} width={width} />
      )}
      {!!wolf && <WolfParty color={wolf.variant} />}
      <Text
        color="gray9"
        margin={{ bottom: "medium", top: "small" }}
        size="componentHeader"
        textAlign="center"
      >
        {copy.checkoutSuccess}
      </Text>
      <Button
        href={dashboardUri || routes.tests}
        label={copy.backToDashboard}
        type="primary"
      />
    </Box>
  );
}
