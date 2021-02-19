import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared-new/Text";
import Buttons from "./Buttons";
import Search from "./Search";

type Props = {
  search: string;
  setSearch: (search: string) => void;
};

export default function Header({ search, setSearch }: Props): JSX.Element {
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
      <Search search={search} setSearch={setSearch} />
    </Box>
  );
}
