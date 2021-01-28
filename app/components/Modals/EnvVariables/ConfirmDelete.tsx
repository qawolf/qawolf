import { Box } from "grommet";

import { useDeleteEnvironmentVariable } from "../../../hooks/mutations";
import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize, overflowStyle } from "../../../theme/theme-new";
import Divider from "../../shared-new/Divider";
import ModalConfirmDelete from "../../shared-new/ModalConfirmDelete";
import Text from "../../shared-new/Text";

type Props = {
  environmentVariable: EnvironmentVariable;
  onCancelClick: () => void;
};

export default function ConfirmDelete({
  environmentVariable,
  onCancelClick,
}: Props): JSX.Element {
  const [
    deleteEnvironmentVariable,
    { loading },
  ] = useDeleteEnvironmentVariable();

  const handleDeleteClick = (): void => {
    deleteEnvironmentVariable({
      variables: { id: environmentVariable.id },
      // return to main screen after envrionment variable deleted
    }).then(onCancelClick);
  };

  return (
    <ModalConfirmDelete
      isDeleteDisabled={loading}
      onCancelClick={onCancelClick}
      onDeleteClick={handleDeleteClick}
    >
      <Text
        color="gray9"
        margin={{ bottom: "medium", top: "xxsmall" }}
        size="componentParagraph"
      >
        {copy.envVariableDeleteConfirm}
      </Text>
      <Divider />
      <Box
        align="center"
        direction="row"
        gap="xxsmall"
        pad={{ vertical: "small" }}
      >
        <Box flex={false} width={`calc(50% - (${edgeSize.xxsmall} / 2))`}>
          <Text color="gray9" size="component" style={overflowStyle}>
            {environmentVariable.name}
          </Text>
        </Box>
        <Box>
          <Text color="gray9" size="component" style={overflowStyle}>
            {environmentVariable.value}
          </Text>
        </Box>
      </Box>
      <Divider />
    </ModalConfirmDelete>
  );
}
