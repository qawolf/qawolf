import { useState } from "react";

import { useUpdateTest } from "../../../hooks/mutations";
import { Test } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Divider from "../../shared/Divider";
import EditableText from "../../shared/EditableText";

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
        placeholder={copy.testNamePlaceholder}
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
