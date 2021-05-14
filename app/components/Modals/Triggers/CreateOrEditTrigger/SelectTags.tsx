import { Box } from "grommet";

import { Tag } from "../../../../lib/types";
import TagCheckBox from "../../../shared/TagCheckBox";

type Props = {
  setTagIds: (tagIds: string[]) => void;
  tagIds: string[];
  tags: Tag[];
};

export default function SelectTags({
  setTagIds,
  tagIds,
  tags,
}: Props): JSX.Element {
  const handleClick = (tagName: string): void => {
    const newTagIds = [...tagIds];

    const index = newTagIds.indexOf(tagName);

    if (index > -1) newTagIds.splice(index, 1);
    else newTagIds.push(tagName);

    setTagIds(newTagIds);
  };

  const tagsHtml = tags.map((tag) => {
    return (
      <Box margin={{ top: "small" }}>
        <TagCheckBox
          onClick={() => handleClick(tag.id)}
          selectState={tagIds.includes(tag.id) ? "all" : "none"}
          tag={tag}
        />
      </Box>
    );
  });

  return <>{tagsHtml}</>;
}
