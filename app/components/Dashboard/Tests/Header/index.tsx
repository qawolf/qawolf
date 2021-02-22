import { Box } from "grommet";

import { TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";
import Buttons from "./Buttons";
import Search from "./Search";
import SelectTrigger from "./SelectTrigger";

type Props = {
  search: string;
  setSearch: (search: string) => void;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function Header({
  search,
  setSearch,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  return (
    <Box flex={false}>
      <Box
        align="center"
        direction="row"
        justify="between"
        margin={{ bottom: "medium" }}
      >
        <Box align="center" direction="row">
          <Text
            color="gray9"
            margin={{ right: "medium" }}
            size="componentHeader"
          >
            {copy.allTests}
          </Text>
        </Box>
        <Buttons />
      </Box>
      <Box align="center" direction="row" justify="between">
        <Search search={search} setSearch={setSearch} />
        <SelectTrigger testTriggers={testTriggers} triggers={triggers} />
      </Box>
    </Box>
  );
}
