import { Box } from "grommet";
import capitalize from "lodash/capitalize";

import { TeamWithUsers } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Text from "../../shared/Text";

type Props = { team: TeamWithUsers };

export default function Plan({ team }: Props): JSX.Element {
  const plan = capitalize(team.plan);

  return (
    <Box border={{ ...border, side: "bottom" }} pad={{ vertical: "medium" }}>
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.plan}
      </Text>
      <Text color="gray9" size="component">
        {plan}
      </Text>
    </Box>
  );
}
