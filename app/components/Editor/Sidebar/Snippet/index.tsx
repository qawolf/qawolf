import { Box } from "grommet";
import { useState } from "react";

import { border } from "../../../../theme/theme";
import Action from "./Action";
import Buttons from "./Buttons";
import ChooseElement from "./ChooseElement";
import Code from "./Code";
import Selector from "./Selector";

type Props = { isVisible: boolean };

export default function Snippet({ isVisible }: Props): JSX.Element {
  const [hasElement, setHasElement] = useState(false);

  if (!isVisible) return null;

  return (
    <Box
      background="gray9"
      border={{ ...border, color: "gray8", side: "top" }}
      flex={false}
      pad="medium"
    >
      {hasElement ? (
        <>
          <Box align="center" direction="row" justify="between">
            <Action />
            <Selector />
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
