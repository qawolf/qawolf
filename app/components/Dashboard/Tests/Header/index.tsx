import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { TagFilter } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Add from "../../../shared/icons/Add";
import Search from "../../../shared/Search";
import Text from "../../../shared/Text";
import Branches from "./Branches";
import SelectTags from "./SelectTags";

type Props = {
  filter: TagFilter;
  search: string;
  setSearch: (search: string) => void;
  tagNames: string[];
};

export default function Header({
  filter,
  search,
  setSearch,
  tagNames,
}: Props): JSX.Element {
  const handleCreateTestClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  return (
    <Box flex={false} pad="medium">
      <Box align="center" direction="row" justify="between">
        <Box align="center" direction="row" wrap>
          <Text
            color="gray9"
            margin={{ right: "small" }}
            size="componentHeader"
          >
            {copy.tests}
          </Text>
          <Search search={search} setSearch={setSearch} />
          <SelectTags filter={filter} tagNames={tagNames} />
        </Box>
        <Box align="center" direction="row">
          <Branches />
          <Button
            IconComponent={Add}
            label={copy.createTest}
            onClick={handleCreateTestClick}
            type="primary"
          />
        </Box>
      </Box>
    </Box>
  );
}
