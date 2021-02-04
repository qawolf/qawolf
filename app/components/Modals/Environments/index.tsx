import { Box } from "grommet";
import Modal from "../../shared-new/Modal";
import Variables from "./Variables";
import Environments from "./Environments";
import { EnvironmentVariable } from "../../../lib/types";
import { useState } from "react";
import ConfirmDelete from "./Variables/ConfirmDelete";

type Props = { closeModal: () => void };

const width = "800px";

export default function EnvironmentsModal({ closeModal }: Props): JSX.Element {
  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const handleDelete = (environmentVariable: EnvironmentVariable): void => {
    setDeleteEnvironmentVariable(environmentVariable);
  };

  const handleCancel = (): void => {
    setDeleteEnvironmentVariable(null);
  };

  if (deleteEnvironmentVariable) {
    return (
      <Modal closeModal={closeModal}>
        <ConfirmDelete
          closeModal={closeModal}
          environmentVariable={deleteEnvironmentVariable}
          onCancel={handleCancel}
        />
      </Modal>
    );
  }

  return (
    <Modal closeModal={closeModal} width={width}>
      <Box direction="row">
        <Environments />
        <Variables closeModal={closeModal} onDelete={handleDelete} />
      </Box>
    </Modal>
  );
}
