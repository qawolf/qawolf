import { Box } from "grommet";
import { useState } from "react";

import Header from "./Header";

export default function Tests(): JSX.Element {
  const [search, setSearch] = useState("");

  return (
    <Box width="full">
      <Header search={search} setSearch={setSearch} />
    </Box>
  );
}
