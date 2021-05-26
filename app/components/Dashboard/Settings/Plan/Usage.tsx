import { Box } from "grommet";
import isNil from "lodash/isNil";

import { useRunCount } from "../../../../hooks/queries";
import { dateToText, formatBill } from "../../../../lib/helpers";
import { TeamWithUsers } from "../../../../lib/types";
import { daysFromNow } from "../../../../shared/utils";
import { copy } from "../../../../theme/copy";
import Meter from "../../../shared/Meter";
import Text from "../../../shared/Text";

type Props = { team: TeamWithUsers };

const getMaxRuns = (plan: TeamWithUsers["plan"], runCount: number): number => {
  if (plan !== "business") return 100;
  if (runCount <= 1000) return 1000;

  return Math.ceil(runCount / 500) * 500;
};

export default function Usage({ team }: Props): JSX.Element {
  const { data } = useRunCount({ team_id: team.id });
  const runCount = isNil(data?.runCount) ? null : data.runCount;

  if (runCount === null) return null;

  const max = getMaxRuns(team.plan, runCount);

  const renewsAt = dateToText(daysFromNow(30, Number(team.renewed_at)));
  const bill = formatBill(team, runCount);

  return (
    <Box margin={{ top: "medium" }}>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentBold">
        {copy.testRuns}
      </Text>
      <Box
        align="center"
        direction="row"
        justify="between"
        margin={{ bottom: "xxsmall" }}
      >
        <Text color="gray9" size="component">
          {`${copy.resetsOn} ${renewsAt}${bill}`}
        </Text>
        <Text color="gray9" size="component">
          {`${runCount} / ${max}`}
        </Text>
      </Box>
      <Meter a11yTitle={copy.testRuns} max={max} value={runCount} />
    </Box>
  );
}
