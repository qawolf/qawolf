import { Box } from "grommet";
import { useCallback, useContext, useEffect } from "react";

import { Rect, Size } from "../../lib/types";
import Cursor from "../shared/icons/Cursor";
import { UserContext } from "../UserContext";
import { EditorContext } from "./contexts/EditorContext";
import { UserState, useUserAwareness } from "./hooks/useUserAwareness";

type Props = {
  canvasRect: Rect;
  windowSize: Size;
};

export default function Cursors({
  canvasRect,
  windowSize,
}: Props): JSX.Element {
  const { userAwareness } = useContext(EditorContext);
  const { user } = useContext(UserContext);
  const { users } = useUserAwareness(userAwareness);

  const getCursorPosition = useCallback(
    (user: UserState): { left: number; top: number } => {
      if (user.canvas_x > -1) {
        return {
          left: canvasRect.x + user.canvas_x * canvasRect.width,
          top: canvasRect.y + user.canvas_y * canvasRect.height,
        };
      }

      return {
        left: user.window_x * windowSize.width,
        top: user.window_y * windowSize.height,
      };
    },
    [canvasRect]
  );

  useEffect(() => {
    if (!canvasRect || !user || !userAwareness || !windowSize) return;

    const userState = {
      avatar_url: user.avatar_url,
      canvas_x: -1,
      canvas_y: -1,
      email: user.email,
      window_x: -1,
      window_y: -1,
      wolf_variant: user.wolf_variant,
    };

    // set the initial state before the mouse moves
    userAwareness.setUserState(userState);

    function getStatePosition(x: number, y: number) {
      const coordinates = {
        canvas_x: -1,
        canvas_y: -1,
        window_x: x / windowSize.width,
        window_y: y / windowSize.height,
      };

      const canvasX = x - canvasRect.x;
      const canvasY = y - canvasRect.y;

      // when inside the canvas send it's relative coordinates
      if (
        canvasX >= 0 &&
        canvasX <= canvasRect.width &&
        canvasY >= 0 &&
        canvasY <= canvasRect.height
      ) {
        coordinates.canvas_x = canvasX / canvasRect.width;
        coordinates.canvas_y = canvasY / canvasRect.height;
      }

      return coordinates;
    }

    const updateMousePosition = (event: MouseEvent) => {
      userAwareness.setUserState({
        ...userState,
        ...getStatePosition(event.clientX, event.clientY),
      });
    };

    document.addEventListener("mousemove", updateMousePosition, true);

    return () =>
      document.removeEventListener("mousemove", updateMousePosition, true);
  }, [canvasRect, user, userAwareness, windowSize]);

  if (!users.length) return null;

  const cursorsHtml = users
    .filter((user) => !user.is_current_client && user.window_x > -1)
    .map((user) => {
      return (
        <Box
          key={user.client_id}
          style={{
            ...getCursorPosition(user),
            position: "absolute",
            zIndex: 2,
          }}
        >
          <Cursor color={user.color} size="16" />
        </Box>
      );
    });

  return <>{cursorsHtml}</>;
}
