import { Box } from "grommet";
import { useContext, useState } from "react";

import { border } from "../../../../theme/theme";
import { RunnerContext } from "../../contexts/RunnerContext";
import { TestContext } from "../../contexts/TestContext";
import { PATCH_HANDLE } from "../../contexts/TestController";
import Action from "./Action";
import Buttons from "./Buttons";
import ChooseElement from "./ChooseElement";
import Code from "./Code";
import { ActionType, buildCode } from "./helpers";
import Selector from "./Selector";

type Props = { isVisible: boolean };

export default function Snippet({ isVisible }: Props): JSX.Element {
  const { elementChooserValue, runTest, stopElementChooser } = useContext(
    RunnerContext
  );
  const { controller } = useContext(TestContext);

  const [action, setAction] = useState<ActionType>(null);
  const [selector, setSelector] = useState<string>(null);

  if (!isVisible) return null;

  const snippetCode = buildCode(
    action,
    selector,
    elementChooserValue?.text || ""
  );

  const addSnippet = () => {
    const lines = controller.code.split("\n");
    const snippetLines = snippetCode.split("\n");

    let patchIndex = lines.findIndex((l) => l.includes(PATCH_HANDLE));
    if (patchIndex < 0) patchIndex = lines.length;

    // insert the snippet
    lines.splice(patchIndex, 0, ...snippetLines);

    const code = lines.join("\n");

    controller.updateCode(code);

    // this will enable code generation so make sure to call it before
    // run test which will disable code generation
    stopElementChooser();

    runTest({
      code,
      selection: {
        startLine: patchIndex + 1,
        endLine: patchIndex + 1 + snippetLines.length,
      },
      test_id: controller.id,
      version: controller.version,
    });
  };

  return (
    <Box
      background="gray9"
      border={{ ...border, color: "gray8", side: "top" }}
      flex={false}
      pad="medium"
    >
      {elementChooserValue.selectors ? (
        <>
          <Box align="center" direction="row" justify="between">
            <Action
              hasText={!!elementChooserValue?.text}
              isFillable={elementChooserValue?.isFillable}
              onSelectAction={setAction}
              value={action}
            />
            <Selector
              options={elementChooserValue.selectors || []}
              onSelectOption={setSelector}
              value={selector}
            />
          </Box>
          <Code code={snippetCode} />
          <Buttons onAddSnippet={addSnippet} onCancel={stopElementChooser} />
        </>
      ) : (
        <ChooseElement />
      )}
    </Box>
  );
}
