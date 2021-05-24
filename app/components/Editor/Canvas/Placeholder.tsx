import { Box } from "grommet";
import { ReactNode, useContext } from "react";

import { copy } from "../../../theme/copy";
import Paw from "../../shared/icons/Paw";
import WolfButton from "../../shared/icons/WolfButton";
import WolfSitting from "../../shared/icons/WolfSitting";
import Text from "../../shared/Text";
import { UserContext } from "../../UserContext";
import { EditorContext } from "../contexts/EditorContext";
import { RunnerContext } from "../contexts/RunnerContext";

type Props = {
  height?: number;
  width?: number;
};

const iconProps = { color: "white", size: "large" };

export default function Placeholder({ height, width }: Props): JSX.Element {
  const { isLoaded, runId } = useContext(EditorContext);
  const { isUserLoading, wolf } = useContext(UserContext);
  const { isRunnerConnected, requestTestRunner } = useContext(RunnerContext);

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
  if (isLoaded && !runId && !isRunnerConnected && !requestTestRunner) {
    iconHtml = <WolfButton color={wolf?.variant} />;
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
