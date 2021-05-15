import { Box, DropProps } from "grommet";
import { ChangeEvent } from "react";

import { Tag, TagFilter } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Divider from "../../../shared/Divider";
import Drop from "../../../shared/Drop";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import { noTagName } from "../../helpers";
import EditTags from "./EditTags";
import TagOption from "./TagOption";

type Props = {
  filter: TagFilter;
  isOpen: boolean;
  onClick: (tagName: string) => void;
  onClose: () => void;
  onFilterClick: (filter: TagFilter) => void;
  tagNames: string[];
  tags: Tag[] | null;
  target: DropProps["target"];
};

const dividerProps = { margin: { vertical: "xxxsmall" } };
const filterOptions = [
  { label: copy.hasAny, value: "any" },
  { label: copy.hasAll, value: "all" },
];
const width = "280px";

export default function TagsMenu({
  filter,
  isOpen,
  onClick,
  onClose,
  onFilterClick,
  tags,
  tagNames,
  target,
}: Props): JSX.Element {
  if (!isOpen || !tags) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilterClick(e.target.value as TagFilter);
  };

  const optionsHtml = tags.map((tag) => {
    return (
      <TagOption
        isChecked={tagNames.includes(tag.name)}
        key={tag.id}
        onClick={() => onClick(tag.name)}
        tag={tag}
      />
    );
  });

  return (
    <Drop
      align={{ left: "left", top: "bottom" }}
      onClickOutside={onClose}
      style={{ marginTop: edgeSize.xxxsmall }}
      target={target}
      width={width}
    >
      {!!tags.length && (
        <>
          <Box flex={false} pad={{ horizontal: "xsmall", vertical: "xxsmall" }}>
            <RadioButtonGroup
              direction="row"
              gap={edgeSize.small}
              name="filter type"
              onChange={handleChange}
              options={filterOptions}
              value={filter}
            />
          </Box>
          <Divider {...dividerProps} />
        </>
      )}
      {optionsHtml}
      <TagOption
        isChecked={tagNames.includes(noTagName)}
        key={noTagName}
        onClick={() => onClick(noTagName)}
      />
      <Divider {...dividerProps} />
      <EditTags onClose={onClose} />
    </Drop>
  );
}
