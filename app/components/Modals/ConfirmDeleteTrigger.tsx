import { useEffect } from "react";

import { useDeleteTrigger } from "../../hooks/mutations";
import { SelectedTrigger } from "../../lib/types";
import { copy } from "../../theme/copy";
import ConfirmDelete from "../shared/ConfirmDelete";

type Props = {
  closeModal: () => void;
  trigger: SelectedTrigger;
};

export default function ConfirmDeleteTrigger({
  closeModal,
  trigger,
}: Props): JSX.Element {
  const [deleteTrigger, { data, loading }] = useDeleteTrigger({
    id: trigger.id,
  });

  useEffect(() => {
    if (data?.deleteTrigger) {
      closeModal();
    }
  }, [closeModal, data]);

  return (
    <ConfirmDelete
      closeModal={closeModal}
      disabled={loading}
      message={copy.confirmDelete("group")}
      namesToDelete={[trigger.name]}
      onClick={deleteTrigger}
    />
  );
}
