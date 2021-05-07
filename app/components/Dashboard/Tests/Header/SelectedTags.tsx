import { Box } from "grommet";

import { Tag } from "../../../../lib/types";
import { edgeSize } from "../../../../theme/theme";
import TagBadge from "../../../shared/TagBadge";
import { noTagId } from "../../helpers";

type Props = {
  onClick: (tagId: string) => void;
  tagIds: string[];
  tags: Tag[] | null;
};

export default function SelectedTags({
  onClick,
  tagIds,
  tags,
}: Props): JSX.Element {
  if (!tags || !tagIds.length) return null;

  const selectedTags = tags.filter((t) => tagIds.includes(t.id));

  const tagsHtml = selectedTags.map((t) => {
    return <TagBadge key={t.id} onClose={() => onClick(t.id)} tag={t} />;
  });

  if (tagIds.includes(noTagId)) {
    tagsHtml.push(<TagBadge key={noTagId} onClose={() => onClick(noTagId)} />);
  }

  return (
    <Box
      align="center"
      direction="row"
      gap={edgeSize.xxsmall}
      margin={{ left: "small" }}
    >
      {tagsHtml}
    </Box>
  );
}
