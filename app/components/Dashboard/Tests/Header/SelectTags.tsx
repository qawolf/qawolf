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
  tagNames: string[];
};

export default function SelectTags({ filter, tagNames }: Props): JSX.Element {
  const { replace } = useRouter();
  const { teamId } = useContext(StateContext);

  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useTags({ team_id: teamId });
  const tags = data?.tags || null;

  const handleClick = (): void => setIsOpen((prev) => !prev);
  const handleClose = (): void => setIsOpen(false);

  const handleFilterClear = (): void => {
    replace(buildTestsPath([]));
  };

  const handleFilterClick = (filter: TagFilter): void => {
    replace(buildTestsPath(tagNames, filter));
  };

  const handleTagClick = (tagName: string): void => {
    const newTagNames = [...tagNames];
    const index = newTagNames.indexOf(tagName);

    if (index > -1) newTagNames.splice(index, 1);
    else newTagNames.push(tagName);

    replace(buildTestsPath(newTagNames, filter));
  };

  const buttonLabel =
    tagNames.length > 1 ? `${copy.filter} (${copy[filter]})` : copy.filter;

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
        tagNames={tagNames}
        tags={tags}
        target={ref.current}
      />
      <SelectedTags onClick={handleTagClick} tagNames={tagNames} tags={tags} />
      {!!tagNames.length && (
        <Button
          label={copy.clearFilters}
          margin={{ left: "xxxsmall" }}
          onClick={handleFilterClear}
          type="ghost"
        />
      )}
    </Box>
  );
}
