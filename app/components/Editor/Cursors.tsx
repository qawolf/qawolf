import { Box } from "grommet";
import { useContext, useEffect } from "react";

import Cursor from "../shared/icons/Cursor";
import { UserContext } from "../UserContext";
import { EditorContext } from "./contexts/EditorContext";
import { useUserAwareness } from "./hooks/useUserAwareness";

export default function Cursors(): JSX.Element {
  const { userAwareness } = useContext(EditorContext);
  const { user } = useContext(UserContext);
  const { users } = useUserAwareness(userAwareness);

  useEffect(() => {
    if (!user || !userAwareness) return;

    const updateMousePosition = (event: MouseEvent) => {
      userAwareness.setUserState({
        avatar_url: user.avatar_url,
        email: user.email,
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        wolf_variant: user.wolf_variant,
      });
    };

    document.addEventListener("mousemove", updateMousePosition, true);

    return () =>
      document.removeEventListener("mousemove", updateMousePosition, true);
  }, [user, userAwareness]);

  if (!users.length) return null;

  const cursorsHtml = users
    .filter((user) => !user.is_current_client)
    .map((user) => {
      return (
        <Box
          key={user.client_id}
          style={{
            left: user.x * window.innerWidth,
            position: "absolute",
            top: user.y * window.innerHeight,
            zIndex: 2,
          }}
        >
          <Cursor color={user.color} size="16" />
        </Box>
      );
    });

  return <>{cursorsHtml}</>;
}
