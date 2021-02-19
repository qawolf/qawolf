import { Box } from "grommet";
import { useContext } from "react";
import { borderSize, edgeSize, overflowStyle } from "../../../theme/theme-new";
import Avatar from "../../shared-new/Avatar";
import Logo from "../../shared-new/icons/Logo";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";

export default function Header(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { user, wolf } = useContext(UserContext);

  const team = user?.teams.find((t) => t.id === teamId);

  return (
    <Box align="center" direction="row" justify="between" pad="xxxsmall">
      <Box align="center" direction="row">
        <Box background="textDark" pad="xxxsmall" round={borderSize.small}>
          <Logo width={edgeSize.small} />
        </Box>
        <Text
          color="gray9"
          margin={{ left: "xsmall" }}
          size="componentBold"
          style={overflowStyle}
        >
          {team?.name}
        </Text>
      </Box>
      <Avatar avatarUrl={user?.avatar_url} wolfColor={wolf?.variant} />
    </Box>
  );
}
