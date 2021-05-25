import { useContext, useEffect, useState } from "react";

import { PATCH_HANDLE } from "../../../lib/code";
import { toggleCodeGeneration } from "../../../lib/testFile";
import { copy } from "../../../theme/copy";
import Toggle from "../../shared/Toggle";
import { EditorContext } from "../contexts/EditorContext";

type Props = {
  isDisabled: boolean;
  mouseLineNumber: number | null;
};

export default function CodeToggle({
  isDisabled,
  mouseLineNumber,
}: Props): JSX.Element {
  const { testModel } = useContext(EditorContext);

  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    return testModel?.bind<string>("content", (content) => {
      setIsToggled(content.includes(PATCH_HANDLE));
    });
  }, [testModel]);

  const handleClick = (): void =>
    toggleCodeGeneration(testModel, mouseLineNumber);

  return (
    <Toggle
      isDisabled={isDisabled}
      isOn={isToggled}
      label={copy.createCode}
      onClick={handleClick}
    />
  );
}
