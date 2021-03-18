import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { border } from "../../../../theme/theme";
import { RunnerContext } from "../../contexts/RunnerContext";
import Action from "./Action";
import Buttons from "./Buttons";
import ChooseElement from "./ChooseElement";
import Code from "./Code";
import Selector from "./Selector";

type Props = { isVisible: boolean };

export default function Snippet({ isVisible }: Props): JSX.Element {
  const { elementChooserValue } = useContext(RunnerContext);

  const [action, setAction] = useState<string>(null);
  const [selector, setSelector] = useState<string>(null);

  if (!isVisible) return null;

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
          <Code />
          <Buttons />
        </>
      ) : (
        <ChooseElement />
      )}
    </Box>
  );
}
