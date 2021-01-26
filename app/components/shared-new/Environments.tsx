import { Box, ThemeContext } from "grommet";
import { useContext } from "react";
import { useEnvironments } from "../../hooks/queries";
import { theme } from "../../theme/theme-new";
import { StateContext } from "../StateContext";

import Option from "./Select/Option";
import Select from "./Select";
import { state } from "../../lib/state";
import { copy } from "../../theme/copy";
import environment from "../../server/environment";

export default function EnvVariables(): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);
  const { data } = useEnvironments({ team_id: teamId });

  let label = copy.loading;
  if (data?.environments) {
    const selectedEnvironment = data.environments.find(
      (e) => e.id === environmentId
    );
    label = selectedEnvironment
      ? selectedEnvironment.name
      : copy.environmentNotSelected;
  }

  const optionsHtml = (data?.environments || []).map((e) => {
    return (
      <Option
        isSelected={e.id === environmentId}
        key={e.id}
        label={e.name}
        onClick={() => state.setEnvironmentId(e.id)}
      />
    );
  });

  return (
    <ThemeContext.Extend value={theme}>
      <Box alignSelf="center" background="gray10" round="2px">
        <Select label={label}>{optionsHtml}</Select>
      </Box>
    </ThemeContext.Extend>
  );
}
