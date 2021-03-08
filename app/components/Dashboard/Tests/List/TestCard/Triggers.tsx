import { Box } from "grommet";
import { useRouter } from "next/router";

import { Trigger } from "../../../../../lib/types";
import { edgeSize } from "../../../../../theme/theme";
import TriggerBadge from "../../../../shared/TriggerBadge";
import { buildTestsPath } from "../../../helpers";

type Props = { triggers: Trigger[] };

export default function Triggers({ triggers }: Props): JSX.Element {
  const { replace, query } = useRouter();
  const groupId = (query.group_id as string) || null;

  const handleTriggerClick = (triggerId: string): void => {
    replace(buildTestsPath(groupId, triggerId));
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
