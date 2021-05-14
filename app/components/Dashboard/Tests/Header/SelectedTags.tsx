import { Box } from "grommet";

import { Tag } from "../../../../lib/types";
import { edgeSize } from "../../../../theme/theme";
import TagBadge from "../../../shared/TagBadge";
import { noTagName } from "../../helpers";

type Props = {
  onClick: (tagName: string) => void;
  tagNames: string[];
  tags: Tag[] | null;
};

export default function SelectedTags({
  onClick,
  tagNames,
  tags,
}: Props): JSX.Element {
  if (!tags || !tagNames.length) return null;

  const selectedTags = tags.filter((t) => tagNames.includes(t.name));

  const tagsHtml = selectedTags.map((t) => {
    return <TagBadge key={t.id} onClose={() => onClick(t.name)} tag={t} />;
  });

  if (tagNames.includes(noTagName)) {
    tagsHtml.push(
      <TagBadge key={noTagName} onClose={() => onClick(noTagName)} />
    );
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
