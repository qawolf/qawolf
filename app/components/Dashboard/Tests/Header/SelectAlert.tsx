import { Box, Button } from "grommet";
import { Down } from "grommet-icons";
import { useRef, useState } from "react";

import { Integration, Trigger } from "../../../../lib/types";
import { hoverTransition, iconSize } from "../../../../theme/theme";
import Drop from "../../../shared/Drop";
import AlertDropdown from "./AlertDropdown";
import AlertHeader from "./AlertHeader";
import styles from "./Header.module.css";

type Props = {
  integrations: Integration[];
  trigger: Trigger;
};

export default function SelectAlert({
  integrations,
  trigger,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDocument>) => {
    // ignore clicks on the button
    if (ref.current.contains(e.target as HTMLDivElement)) return;
    setIsOpen(false);
  };

  return (
    <Button
      a11yTitle="set alerts"
      className={styles.selectAlert}
      onClick={handleClick}
      plain
    >
      <Box align="center" direction="row" margin={{ right: "large" }} ref={ref}>
        <AlertHeader integrations={integrations} trigger={trigger} />
        <Down
          className={styles.down}
          color="fadedBlue"
          size={iconSize}
          style={{ transition: hoverTransition }}
        />
      </Box>
      {isOpen && (
        <Drop
          onClickOutside={handleClickOutside}
          onEsc={() => setIsOpen(false)}
          target={ref.current}
        >
          <AlertDropdown integrations={integrations} trigger={trigger} />
        </Drop>
      )}
    </Button>
  );
}
