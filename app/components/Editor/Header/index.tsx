import { Box, ResponsiveContext } from "grommet";
import { useContext } from "react";

import { UserContext } from "../../UserContext";
import { TestContext } from "../contexts/TestContext";
import { Mode } from "../hooks/mode";
import Buttons from "./Buttons";
import TestName from "./TestName";
import TestStatus from "./TestStatus";

const BASIS = "1/3";
const BASIS_LARGE = "1/2";
const BASIS_SMALL = "1/4";

type Props = {
  mode: Mode;
};

export default function Header({ mode }: Props): JSX.Element {
  const size = useContext(ResponsiveContext);
  const isLarge = size === "large";

  const { test } = useContext(TestContext);
  const { isUserLoading, user, wolf } = useContext(UserContext);

  // on screens where there is sufficient space, allow test name to take up half the size
  const centerBasis = isLarge ? BASIS_LARGE : BASIS;
  const sideBasis = isLarge ? BASIS_SMALL : BASIS;

  const hideWolf =
    isUserLoading || (user && !user.onboarded_at) || mode === "create";

  return (
    <Box
      align="center"
      as="header"
      direction="row"
      flex={false}
      justify="between"
      margin={{
        horizontal: isLarge ? undefined : "large",
        vertical: "large",
      }}
    >
      <Box basis={sideBasis}>
        <TestStatus hideWolf={hideWolf} isMobile={!isLarge} wolf={wolf} />
      </Box>
      <Box basis={centerBasis}>
        {!!test && <TestName isMobile={!isLarge} test={test} />}
      </Box>
      <Box basis={sideBasis}>
        <Buttons isMobile={!isLarge} />
      </Box>
    </Box>
  );
}
