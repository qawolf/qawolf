import { Integration, TeamWithUsers } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import Channel from "./Channel";
import Schedule from "./Schedule";

type Props = {
  integrations: Integration[];
  team: TeamWithUsers;
};

export default function Alerts({ integrations, team }: Props): JSX.Element {
  return (
    <>
      <Text color="gray9" margin={{ bottom: "medium" }} size="componentLarge">
        {copy.alerts}
      </Text>
      <Schedule team={team} />
      <Channel integrations={integrations} team={team} />
    </>
  );
}
