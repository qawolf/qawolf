import { Box } from "grommet";

import { useCreateSuite } from "../../../../hooks/mutations";
import { timestampToText } from "../../../../lib/helpers";
import { RunStatus, Suite } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared-new/AppButton";
import ColorDot from "../../../shared-new/ColorDot";
import Play from "../../../shared-new/icons/Play";
import Search from "../../../shared-new/Search";
import Text from "../../../shared-new/Text";
import { formatSuiteName } from "../../helpers";
import SelectStatus from "./SelectStatus";

type Props = {
  checkedTestIds: string[];
  search: string;
  setSearch: (search: string) => void;
  setStatus: (status: RunStatus | null) => void;
  status: RunStatus | null;
  suite: Suite;
};

export default function Header({
  checkedTestIds,
  search,
  setSearch,
  setStatus,
  status,
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
          {!!suite.trigger_color && (
            <ColorDot
              color={suite.trigger_color}
              margin={{ right: "xxsmall" }}
            />
          )}
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
          label={copy.runTests()}
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
        <SelectStatus runs={suite.runs} setStatus={setStatus} status={status} />
      </Box>
    </Box>
  );
}
