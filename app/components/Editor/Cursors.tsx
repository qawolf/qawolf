import { Box } from "grommet";
import { useContext, useEffect } from "react";
import { useWindowSize } from "../../hooks/windowSize";

import Cursor from "../shared/icons/Cursor";
import { UserContext } from "../UserContext";
import { EditorContext } from "./contexts/EditorContext";
import { useUserAwareness } from "./hooks/useUserAwareness";

export default function Cursors(): JSX.Element {
  const { userAwareness } = useContext(EditorContext);
  const { user } = useContext(UserContext);
  const { users } = useUserAwareness(userAwareness);

  const windowSize = useWindowSize();

  useEffect(() => {
    if (!user || !userAwareness) return;

    const userProps = {
      avatar_url: user.avatar_url,
      email: user.email,
      wolf_variant: user.wolf_variant,
    };

    userAwareness.setUserState(userProps);

    const updateMousePosition = (event: MouseEvent) => {
      userAwareness.setUserState({
        ...userProps,
        x: event.clientX / windowSize.width,
        y: event.clientY / windowSize.height,
      });
    };

    document.addEventListener("mousemove", updateMousePosition, true);

    return () =>
      document.removeEventListener("mousemove", updateMousePosition, true);
  }, [user, userAwareness, windowSize]);

  if (!users.length) return null;

  const cursorsHtml = users
    .filter((user) => !user.is_current_client && typeof user.x != "undefined")
    .map((user) => {
      return (
        <Box
          key={user.client_id}
          style={{
            left: user.x * windowSize.width,
            position: "absolute",
            top: user.y * windowSize.height,
            zIndex: 2,
          }}
        >
          <Cursor color={user.color} size="16" />
        </Box>
      );
    });

  return <>{cursorsHtml}</>;
}
