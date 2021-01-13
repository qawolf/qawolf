import { Box } from "grommet";

import { SelectedGroup } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Layer from "../../shared/Layer";
import Text from "../../shared/Text";
import CreateEnvVariable from "./CreateEnvVariable";
import EnvVariablesList from "./EnvVariablesList";

type Props = {
  closeModal: () => void;
  group: SelectedGroup;
};

const WIDTH = "640px";

export default function EnvVariables({
  closeModal,
  group,
}: Props): JSX.Element {
  return (
    <Layer onClickOutside={closeModal} onEsc={closeModal}>
      <Box pad="large" width={WIDTH}>
        <Text
          color="black"
          margin={{ bottom: "small" }}
          size="large"
          weight="bold"
        >
          {`${copy.envVariables}: ${group.name}`}
        </Text>
        <Text color="gray" size="small">
          {copy.envVariablesDetail}
        </Text>
        <EnvVariablesList group={group} />
        <CreateEnvVariable groupId={group.id} />
      </Box>
    </Layer>
  );
}
