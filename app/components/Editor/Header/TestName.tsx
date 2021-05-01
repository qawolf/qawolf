import { useContext, useState } from "react";

import { Test } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Divider from "../../shared/Divider";
import EditableText from "../../shared/EditableText";
import { TestContext } from "../contexts/TestContext";

type Props = {
  disabled?: boolean;
  test: Test | null;
};

export default function TestName({ disabled, test }: Props): JSX.Element {
  const [isEdit, setIsEdit] = useState(false);

  const { controller, name, path } = useContext(TestContext);

  if (!test) return null;

  const handleSave = (value: string): void => {
    if (test.path) controller._state.set("path", value);
    else controller._state.set("name", value);
  };

  return (
    <>
      <EditableText
        disabled={disabled}
        isEdit={isEdit}
        onSave={handleSave}
        placeholder={copy.testNamePlaceholder}
        setIsEdit={setIsEdit}
        value={name || path || ""}
      />
      <Divider
        height={edgeSize.large}
        margin={{ left: "xxsmall", right: "small" }}
        width={borderSize.xsmall}
      />
    </>
  );
}
