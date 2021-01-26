import { Box, ThemeContext } from "grommet";
import { useContext } from "react";

import { useEnvironments } from "../../hooks/queries";
import { state } from "../../lib/state";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import { StateContext } from "../StateContext";
import Edit from "./icons/Edit";
import Select from "./Select";
import Action from "./Select/Action";
import Option from "./Select/Option";

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

  const openModal = (): void => state.setModal({ name: "environments" });

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
        <Select label={label}>
          <Action
            IconComponent={Edit}
            label={copy.environmentsEdit}
            onClick={openModal}
          />
          {optionsHtml}
        </Select>
      </Box>
    </ThemeContext.Extend>
  );
}
