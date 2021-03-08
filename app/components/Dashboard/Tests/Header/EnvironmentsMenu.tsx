import { DropProps } from "grommet";

import { state } from "../../../../lib/state";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import Drop from "../../../shared/Drop";
import Option from "../../../shared/Select/Option";

type Props = {
  environmentId: string | null;
  environments: Environment[];
  isOpen: boolean;
  onClose: () => void;
  target: DropProps["target"];
  testCount: number;
};

const width = "240px";

export default function EnvironmentsMenu({
  environmentId,
  environments,
  isOpen,
  onClose,
  target,
  testCount,
}: Props): JSX.Element {
  if (!isOpen) return null;

  const handleClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
    onClose();
  };

  const optionsHtml = environments.map((e) => {
    return (
      <Option
        isSelected={e.id === environmentId}
        key={e.id}
        label={copy.runTests(testCount, e.name)}
        onClick={() => handleClick(e.id)}
      />
    );
  });

  return (
    <Drop
      align={{ right: "right", top: "bottom" }}
      onClickOutside={onClose}
      style={{ marginTop: edgeSize.xxxsmall }}
      target={target}
      width={width}
    >
      {optionsHtml}
    </Drop>
  );
}
