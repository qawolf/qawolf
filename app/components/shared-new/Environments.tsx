import { Box, ThemeContext } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { useEnvironments } from "../../hooks/queries";
import { state } from "../../lib/state";
import { copy } from "../../theme/copy";
import {
  borderSize,
  colors,
  theme,
  transitionDuration,
} from "../../theme/theme-new";
import { StateContext } from "../StateContext";
import Button from "./AppButton";
import Configure from "./icons/Configure";
import Edit from "./icons/Edit";
import Select from "./Select";
import Action from "./Select/Action";
import Option from "./Select/Option";

const dividerId = "environments-divider";

const StyledBox = styled(Box)`
  #${dividerId} {
    transition: background ${transitionDuration};
  }

  &:hover {
    #${dividerId} {
      background: ${colors.gray6};
    }
  }
`;

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

  const openEnvironmentsModal = (): void => {
    state.setModal({ name: "environments" });
  };

  const openVariablesModal = (): void => {
    state.setModal({ name: "envVariables" });
  };

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
      <StyledBox
        alignSelf="center"
        background="gray10"
        direction="row"
        round={borderSize.small}
      >
        <Button
          IconComponent={Configure}
          noBorderSide="right"
          onClick={openVariablesModal}
          type="dark"
        />
        <Box
          background={colors.gray8}
          id="environments-divider"
          width={borderSize.xsmall}
        />
        <Select label={label} noBorderSide="left">
          <Action
            IconComponent={Edit}
            label={copy.environmentsEdit}
            onClick={openEnvironmentsModal}
          />
          {optionsHtml}
        </Select>
      </StyledBox>
    </ThemeContext.Extend>
  );
}
