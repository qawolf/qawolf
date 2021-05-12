import { Box } from "grommet";

import { Suite } from "../../lib/types";
import { copy } from "../../theme/copy";
import { formatSuiteName } from "../Dashboard/helpers";
import Text from "./Text";
import TriggerIcon from "./TriggerIcon";

type Props = {
  suite: Suite | null;
};

export default function TriggerBadge({ suite }: Props): JSX.Element {
  const label = suite ? formatSuiteName(suite) : copy.loading;

  return (
    <Box align="center" direction="row" round="xlarge">
      <TriggerIcon isApi={suite?.is_api} trigger={suite?.trigger} />
      <Text color="gray9" size="component">
        {label}
      </Text>
    </Box>
  );
}
