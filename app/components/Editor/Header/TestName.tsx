import { useContext, useState } from "react";
import { TestContext } from "../contexts/TestContext";
import EditableText from "../../shared-new/EditableText";
import { useUpdateTest } from "../../../hooks/mutations";

export default function TestName(): JSX.Element {
  const { run, test } = useContext(TestContext);
  const [isEdit, setIsEdit] = useState(false);

  const [updateTest] = useUpdateTest();

  if (!test) return null;

  const handleSave = (name: string): void => {
    updateTest({
      optimisticResponse: {
        updateTest: { ...test, name },
      },
      variables: { id: test.id, name },
    });
  };

  return (
    <EditableText
      disabled={!!run}
      isEdit={isEdit}
      onSave={handleSave}
      setIsEdit={setIsEdit}
      value={test.name}
    />
  );
}
