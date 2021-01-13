import { useEffect } from "react";

import { useDeleteGroup } from "../../hooks/mutations";
import { SelectedGroup } from "../../lib/types";
import { copy } from "../../theme/copy";
import ConfirmDelete from "../shared/ConfirmDelete";

type Props = {
  closeModal: () => void;
  group: SelectedGroup;
};

export default function ConfirmDeleteGroup({
  closeModal,
  group,
}: Props): JSX.Element {
  const [deleteGroup, { data, loading }] = useDeleteGroup({ id: group.id });

  useEffect(() => {
    if (data?.deleteGroup) {
      closeModal();
    }
  }, [closeModal, data]);

  return (
    <ConfirmDelete
      closeModal={closeModal}
      disabled={loading}
      message={copy.confirmDelete("group")}
      namesToDelete={[group.name]}
      onClick={deleteGroup}
    />
  );
}
