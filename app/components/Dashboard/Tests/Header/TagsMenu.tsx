import { DropProps } from "grommet";

import { Tag } from "../../../../lib/types";
import { edgeSize } from "../../../../theme/theme";
import Drop from "../../../shared/Drop";
import TagOption from "./TagOption";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tagIds: string[];
  tags: Tag[] | null;
  target: DropProps["target"];
};

export default function TagsMenu({
  isOpen,
  onClose,
  tags,
  tagIds,
  target,
}: Props): JSX.Element {
  if (!isOpen || !tags) return null;

  const handleClick = (tagId: string): void => {};

  const optionsHtml = tags.map((tag) => {
    return (
      <TagOption
        isChecked={tagIds.includes(tag.id)}
        key={tag.id}
        onClick={() => handleClick(tag.id)}
        tag={tag}
      />
    );
  });

  return (
    <Drop
      align={{ right: "right", top: "bottom" }}
      onClickOutside={onClose}
      style={{ marginTop: edgeSize.xxxsmall }}
      target={target}
    >
      {optionsHtml}
    </Drop>
  );
}
