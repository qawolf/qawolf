import { useUpdateTest } from "../../../hooks/mutations";
import { Test } from "../../../lib/types";
import EditableText from "../../shared/EditableText";

type Props = { test: Test };

export default function EditTestName({ test }: Props): JSX.Element {
  const [updateTest] = useUpdateTest();

  const handleChange = (newName: string) => {
    updateTest({
      optimisticResponse: {
        updateTest: {
          ...test,
          name: newName,
        },
      },
      variables: { id: test.id, name: newName },
    });
  };

  return (
    <EditableText name="test-name" onChange={handleChange} value={test.name} />
  );
}
