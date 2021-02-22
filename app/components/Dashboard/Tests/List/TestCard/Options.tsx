import { Box, Drop } from "grommet";
import { MouseEvent, useRef, useState } from "react";

import { state } from "../../../../../lib/state";
import { ShortTest } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { edgeSize } from "../../../../../theme/theme-new";
import Button from "../../../../shared-new/AppButton";
import Divider from "../../../../shared-new/Divider";
import Lightning from "../../../../shared-new/icons/Lightning";
import More from "../../../../shared-new/icons/More";
import Trash from "../../../../shared-new/icons/Trash";
import Option from "../../../../shared-new/Select/Option";

type Props = { test: ShortTest };

const width = "240px";

export default function Options({ test }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = (e: MouseEvent): void => {
    if (e.target === ref.current) return;

    setIsOpen(false);
  };
  const handleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", tests: [test] });
  };

  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds: [test.id] });
  };

  // use Drop instead of Menu because Drop is removed from
  // document flow (prevents menu from being trapped in test list)
  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <Button
        IconComponent={More}
        a11yTitle={`${test.name} options`}
        onClick={handleClick}
        type="ghost"
      />
      {isOpen && (
        <Drop
          align={{ right: "right", top: "bottom" }}
          onClick={handleClose}
          onClickOutside={handleClose}
          style={{ marginTop: edgeSize.xxxsmall }}
          target={ref.current}
        >
          <Box pad={{ vertical: "xxxsmall" }} width={width}>
            <Option
              IconComponent={Lightning}
              label={copy.editTriggers}
              onClick={handleTriggersClick}
            />
            <Divider margin={{ vertical: "xxxsmall" }} />
            <Option
              IconComponent={Trash}
              label={copy.delete}
              onClick={handleDeleteClick}
              type="danger"
            />
          </Box>
        </Drop>
      )}
    </Box>
  );
}
