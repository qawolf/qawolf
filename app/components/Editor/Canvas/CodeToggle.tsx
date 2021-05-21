import { useContext, useEffect, useState } from "react";

import { PATCH_HANDLE } from "../../../lib/code";
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
    const setIsToggledState = ({ key }) => {
      if (key !== "content") return;
      setIsToggled(testModel.content.includes(PATCH_HANDLE));
    };
    setIsToggledState({ key: "content" });

    testModel.on("changed", setIsToggledState);

    return () => testModel.off("changed", setIsToggledState);
  }, [testModel]);

  const handleClick = (): void =>
    testModel.toggleCodeGeneration(mouseLineNumber);

  return (
    <Toggle
      isDisabled={isDisabled}
      isOn={isToggled}
      label={copy.createCode}
      onClick={handleClick}
    />
  );
}
