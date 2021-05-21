import { useContext, useEffect, useState } from "react";

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
  const [value, setValue] = useState("");

  const { testModel } = useContext(EditorContext);

  useEffect(() => {
    setValue(testModel.path);

    const updateValue = ({ key }) => {
      if (key !== "path") return;
      setValue(testModel.path);
    };

    testModel.on("changed", updateValue);

    return () => testModel.off("changed", updateValue);
  }, [testModel]);

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
        value={value || ""}
      />
      <Divider
        height={edgeSize.large}
        margin={{ left: "xxsmall", right: "small" }}
        width={borderSize.xsmall}
      />
    </>
  );
}
