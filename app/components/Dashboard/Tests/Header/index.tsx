import { Box } from "grommet";
import { useRouter } from "next/router";

import { ShortTest, TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Search from "../../../shared/Search";
import Text from "../../../shared/Text";
import Actions from "./Actions";
import Branches from "./Branches";
import Buttons from "./Buttons";
import SelectTrigger from "./SelectTrigger";

type Props = {
  checkedTests: ShortTest[];
  hasGroups: boolean;
  groupName: string | null;
  search: string;
  setSearch: (search: string) => void;
  tests: ShortTest[] | null;
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

export default function Header({
  checkedTests,
  groupName,
  hasGroups,
  search,
  setSearch,
  testTriggers,
  tests,
  triggers,
}: Props): JSX.Element {
  const { query } = useRouter();
  const groupId = query.group_id as string;

  const selectedTests = checkedTests.length ? checkedTests : tests;

  const selectedTestTriggers = testTriggers.filter((t) => {
    return !groupId || t.group_id === groupId;
  });

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
            margin={{ right: "small" }}
            size="componentHeader"
          >
            {groupName || copy.allTests}
          </Text>
          <Branches />
        </Box>
        <Box align="center" direction="row">
          <Actions checkedTests={checkedTests} hasGroups={hasGroups} />
          <Buttons tests={selectedTests} />
        </Box>
      </Box>
      <Box align="center" direction="row" justify="between">
        <Search search={search} setSearch={setSearch} />
        <SelectTrigger
          testTriggers={selectedTestTriggers}
          triggers={triggers}
        />
      </Box>
    </Box>
  );
}
