import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";

import { useCreateSuite } from "../../../../hooks/mutations";
import { useIntegrations } from "../../../../hooks/queries";
import { routes } from "../../../../lib/routes";
import { Group } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import EnvVariableSettings from "../../../shared/EnvVariablesSettings";
import PlayButton from "../../../shared/PlayButton";
import { StateContext } from "../../../StateContext";
import GroupName from "./GroupName";
import SelectAlert from "./SelectAlert";
import SelectTrigger from "./SelectTrigger";

type Props = {
  group: Group;
  selectedIds: string[];
};

export default function Header({ group, selectedIds }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { replace } = useRouter();
  const [createSuite, { loading }] = useCreateSuite();

  const { data } = useIntegrations({ team_id: teamId || "" });

  const gitHubIntegrations = (data?.integrations || []).filter(
    (i) => i.type === "github"
  );
  const slackIntegrations = (data?.integrations || []).filter(
    (i) => i.type === "slack"
  );

  const handleClick = () => {
    createSuite({
      variables: { group_id: group.id, test_ids: selectedIds },
    }).then((response) => {
      const { data } = response || {};
      if (!data?.createSuite) return;

      replace(`${routes.tests}/${data.createSuite}`);
    });
  };

  return (
    <Box
      align="center"
      direction="row"
      flex={false}
      height={edgeSize.large}
      justify="between"
    >
      <Box align="center" direction="row">
        <GroupName group={group} />
        <EnvVariableSettings group={group} />
        <SelectTrigger group={group} integrations={gitHubIntegrations} />
        <SelectAlert group={group} integrations={slackIntegrations} />
      </Box>
      <PlayButton
        disabled={loading}
        message={copy.runGroup(selectedIds.length)}
        onClick={handleClick}
      />
    </Box>
  );
}
