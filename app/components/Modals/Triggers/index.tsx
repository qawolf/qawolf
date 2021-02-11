import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useTestTriggers, useTriggers } from "../../../hooks/queries";
import Modal from "../../shared-new/Modal";
import { StateContext } from "../../StateContext";
import CreateTrigger from "./CreateTrigger";
import EditTriggers from "./EditTriggers";

type Props = {
  closeModal: () => void;
  testIds: string[];
};

export default function Triggers({ closeModal, testIds }: Props): JSX.Element {
  const { teamId, triggerId } = useContext(StateContext);

  const [isCreate, setIsCreate] = useState(false);

  const { data } = useTriggers(
    { team_id: teamId },
    { skipOnCompleted: false, triggerId }
  );

  const { data: testTriggersData } = useTestTriggers({ test_ids: testIds });
  const testTriggers = JSON.parse(testTriggersData?.testTriggers || "{}");

  // do not show "All tests" trigger
  const triggers = (data?.triggers || []).filter((t) => !t.is_default);
  const shouldCreate = data?.triggers && !triggers.length;

  // TODO: do not do this after deleting last trigger
  useEffect(() => {
    // enter create mode if there are no non-default triggers
    if (shouldCreate) setIsCreate(true);
  }, [shouldCreate]);

  const handleBack = (): void => setIsCreate(false);
  const handleCreate = (): void => setIsCreate(true);

  return (
    <Modal closeModal={closeModal}>
      <Box overflow={{ vertical: "auto" }} pad="medium">
        {isCreate && (
          <CreateTrigger
            closeModal={closeModal}
            hideBack={shouldCreate}
            onBack={handleBack}
            triggers={triggers}
          />
        )}
        {!isCreate && (
          <EditTriggers
            closeModal={closeModal}
            onCreate={handleCreate}
            testIds={testIds}
            testTriggers={testTriggers}
            triggers={triggers}
          />
        )}
      </Box>
    </Modal>
  );
}
