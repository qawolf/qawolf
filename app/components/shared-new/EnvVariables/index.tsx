import { Box, ThemeContext } from "grommet";
import { useContext } from "react";
import { useEnvironments } from "../../../hooks/queries";
import { theme } from "../../../theme/theme-new";
import { StateContext } from "../../StateContext";

import Select from "../Select";

export default function EnvVariables(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { data } = useEnvironments({ team_id: teamId });

  if (!data) return null;

  return (
    <ThemeContext.Extend value={theme}>
      <Box alignSelf="center" background="gray10" round="2px">
        <Select />
      </Box>
    </ThemeContext.Extend>
  );
}
