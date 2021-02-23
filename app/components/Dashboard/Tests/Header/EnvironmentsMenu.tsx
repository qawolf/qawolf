import { Box, Drop, DropProps } from "grommet";
import { MouseEvent } from "react";

import { state } from "../../../../lib/state";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import Option from "../../../shared-new/Select/Option";

type Props = {
  environmentId: string | null;
  environments: Environment[];
  isOpen: boolean;
  onClose: () => void;
  target: DropProps["target"];
};

const width = "240px";

export default function EnvironmentsMenu({
  environmentId,
  environments,
  isOpen,
  onClose,
  target,
}: Props): JSX.Element {
  if (!isOpen) return null;

  const handleClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
    onClose();
  };

  const handleClickOutside = (e: MouseEvent<HTMLDocument>) => {
    // ignore clicks on the button
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((target as any).contains(e.target as HTMLButtonElement)) return;
    onClose();
  };

  const optionsHtml = environments.map((e) => {
    return (
      <Option
        isSelected={e.id === environmentId}
        key={e.id}
        label={copy.runTests(e.name)}
        onClick={() => handleClick(e.id)}
      />
    );
  });

  // use drop to avoid hover activating divider
  return (
    <Drop
      align={{ right: "right", top: "bottom" }}
      onClickOutside={handleClickOutside}
      style={{ marginTop: edgeSize.xxxsmall }}
      target={target}
    >
      <Box pad={{ vertical: "xxxsmall" }} width={width}>
        {optionsHtml}
      </Box>
    </Drop>
  );
}
