import { Box } from "grommet";

import { useUpdateTeam } from "../../../hooks/mutations";
import { useTeam } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import EditableText from "../../shared/EditableText";
import Layer from "../../shared/Layer";
import Text from "../../shared/Text";
import Spinner from "../../shared-new/Spinner";
import Alerts from "./Alerts";
import Members from "./Members";

type Props = {
  closeModal: () => void;
  teamId: string;
};

const WIDTH = "640px";

// TODO: delete
export default function TeamSettings({
  closeModal,
  teamId,
}: Props): JSX.Element {
  const { data } = useTeam({ id: teamId });
  const [updateTeam] = useUpdateTeam();

  const team = data?.team || null;

  const handleChange = (name: string): void => {
    if (!team) return;

    updateTeam({
      optimisticResponse: {
        updateTeam: { ...team, name },
      },
      variables: { id: team.id, name },
    });
  };

  return (
    <Layer onClickOutside={closeModal} onEsc={closeModal}>
      <Box overflow={{ vertical: "auto" }} pad="large" width={WIDTH}>
        {team ? (
          <Box flex={false}>
            <Box align="center" direction="row" width="full">
              <Text
                color="gray"
                margin={{ right: "large" }}
                size="medium"
                style={{ whiteSpace: "nowrap" }}
              >
                {copy.teamName}
              </Text>
              <EditableText bold onChange={handleChange} value={team.name} />
            </Box>
            <Alerts team={team} />
            <Members invites={team.invites} users={team.users} />
          </Box>
        ) : (
          <Spinner />
        )}
      </Box>
    </Layer>
  );
}
