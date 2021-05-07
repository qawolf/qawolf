import { Box } from "grommet";
import { useRouter } from "next/router";

import { Tag, TagFilter } from "../../../../../lib/types";
import { edgeSize } from "../../../../../theme/theme";
import TagBadge from "../../../../shared/TagBadge";
import { buildTestsPath } from "../../../helpers";

type Props = { tags: Tag[] };

export default function Triggers({ tags }: Props): JSX.Element {
  const { query, replace } = useRouter();

  const handleTriggerClick = (tagId: string): void => {
    replace(buildTestsPath([tagId], query.filter as TagFilter));
  };

  const tagsHtml = tags.map((tag) => {
    return (
      <TagBadge
        key={tag.id}
        onClick={() => handleTriggerClick(tag.id)}
        tag={tag}
      />
    );
  });

  return (
    <Box direction="row" gap={edgeSize.xxsmall} wrap>
      {tagsHtml}
    </Box>
  );
}
