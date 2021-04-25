import { Box } from "grommet";

import { useCreateSuite } from "../../../../hooks/mutations";
import { Suite, SuiteRun } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";
import Play from "../../../shared/icons/Play";
import Search from "../../../shared/Search";
import SuiteDetails from "../../../shared/SuiteDetails";
import Text from "../../../shared/Text";
import TriggerIcon from "../../../shared/TriggerIcon";
import { formatSuiteName } from "../../helpers";
import SelectStatus from "./SelectStatus";

type Props = {
  checkedTestIds: string[];
  filteredRuns: SuiteRun[];
  search: string;
  setSearch: (search: string) => void;
  suite: Suite;
};

export default function Header({
  checkedTestIds,
  filteredRuns,
  search,
  setSearch,
  suite,
}: Props): JSX.Element {
  const [createSuite, { loading }] = useCreateSuite();

  const test_ids = checkedTestIds.length
    ? checkedTestIds
    : filteredRuns.map((r) => r.test_id);

  const handleClick = (): void => {
    if (!test_ids.length) return;

    createSuite({
      variables: {
        branch: suite.branch,
        environment_id: suite.environment_id,
        environment_variables: suite.environment_variables,
        test_ids,
      },
    });
  };

  return (
    <Box flex={false}>
      <Box align="center" direction="row" justify="between">
        <Box align="center" direction="row">
          <TriggerIcon trigger={suite.trigger} />
          <Text
            color="gray9"
            margin={{ right: "small" }}
            size="componentHeader"
          >
            {formatSuiteName(suite)}
          </Text>
          <SuiteDetails suite={suite} />
        </Box>
        <Button
          IconComponent={Play}
          isDisabled={loading || !test_ids.length}
          label={copy.runTests(test_ids.length)}
          onClick={handleClick}
          type="secondary"
        />
      </Box>
      <Box
        align="center"
        direction="row"
        justify="between"
        margin={{ top: "large" }}
      >
        <Search search={search} setSearch={setSearch} />
        <SelectStatus runs={suite.runs} />
      </Box>
    </Box>
  );
}
