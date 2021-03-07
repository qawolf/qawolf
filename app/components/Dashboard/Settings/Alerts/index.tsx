import { TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";
import AddSlackChannel from "./AddSlackChannel";

type Props = { team: TeamWithUsers };

export default function Alerts({ team }: Props): JSX.Element {
  return (
    <>
      <Text color="gray9" margin={{ vertical: "medium" }} size="componentLarge">
        {copy.alerts}
      </Text>
      <AddSlackChannel teamId={team.id} />
    </>
  );
}
