import { Box } from "grommet";
import { useContext, useEffect, useRef, useState } from "react";

import { useTestTriggers, useTriggers } from "../../../hooks/queries";
import { Trigger } from "../../../lib/types";
import Modal from "../../shared-new/Modal";
import { StateContext } from "../../StateContext";
import ConfirmDelete from "./ConfirmDelete";
import CreateOrEditTrigger from "./CreateOrEditTrigger";
import EditTriggers from "./EditTriggers";

type Props = {
  closeModal: () => void;
  testIds: string[];
};

export default function Triggers({ closeModal, testIds }: Props): JSX.Element {
  const { teamId, triggerId } = useContext(StateContext);

  const [deleteTrigger, setDeleteTrigger] = useState<Trigger | null>(null);
  const [editTrigger, setEditTrigger] = useState<Trigger | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const isRendered = useRef(false);

  const { data } = useTriggers(
    { team_id: teamId },
    { skipOnCompleted: false, triggerId }
  );

  const { data: testTriggersData } = useTestTriggers({ test_ids: testIds });
  const testTriggers = testTriggersData?.testTriggers || [];

  // do not show "All tests" trigger
  const triggers = data?.triggers
    ? data.triggers.filter((t) => !t.is_default)
    : null;

  useEffect(() => {
    if (!data?.triggers || isRendered.current) return;
    isRendered.current = true;
    // enter create mode if there are no non-default triggers
    if (!triggers.length) setIsCreate(true);
  }, [data?.triggers, triggers]);

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
          <EditTriggers
            closeModal={closeModal}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onEdit={handleEdit}
            testIds={testIds}
            testTriggers={testTriggers}
            triggers={triggers}
          />
        )}
      </Box>
    </Modal>
  );
}
