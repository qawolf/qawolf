import { Box } from "grommet";
import { useContext, useState } from "react";

import { useTriggers } from "../../../hooks/queries";
import { Trigger } from "../../../lib/types";
import Modal from "../../shared/Modal";
import { StateContext } from "../../StateContext";
import ConfirmDelete from "./ConfirmDelete";
import CreateOrEditTrigger from "./CreateOrEditTrigger";
import TriggersList from "./TriggersList";

type Props = { closeModal: () => void };

export default function Triggers({ closeModal }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [deleteTrigger, setDeleteTrigger] = useState<Trigger | null>(null);
  const [editTrigger, setEditTrigger] = useState<Trigger | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const { data, loading } = useTriggers({ team_id: teamId });

  const triggers = data?.triggers || null;

  const handleBack = (): void => {
    setDeleteTrigger(null);
    setEditTrigger(null);
    setIsCreate(false);
  };

  const handleCreate = (): void => setIsCreate(true);
  const handleDelete = (trigger: Trigger): void => setDeleteTrigger(trigger);
  const handleEdit = (trigger: Trigger): void => setEditTrigger(trigger);

  return (
    <Modal closeModal={closeModal}>
      <Box overflow={{ vertical: "auto" }} pad="medium">
        {!!deleteTrigger && (
          <ConfirmDelete
            closeModal={closeModal}
            onClose={handleBack}
            trigger={deleteTrigger}
          />
        )}
        {(!!editTrigger || isCreate) && (
          <CreateOrEditTrigger
            closeModal={closeModal}
            editTrigger={editTrigger}
            onBack={handleBack}
            triggers={triggers || []}
          />
        )}
        {!deleteTrigger && !editTrigger && !isCreate && (
          <TriggersList
            closeModal={closeModal}
            isLoading={loading}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onEdit={handleEdit}
            triggers={triggers}
          />
        )}
      </Box>
    </Modal>
  );
}
