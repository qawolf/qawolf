import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import { Tag } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import RadioButtonGroup from "../../../shared/RadioButtonGroup";
import Text from "../../../shared/Text";
import SelectTags from "./SelectTags";

type Props = {
  setTagIds: (tagIds: string[]) => void;
  tagIds: string[];
  tags: Tag[];
};

const OPTIONS = ["allTags", "selectedTags"];

export default function Tags({ setTagIds, tagIds, tags }: Props): JSX.Element {
  const [hasTags, setHasTags] = useState(!!tagIds.length);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedTags = e.target.value !== "allTags";

    setHasTags(selectedTags);
    if (!selectedTags) setTagIds([]);
  };

  const options = (tags.length ? OPTIONS : [OPTIONS[0]]).map((option) => {
    return { label: copy[option], value: option };
  });

  return (
    <Box>
      <Text
        color="gray9"
        margin={{ bottom: "small", top: "medium" }}
        size="componentBold"
      >
        {copy.tags}
      </Text>
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="tags"
        onChange={handleChange}
        options={options}
        value={hasTags ? "selectedTags" : "allTags"}
      />
      {hasTags && !!tags.length && (
        <SelectTags setTagIds={setTagIds} tagIds={tagIds} tags={tags} />
      )}
    </Box>
  );
}
