import { Box } from "grommet";

import { edgeSize } from "../../../theme/theme";
import User from "./User";

const users = [
  {
    avatarUrl: null,
    color: "#4545E5",
    email: "lauracressman@mac.com",
    wolfColor: "husky",
  },
  {
    avatarUrl: null,
    color: "#C54BDE",
    email: "jon@qawolf.com",
    wolfColor: "black",
  },
  {
    avatarUrl: null,
    color: "#56BBD6",
    email: "scott@qawolf.com",
    wolfColor: "gold",
  },
];

export default function Users(): JSX.Element {
  const usersHtml = users.map((user) => {
    return <User key={user.email} {...user} />;
  });

  return (
    <Box direction="row" flex={false} gap={edgeSize.xxsmall}>
      {usersHtml}
    </Box>
  );
}
