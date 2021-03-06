import { Box } from "grommet";

import { Team as TeamType } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";
import Invite from "./Invite";

type Props = { team: TeamType };

export default function Members({ team }: Props): JSX.Element {
  return (
    <Box pad={{ vertical: "medium" }}>
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.members}
      </Text>
      <Text color="gray9" margin={{ bottom: "xxsmall" }} size="componentBold">
        {copy.invite}
      </Text>
      <Invite />
    </Box>
  );
}
