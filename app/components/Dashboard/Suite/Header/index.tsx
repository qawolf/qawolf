import { Box } from "grommet";

import { useCreateSuite } from "../../../../hooks/mutations";
import { timestampToText } from "../../../../lib/helpers";
import { Suite } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared-new/AppButton";
import Play from "../../../shared-new/icons/Play";
import Search from "../../../shared-new/Search";
import Text from "../../../shared-new/Text";
import TriggerIcon from "../../../shared-new/TriggerIcon";
import { formatSuiteName } from "../../helpers";
import SelectStatus from "./SelectStatus";

type Props = {
  checkedTestIds: string[];
  search: string;
  setSearch: (search: string) => void;
  suite: Suite;
};

export default function Header({
  checkedTestIds,
  search,
  setSearch,
  suite,
}: Props): JSX.Element {
  const [createSuite, { loading }] = useCreateSuite();

  const test_ids = checkedTestIds.length
    ? checkedTestIds
    : suite.runs.map((r) => r.test_id);

  const handleClick = (): void => {
    if (!test_ids.length) return;

    createSuite({
      variables: {
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
            margin={{ right: "xxsmall" }}
            size="componentBold"
          >
            {formatSuiteName(suite)}
          </Text>
          <Text color="gray7" size="component">
            {timestampToText(suite.created_at)}
          </Text>
        </Box>
        <Button
          IconComponent={Play}
          isDisabled={loading}
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
