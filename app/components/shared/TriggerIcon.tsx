import { Box } from "grommet";
import { Icon } from "grommet-icons";

import { ShortTrigger } from "../../lib/types";
import { colors, edgeSize } from "../../theme/theme";
import Clock from "./icons/Clock";
import Plug from "./icons/Plug";
import Rocket from "./icons/Rocket";

type Props = {
  isApi?: boolean;
  trigger: ShortTrigger | null;
};

const getTriggerIconComponent = (trigger: ShortTrigger | null): Icon => {
  if (trigger?.deployment_provider) return Rocket;
  if (trigger?.repeat_minutes) return Clock;

  return Plug;
};

export default function TriggerIcon({ isApi, trigger }: Props): JSX.Element {
  if (!isApi && !trigger) return null;

  const IconComponent = getTriggerIconComponent(trigger);

  return (
    <Box margin={{ right: "xxsmall" }}>
      <IconComponent
        color={trigger?.color || colors.primary}
        size={edgeSize.small}
      />
    </Box>
  );
}
