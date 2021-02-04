import { Box } from "grommet";
import { useContext, useState } from "react";
import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Header from "../../../shared-new/Modal/Header";
import Text from "../../../shared-new/Text";
import { StateContext } from "../../../StateContext";
import List from "./List";

type Props = {
  closeModal: () => void;
  onDelete: (environmentVariable: EnvironmentVariable) => void;
};

export default function Variables({
  closeModal,
  onDelete,
}: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);

  // have internal state for selected environment so editing variables
  // doesn't change environment id in global state
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    environmentId
  );

  return (
    <Box
      border={{ color: "gray3", side: "left", size: "xsmall" }}
      pad="medium"
      width="full"
    >
      <Header closeModal={closeModal} label={copy.envVariables} />
      <Text color="gray9" margin={{ top: "xxsmall" }} size="componentParagraph">
        {copy.envVariablesDetail}
      </Text>
      <List
        closeModal={closeModal}
        environmentId={selectedEnvironmentId}
        onDelete={onDelete}
      />
    </Box>
  );
}
