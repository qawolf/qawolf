import { Box } from "grommet";
import { useRouter } from "next/router";

import { Trigger } from "../../../../../lib/types";
import { edgeSize } from "../../../../../theme/theme-new";
import TriggerBadge from "../../../../shared-new/TriggerBadge";

type Props = { triggers: Trigger[] };

export default function Triggers({ triggers }: Props): JSX.Element {
  const { pathname, replace } = useRouter();

  const handleTriggerClick = (triggerId: string): void => {
    replace(`${pathname}?trigger_id=${triggerId}`);
  };

  const triggersHtml = triggers.map((t) => {
    return (
      <TriggerBadge
        color={t.color}
        key={t.id}
        name={t.name}
        onClick={() => handleTriggerClick(t.id)}
      />
    );
  });

  return (
    <Box direction="row" gap={edgeSize.xxsmall} wrap>
      {triggersHtml}
    </Box>
  );
}
