import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Add from "../../../shared/icons/Add";
import Search from "../../../shared/Search";
import Text from "../../../shared/Text";
import Branches from "./Branches";
import SelectTags from "./SelectTags";

type Props = {
  search: string;
  setSearch: (search: string) => void;
  tagIds: string[];
};

export default function Header({
  search,
  setSearch,
  tagIds,
}: Props): JSX.Element {
  const handleCreateTestClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  return (
    <Box flex={false} pad="medium">
      <Box align="center" direction="row" justify="between">
        <Box align="center" direction="row">
          <Text
            color="gray9"
            margin={{ right: "small" }}
            size="componentHeader"
          >
            {copy.tests}
          </Text>
          <Search search={search} setSearch={setSearch} />
          <SelectTags tagIds={tagIds} />
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
