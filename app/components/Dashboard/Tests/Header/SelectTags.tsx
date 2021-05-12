import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import { VscFilter } from "react-icons/vsc";

import { useTags } from "../../../../hooks/queries";
import { TagFilter } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import { StateContext } from "../../../StateContext";
import { buildTestsPath } from "../../helpers";
import SelectedTags from "./SelectedTags";
import TagsMenu from "./TagsMenu";

type Props = {
  filter: TagFilter;
  tagIds: string[];
};

export default function SelectTags({ filter, tagIds }: Props): JSX.Element {
  const { replace } = useRouter();
  const { teamId } = useContext(StateContext);

  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useTags({ team_id: teamId });
  const tags = data?.tags || null;

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  const handleFilterClick = (filter: TagFilter): void => {
    replace(buildTestsPath(tagIds, filter));
  };

  const handleTagClick = (tagId: string): void => {
    const newTagIds = [...tagIds];
    const index = newTagIds.indexOf(tagId);

    if (index > -1) newTagIds.splice(index, 1);
    else newTagIds.push(tagId);

    replace(buildTestsPath(newTagIds, filter));
  };

  const buttonLabel =
    tagIds.length > 1 ? `${copy.filter} (${copy[filter]})` : copy.filter;

  return (
    <Box align="center" direction="row" flex={false}>
      <Box ref={ref}>
        <Button
          IconComponent={VscFilter}
          iconPosition="right"
          label={buttonLabel}
          onClick={handleClick}
          type="secondary"
        />
      </Box>
      <TagsMenu
        filter={filter}
        isOpen={isOpen}
        onClick={handleTagClick}
        onClose={handleClose}
        onFilterClick={handleFilterClick}
        tagIds={tagIds}
        tags={tags}
        target={ref.current}
      />
      <SelectedTags onClick={handleTagClick} tagIds={tagIds} tags={tags} />
    </Box>
  );
}
