import { Box } from "grommet";

import { Suite } from "../../../../lib/types";
import Search from "../../../shared/Search";
import SuiteDetails from "../../../shared/SuiteDetails";
import Text from "../../../shared/Text";
import TriggerIcon from "../../../shared/TriggerIcon";
import { formatSuiteName } from "../../helpers";
import SelectStatus from "./SelectStatus";

type Props = {
  search: string;
  setSearch: (search: string) => void;
  suite: Suite;
};

export default function Header({
  search,
  setSearch,
  suite,
}: Props): JSX.Element {
  return (
    <Box flex={false} pad="medium">
      <Box align="center" direction="row" justify="between">
        <Box align="center" direction="row">
          <TriggerIcon isApi={suite.is_api} trigger={suite.trigger} />
          <Text
            color="gray9"
            margin={{ right: "small" }}
            size="componentHeader"
          >
            {formatSuiteName(suite)}
          </Text>
          <Search search={search} setSearch={setSearch} />
          <SelectStatus runs={suite.runs} />
        </Box>
        <SuiteDetails suite={suite} />
      </Box>
    </Box>
  );
}
