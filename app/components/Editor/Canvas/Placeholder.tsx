import { Box } from "grommet";
import { ReactNode, useContext } from "react";

import { copy } from "../../../theme/copy";
import Paw from "../../shared/icons/Paw";
import Text from "../../shared-new/Text";
import { UserContext } from "../../UserContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { Mode } from "../hooks/mode";
import WolfSitting from "../../shared-new/icons/WolfSitting";

type Props = {
  height?: number;
  mode: Mode;
  width?: number;
};

const iconProps = { color: "white", size: "large" };

export default function Placeholder({
  height,
  mode,
  width,
}: Props): JSX.Element {
  const { isTestLoading } = useContext(TestContext);
  const { isUserLoading, wolf } = useContext(UserContext);
  const { isRunnerConnected, shouldRequestRunner } = useContext(RunnerContext);

  // default to loading
  let message = copy.loading;

  let iconHtml: ReactNode = <Paw {...iconProps} />;
  if (wolf) {
    iconHtml = <WolfSitting animate color={wolf.variant} />;
  } else if (isUserLoading) {
    // if the user is loading do not include an icon
    // to prevent a jarring change when the wolf loads
    iconHtml = null;
  }

  // ask the user to run the test if there is no runner connected or pending
  if (
    mode === "test" &&
    !isRunnerConnected &&
    !isTestLoading &&
    !shouldRequestRunner
  ) {
    iconHtml = null;
    message = copy.placeholderRunTest;
  }

  const pad = height && width ? undefined : { vertical: "xxlarge" };

  return (
    <Box
      align="center"
      background="gray0"
      height={height ? `${height}px` : undefined}
      justify="center"
      pad={pad}
      width={width ? `${width}px` : undefined}
    >
      {iconHtml}
      <Text color="gray9" margin={{ top: "medium" }} size="componentHeader">
        {message}
      </Text>
    </Box>
  );
}
