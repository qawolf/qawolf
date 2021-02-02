import { useState } from "react";

import { useUpdateTest } from "../../../hooks/mutations";
import { Test } from "../../../lib/types";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Divider from "../../shared-new/Divider";
import EditableText from "../../shared-new/EditableText";

type Props = {
  disabled?: boolean;
  test: Test | null;
};

export default function TestName({ disabled, test }: Props): JSX.Element {
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
        disabled={disabled}
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
    </>
  );
}
