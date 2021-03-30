import { Box } from "grommet";
import { Icon } from "grommet-icons";

import { ShortTrigger } from "../../lib/types";
import { edgeSize } from "../../theme/theme";
import Clock from "./icons/Clock";
import Plug from "./icons/Plug";
import Rocket from "./icons/Rocket";

type Props = { trigger: ShortTrigger | null };

const getTriggerIconComponent = (trigger: ShortTrigger): Icon => {
  if (trigger.deployment_provider) return Rocket;
  if (trigger.repeat_minutes) return Clock;

  return Plug;
};

export default function TriggerIcon({ trigger }: Props): JSX.Element {
  if (!trigger) return null;

  const IconComponent = getTriggerIconComponent(trigger);

  return (
    <Box margin={{ right: "xxsmall" }}>
      <IconComponent color={trigger.color} size={edgeSize.small} />
    </Box>
  );
}
