import { useContext, useState } from "react";

import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Divider from "../../shared/Divider";
import EditableText from "../../shared/EditableText";
import { EditorContext } from "../contexts/EditorContext";

type Props = {
  disabled?: boolean;
};

export default function TestName({ disabled }: Props): JSX.Element {
  const [isEdit, setIsEdit] = useState(false);

  const { testModel, testPath } = useContext(EditorContext);

  const handleSave = (value: string): void => {
    testModel.path = value;
  };

  return (
    <>
      <EditableText
        disabled={disabled}
        isEdit={isEdit}
        onSave={handleSave}
        placeholder={copy.testNamePlaceholder}
        setIsEdit={setIsEdit}
        value={testPath || ""}
      />
      <Divider
        height={edgeSize.large}
        margin={{ left: "xxsmall", right: "small" }}
        width={borderSize.xsmall}
      />
    </>
  );
}
