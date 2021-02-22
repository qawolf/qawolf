import { useEffect } from "react";

import { useDeleteTests } from "../../hooks/mutations";
import { SelectedTest } from "../../lib/types";
import { copy } from "../../theme/copy";
import ConfirmDelete from "../shared/ConfirmDelete";

type Props = {
  closeModal: () => void;
  tests: SelectedTest[];
};

export default function ConfirmDeleteTests({
  closeModal,
  tests,
}: Props): JSX.Element {
  const testIds = tests.map((test) => test.id);
  const [deleteTests, { data, loading }] = useDeleteTests({ ids: testIds });

  useEffect(() => {
    if (data?.deleteTests) {
      closeModal();
    }
  }, [closeModal, data]);

  const testNames = tests.map((test) => test.name);

  return (
    <ConfirmDelete
      closeModal={closeModal}
      disabled={loading}
      message={copy.confirmDelete("tests")}
      namesToDelete={testNames}
      onClick={deleteTests}
    />
  );
}
