import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useTriggers } from "../../../hooks/queries";
import { SelectedTrigger } from "../../../lib/types";
import Modal from "../../shared-new/Modal";
import { StateContext } from "../../StateContext";
import CreateTrigger from "./CreateTrigger";

type Props = {
  closeModal: () => void;
  trigger?: SelectedTrigger; // if editing trigger from dashboard
};

export default function Triggers({ closeModal }: Props): JSX.Element {
  const { teamId, triggerId } = useContext(StateContext);

  const [isCreate, setIsCreate] = useState(false);

  const { data } = useTriggers(
    { team_id: teamId },
    { skipOnCompleted: false, triggerId }
  );

  // do not show "All tests" trigger
  const triggers = (data?.triggers || []).filter((t) => !t.is_default);

  useEffect(() => {
    // enter create mode if there are no non-default triggers
    if (data?.triggers && !triggers.length) {
      setIsCreate(true);
    }
  }, [data?.triggers, triggers]);

  return (
    <Modal closeModal={closeModal}>
      <Box pad="medium">
        {isCreate && <CreateTrigger closeModal={closeModal} />}
      </Box>
    </Modal>
  );
}
