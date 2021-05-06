import { Box } from "grommet";
import { useRef, useState } from "react";

import { state } from "../../../../../lib/state";
import { ShortTest } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { edgeSize } from "../../../../../theme/theme";
import Button from "../../../../shared/AppButton";
import Divider from "../../../../shared/Divider";
import Drop from "../../../../shared/Drop";
import More from "../../../../shared/icons/More";
import Tag from "../../../../shared/icons/Tag";
import Trash from "../../../../shared/icons/Trash";
import Option from "../../../../shared/Select/Option";

type Props = { test: ShortTest };

const width = "240px";

export default function Options({ test }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const testIds = [test.id];

  const handleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = (): void => setIsOpen(false);

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", testIds });
  };

  const handleTagsClick = (): void => {
    state.setModal({ name: "tags", testIds });
  };

  return (
    <Box ref={ref}>
      <Button
        IconComponent={More}
        a11yTitle={`${test.name || test.path} options`}
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
            IconComponent={Tag}
            label={copy.editTags}
            onClick={handleTagsClick}
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
