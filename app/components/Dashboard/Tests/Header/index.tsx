import { Box } from "grommet";

import { ShortTest, TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";
import Actions from "./Actions";
import Buttons from "./Buttons";
import Search from "./Search";
import SelectTrigger from "./SelectTrigger";

type Props = {
  checkedTests: ShortTest[];
  search: string;
  setSearch: (search: string) => void;
  tests: ShortTest[] | null;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function Header({
  checkedTests,
  search,
  setSearch,
  testTriggers,
  tests,
  triggers,
}: Props): JSX.Element {
  const selectedTests = checkedTests.length ? checkedTests : tests;

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
        <Box align="center" direction="row">
          <Actions checkedTests={checkedTests} />
          <Buttons tests={selectedTests} />
        </Box>
      </Box>
      <Box align="center" direction="row" justify="between">
        <Search search={search} setSearch={setSearch} />
        <SelectTrigger testTriggers={testTriggers} triggers={triggers} />
      </Box>
    </Box>
  );
}
