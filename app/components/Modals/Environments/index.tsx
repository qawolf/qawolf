import { useState } from "react";

import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Modal from "../../shared-new/Modal";
import Text from "../../shared-new/Text";
import ConfirmDelete from "./ConfirmDelete";
import List from "./List";

type Props = {
  closeModal: () => void;
};

export default function Environments({ closeModal }: Props): JSX.Element {
  const [
    deleteEnvironment,
    setDeleteEnvironment,
  ] = useState<Environment | null>(null);

  const handleCancelClick = (): void => setDeleteEnvironment(null);

  const handleDeleteClick = (environment: Environment): void => {
    setDeleteEnvironment(environment);
  };

  return (
    <Modal
      closeModal={closeModal}
      label={deleteEnvironment ? copy.environmentDelete : copy.environmentsEdit}
    >
      {deleteEnvironment ? (
        <ConfirmDelete
          environment={deleteEnvironment}
          onCancelClick={handleCancelClick}
        />
      ) : (
        <>
          <Text
            color="gray8"
            margin={{ top: "xxsmall" }}
            size="componentParagraph"
          >
            {copy.environmentsEditDetail}
          </Text>
          <List closeModal={closeModal} onDeleteClick={handleDeleteClick} />
        </>
      )}
    </Modal>
  );
}
