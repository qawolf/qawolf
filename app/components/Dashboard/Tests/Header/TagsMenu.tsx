import { DropProps } from "grommet";
import { useRouter } from "next/router";

import { Tag } from "../../../../lib/types";
import { edgeSize } from "../../../../theme/theme";
import Divider from "../../../shared/Divider";
import Drop from "../../../shared/Drop";
import { buildTestsPath, noTagId } from "../../helpers";
import TagOption from "./TagOption";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tagIds: string[];
  tags: Tag[] | null;
  target: DropProps["target"];
};

const dividerProps = { margin: { vertical: "xxxsmall" } };
const width = "280px";

export default function TagsMenu({
  isOpen,
  onClose,
  tags,
  tagIds,
  target,
}: Props): JSX.Element {
  const { replace } = useRouter();

  if (!isOpen || !tags) return null;

  const handleClick = (tagId: string): void => {
    const newTagIds = [...tagIds];

    if (!newTagIds.includes(tagId)) {
      newTagIds.push(tagId);
    } else {
      const index = newTagIds.indexOf(tagId);
      if (index > -1) newTagIds.splice(index, 1);
    }

    replace(buildTestsPath(newTagIds));
  };

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
      width={width}
    >
      {optionsHtml}
      {!!tags?.length && <Divider {...dividerProps} />}
      <TagOption
        isChecked={tagIds.includes(noTagId)}
        key={noTagId}
        onClick={() => handleClick(noTagId)}
      />
    </Drop>
  );
}
