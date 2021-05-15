import { Box } from "grommet";
import { useRouter } from "next/router";

import { Tag, TagFilter } from "../../../../../lib/types";
import { edgeSize } from "../../../../../theme/theme";
import TagBadge from "../../../../shared/TagBadge";
import { buildTestsPath } from "../../../helpers";

type Props = {
  filterOnClick?: boolean;
  tags: Tag[];
};

export default function Tags({ filterOnClick, tags }: Props): JSX.Element {
  const { query, replace } = useRouter();

  const handleTagClick = (tagName: string): void => {
    replace(buildTestsPath([tagName], query.filter as TagFilter));
  };

  const tagsHtml = tags.map((tag) => {
    const onClick = filterOnClick ? () => handleTagClick(tag.name) : undefined;

    return <TagBadge key={tag.id} onClick={onClick} tag={tag} />;
  });

  return (
    <Box direction="row" gap={edgeSize.xxsmall} wrap>
      {tagsHtml}
    </Box>
  );
}
