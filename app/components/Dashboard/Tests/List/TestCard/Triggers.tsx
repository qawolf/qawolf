import { Box } from "grommet";
import { useRouter } from "next/router";

import { Trigger } from "../../../../../lib/types";
import { edgeSize } from "../../../../../theme/theme-new";
import TriggerBadge from "../../../../shared-new/TriggerBadge";
import { buildTestsPath } from "../../../helpers";

type Props = { triggers: Trigger[] };

export default function Triggers({ triggers }: Props): JSX.Element {
  const { replace, query } = useRouter();
  const groupId = query.group_id as string;

  const handleTriggerClick = (triggerId: string): void => {
    replace(`${buildTestsPath(groupId)}?trigger_id=${triggerId}`);
  };

  const triggersHtml = triggers.map((t) => {
    return (
      <TriggerBadge
        key={t.id}
        onClick={() => handleTriggerClick(t.id)}
        trigger={t}
      />
    );
  });

  return (
    <Box direction="row" gap={edgeSize.xxsmall} wrap>
      {triggersHtml}
    </Box>
  );
}
