import { Box } from "grommet";
import { useContext } from "react";

import { UserContext } from "../../UserContext";
import { useUsers } from "../hooks/users";
import Collaborator from "./Collaborator";

const SHOW_USER_COUNT = 2;

export default function Collaborators(): JSX.Element {
  const { user } = useContext(UserContext);
  const users = useUsers(user);
  if (!user) return null;

  const otherUsers = users.filter((u) => u.email !== user.email);
  if (!otherUsers.length) return null;

  const showUsers = otherUsers.slice(0, SHOW_USER_COUNT);
  const extraWolfNames = otherUsers
    .slice(SHOW_USER_COUNT)
    .map((user) => user.wolfName);

  const collaboratorsHtml = showUsers.map((user, i) => {
    return <Collaborator key={i} user={user} />;
  });

  return (
    <Box align="center" direction="row">
      {collaboratorsHtml}
      {!!extraWolfNames.length && (
        <Collaborator extraWolfNames={extraWolfNames} />
      )}
    </Box>
  );
}
