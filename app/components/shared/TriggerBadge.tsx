import { Box } from "grommet";

import { ShortTrigger } from "../../lib/types";
import { copy } from "../../theme/copy";
import Text from "./Text";
import TriggerIcon from "./TriggerIcon";

type Props = {
  isLoading?: boolean;
  trigger: ShortTrigger | null;
};

export default function TriggerBadge({
  isLoading,
  trigger,
}: Props): JSX.Element {
  let label = copy.manuallyTriggered;
  if (trigger?.name) label = trigger.name;
  else if (isLoading) label = copy.loading;

  return (
    <Box align="center" direction="row" round="xlarge">
      <TriggerIcon trigger={trigger} />
      <Text color="gray9" size="component">
        {label}
      </Text>
    </Box>
  );
}
