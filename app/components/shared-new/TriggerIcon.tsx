import { Box } from "grommet";

import { getTriggerIconComponent } from "../../lib/helpers";
import { ShortTrigger } from "../../lib/types";
import { edgeSize } from "../../theme/theme-new";

type Props = { trigger: ShortTrigger | null };

export default function TriggerIcon({ trigger }: Props): JSX.Element {
  if (!trigger) return null;

  const IconComponent = getTriggerIconComponent(trigger);

  return (
    <Box margin={{ right: "xxsmall" }}>
      <IconComponent color={trigger.color} size={edgeSize.small} />
    </Box>
  );
}
