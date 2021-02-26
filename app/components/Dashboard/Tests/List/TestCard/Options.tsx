import { Box } from "grommet";
import { useRef, useState } from "react";

import { state } from "../../../../../lib/state";
import { ShortTest } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { edgeSize } from "../../../../../theme/theme-new";
import Button from "../../../../shared-new/AppButton";
import Divider from "../../../../shared-new/Divider";
import Drop from "../../../../shared-new/Drop";
import Folder from "../../../../shared-new/icons/Folder";
import Lightning from "../../../../shared-new/icons/Lightning";
import More from "../../../../shared-new/icons/More";
import Trash from "../../../../shared-new/icons/Trash";
import Option from "../../../../shared-new/Select/Option";

type Props = { test: ShortTest };

const width = "240px";

export default function Options({ test }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = (): void => setIsOpen(false);

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", tests: [test] });
  };

  const handleGroupClick = (): void => {
    state.setModal({ name: "editTestsGroup", tests: [test] });
  };

  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds: [test.id] });
  };

  return (
    <Box ref={ref}>
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
          width={width}
        >
          <Option
            IconComponent={Lightning}
            label={copy.editTriggers}
            onClick={handleTriggersClick}
          />
          <Option
            IconComponent={Folder}
            label={copy.assignToGroup}
            onClick={handleGroupClick}
          />
          <Divider margin={{ vertical: "xxxsmall" }} />
          <Option
            IconComponent={Trash}
            label={copy.delete}
            onClick={handleDeleteClick}
            type="danger"
          />
        </Drop>
      )}
    </Box>
  );
}
