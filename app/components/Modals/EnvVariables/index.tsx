import { useState } from "react";

import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Modal from "../../shared-new/Modal";
import Text from "../../shared-new/Text";
import ConfirmDelete from "./ConfirmDelete";
import List from "./List";
import SelectEnvironment from "./SelectEnvironment";

type Props = {
  closeModal: () => void;
};

export default function Environments({ closeModal }: Props): JSX.Element {
  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const handleCancelClick = (): void => setDeleteEnvironmentVariable(null);

  const handleDeleteClick = (
    environmentVariable: EnvironmentVariable
  ): void => {
    setDeleteEnvironmentVariable(environmentVariable);
  };

  return (
    <Modal
      closeModal={closeModal}
      label={
        deleteEnvironmentVariable ? copy.envVariableDelete : copy.envVariables
      }
    >
      {deleteEnvironmentVariable ? (
        <ConfirmDelete
          environmentVariable={deleteEnvironmentVariable}
          onCancelClick={handleCancelClick}
        />
      ) : (
        <>
          <Text
            color="gray9"
            margin={{ top: "xxsmall" }}
            size="componentParagraph"
          >
            {copy.envVariablesDetail}
          </Text>
          <SelectEnvironment />
          <List closeModal={closeModal} onDeleteClick={handleDeleteClick} />
        </>
      )}
    </Modal>
  );
}
