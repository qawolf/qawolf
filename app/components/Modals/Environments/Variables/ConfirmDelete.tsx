import { Box } from "grommet";

import { useDeleteEnvironmentVariable } from "../../../../hooks/mutations";
import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize, overflowStyle } from "../../../../theme/theme-new";
import Divider from "../../../shared-new/Divider";
import ConfirmDelete from "../../../shared-new/Modal/ConfirmDelete";
import Header from "../../../shared-new/Modal/Header";
import Text from "../../../shared-new/Text";

type Props = {
  closeModal: () => void;
  environmentVariable: EnvironmentVariable;
  onClose: () => void;
};

export default function ConfirmDeleteVariable({
  closeModal,
  environmentVariable,
  onClose,
}: Props): JSX.Element {
  const [
    deleteEnvironmentVariable,
    { loading },
  ] = useDeleteEnvironmentVariable();

  const handleDelete = (): void => {
    deleteEnvironmentVariable({
      variables: { id: environmentVariable.id },
      // return to main screen after environment variable deleted
    }).then(onClose);
  };

  return (
    <Box pad="medium">
      <Header closeModal={closeModal} label={copy.envVariableDelete} />
      <ConfirmDelete
        isDeleteDisabled={loading}
        onCancel={onClose}
        onDelete={handleDelete}
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
      </ConfirmDelete>
    </Box>
  );
}
