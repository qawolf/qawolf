import { Box } from "grommet";
import { useCallback, useContext, useEffect } from "react";

import { Rect, Size } from "../../lib/types";
import Cursor from "../shared/icons/Cursor";
import { EditorContext } from "./contexts/EditorContext";
import { UserState, useUserStates } from "./hooks/useUserAwareness";

type Props = {
  canvasRect: Rect;
  windowSize: Size;
};

export default function Cursors({
  canvasRect,
  windowSize,
}: Props): JSX.Element {
  const { userAwareness } = useContext(EditorContext);
  const { userStates } = useUserStates(userAwareness);

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
    [canvasRect, windowSize]
  );

  useEffect(() => {
    if (!userAwareness || !windowSize) return;

    // set the initial state before the mouse moves
    userAwareness.setCursorPosition({
      canvas_x: -1,
      canvas_y: -1,
      window_x: -1,
      window_y: -1,
    });

    function getStatePosition(x: number, y: number) {
      const coordinates = {
        canvas_x: -1,
        canvas_y: -1,
        window_x: x / windowSize.width,
        window_y: y / windowSize.height,
      };

      const canvasX = canvasRect ? x - canvasRect.x : -1;
      const canvasY = canvasRect ? y - canvasRect.y : -1;

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
      userAwareness.setCursorPosition(
        getStatePosition(event.clientX, event.clientY)
      );
    };

    document.addEventListener("mousemove", updateMousePosition, true);

    return () =>
      document.removeEventListener("mousemove", updateMousePosition, true);
  }, [canvasRect, userAwareness, windowSize]);

  if (!userStates.length) return null;

  const cursorsHtml = userStates
    .filter((user) => !user.is_current_client && user.window_x > -1)
    .map((user, index) => {
      return (
        <Box
          key={user.client_id}
          style={{
            ...getCursorPosition(user),
            position: "absolute",
            zIndex: 2,
          }}
        >
          <Cursor index={index} color={user.color} size="16" />
        </Box>
      );
    });

  return <>{cursorsHtml}</>;
}
