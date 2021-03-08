import { Box } from "grommet";

import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Header from "../../../shared/Modal/Header";
import Text from "../../../shared/Text";
import List from "./List";

type Props = {
  closeModal: () => void;
  environmentId: string;
  onDelete: (environmentVariable: EnvironmentVariable) => void;
};

export default function Variables({
  closeModal,
  environmentId,
  onDelete,
}: Props): JSX.Element {
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
        environmentId={environmentId}
        onDelete={onDelete}
      />
    </Box>
  );
}
