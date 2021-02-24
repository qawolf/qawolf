import { Box } from "grommet";

import { timestampToText } from "../../../../lib/helpers";
import { RunStatus, Suite } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import ColorDot from "../../../shared-new/ColorDot";
import Search from "../../../shared-new/Search";
import Text from "../../../shared-new/Text";
import SelectStatus from "./SelectStatus";

type Props = {
  search: string;
  setSearch: (search: string) => void;
  setStatus: (status: RunStatus | null) => void;
  status: RunStatus | null;
  suite: Suite;
};

export default function Header({
  search,
  setSearch,
  setStatus,
  status,
  suite,
}: Props): JSX.Element {
  return (
    <Box flex={false}>
      <Box align="center" direction="row">
        {!!suite.trigger_color && (
          <ColorDot color={suite.trigger_color} margin={{ right: "xxsmall" }} />
        )}
        <Text color="gray9" margin={{ right: "xxsmall" }} size="componentBold">
          {suite.trigger_name || copy.manuallyTriggered}
        </Text>
        <Text color="gray7" size="component">
          {timestampToText(suite.created_at)}
        </Text>
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
