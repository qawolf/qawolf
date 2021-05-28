import { Box } from "grommet";

import Cursor from "../shared/icons/Cursor";

const users = [
  { color: "#C54BDE", x: 300, y: 10 },
  { color: "#56BBD6", x: 150, y: 150 },
  { color: "#8BC22D", x: 500, y: 500 },
  { color: "#E59C59", x: 500, y: 10 },
  { color: "#DA4E94", x: 600, y: 10 },
  { color: "#ABB3C2", x: 700, y: 10 },
  { color: "#667080", x: 800, y: 10 },
];

export default function Cursors(): JSX.Element {
  if (!users.length) return null;

  const cursorsHtml = users.map((user) => {
    return (
      <Box
        style={{ left: user.x, position: "absolute", top: user.y, zIndex: 2 }}
      >
        <Cursor color={user.color} size="16" />
      </Box>
    );
  });

  return <>{cursorsHtml}</>;
}
