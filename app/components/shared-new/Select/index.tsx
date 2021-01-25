import { Button } from "grommet";
import { useState } from "react";

import Chooser from "./Chooser";

export default function Select(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  return (
    <Button onClick={handleClick} plain>
      <Chooser isOpen={isOpen} />
    </Button>
  );
}
