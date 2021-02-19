import { Box } from "grommet";
import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize, overflowStyle } from "../../../theme/theme-new";
import Avatar from "../../shared-new/Avatar";
import DotCircle from "../../shared-new/icons/DotCircle";
import Gear from "../../shared-new/icons/Gear";
import List from "../../shared-new/icons/List";
import Logo from "../../shared-new/icons/Logo";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";
import DashboardLink from "./DashboardLink";

export default function Header(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { user, wolf } = useContext(UserContext);

  const team = user?.teams.find((t) => t.id === teamId);

  const handleSettingsClick = (): void => {
    state.setModal({ name: "teamSettings", teamId });
  };

  return (
    <>
      <Box align="center" direction="row" justify="between" pad="xxxsmall">
        <Box align="center" direction="row">
          <Box background="textDark" pad="xxxsmall" round={borderSize.small}>
            <Logo width={edgeSize.small} />
          </Box>
          {!!team && (
            <Text
              color="gray9"
              margin={{ left: "xsmall" }}
              size="componentBold"
              style={overflowStyle}
            >
              {team.name}
            </Text>
          )}
        </Box>
        {!!user && (
          <Avatar avatarUrl={user.avatar_url} wolfColor={wolf?.variant} />
        )}
      </Box>
      <Box gap={borderSize.small} margin={{ top: "medium" }}>
        <DashboardLink
          IconComponent={List}
          href={routes.tests}
          isSelected
          label={copy.allTests}
        />
        <DashboardLink
          IconComponent={DotCircle}
          href={routes.tests}
          isSelected={false}
          label={copy.runHistory}
        />
        <DashboardLink
          IconComponent={Gear}
          isSelected={false}
          label={copy.settings}
          onClick={handleSettingsClick}
        />
      </Box>
    </>
  );
}
