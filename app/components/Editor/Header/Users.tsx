import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize } from "../../../theme/theme";
import { EditorContext } from "../contexts/EditorContext";
import { useUserStates } from "../hooks/useUserAwareness";
import User from "./User";

export default function Users(): JSX.Element {
  const { userAwareness } = useContext(EditorContext);
  const { userStates } = useUserStates(userAwareness);

  const usersHtml = userStates
    // show the current user first
    .sort((a, b) => Number(b.is_current_client) - Number(a.is_current_client))
    .map((user, index) => {
      return <User key={user.client_id} index={index} {...user} />;
    });

  return (
    <Box direction="row" flex={false} gap={edgeSize.xxsmall}>
      {usersHtml}
    </Box>
  );
}
