import { Box, Button } from "grommet";
import { ReactNode, useState } from "react";

import Chooser from "./Chooser";
import Menu from "./Menu";

type Props = { children: ReactNode };

export default function Select({ children }: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  return (
    <Box style={{ position: "relative" }}>
      <Button onClick={handleClick} plain>
        <Chooser isOpen={isOpen} />
      </Button>
      {isOpen && <Menu>{children}</Menu>}
    </Box>
  );
}
