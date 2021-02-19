import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import { borderSize } from "../../../../theme/theme-new";
import Text from "../../../shared-new/Text";
import Buttons from "./Buttons";
import Search from "./Search";

type Props = {
  search: string;
  setSearch: (search: string) => void;
};

export default function Header({ search, setSearch }: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      justify="between"
      pad="medium"
    >
      <Box align="center" direction="row">
        <Text color="gray9" margin={{ right: "medium" }} size="componentHeader">
          {copy.allTests}
        </Text>
        <Search search={search} setSearch={setSearch} />
      </Box>
      <Buttons />
    </Box>
  );
}
