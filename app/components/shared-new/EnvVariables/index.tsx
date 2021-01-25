import { Box, ThemeContext } from "grommet";
import { theme } from "../../../theme/theme-new";

import Select from "../Select";

export default function EnvVariables(): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Box alignSelf="center" background="gray10" round="2px">
        <Select />
      </Box>
    </ThemeContext.Extend>
  );
}
