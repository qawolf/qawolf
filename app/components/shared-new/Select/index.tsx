import { Button } from "grommet";
import { useState } from "react";

import Chooser from "./Chooser";
import Menu from "./Menu";

type Props = {};

export default function Select({}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => setIsOpen((prev) => !prev);

  return (
    <Button onClick={handleClick} plain style={{ position: "relative" }}>
      <Chooser isOpen={isOpen} />
      {isOpen && <Menu />}
    </Button>
  );
}
