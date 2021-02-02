import { useContext, useState } from "react";

import { useUpdateTest } from "../../../hooks/mutations";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Divider from "../../shared-new/Divider";
import EditableText from "../../shared-new/EditableText";
import StatusBadge from "../../shared-new/StatusBadge";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";

export default function TestName(): JSX.Element {
  const { progress } = useContext(RunnerContext);
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
    <>
      <EditableText
        disabled={!!run}
        isEdit={isEdit}
        onSave={handleSave}
        setIsEdit={setIsEdit}
        value={test.name}
      />
      <Divider
        height={edgeSize.large}
        margin={{ left: "xxsmall", right: "small" }}
        width={borderSize.xsmall}
      />
      <StatusBadge status={progress?.status} />
    </>
  );
}
