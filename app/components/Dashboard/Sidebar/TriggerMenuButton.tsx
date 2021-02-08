import { Box, Button } from "grommet";
import { More } from "grommet-icons";
import { useRef, useState } from "react";

import { Trigger } from "../../../lib/types";
import { hoverTransition, iconSize } from "../../../theme/theme";
import Drop from "../../shared/Drop";
import TriggerMenu from "./TriggerMenu";
import styles from "./Sidebar.module.css";

type Props = {
  isVisible: boolean;
  trigger: Trigger;
};

const PAD = "2px"; // small enough it doesn't affect height of link

export default function TriggerMenuButton({
  isVisible,
  trigger,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (trigger.is_default) return;
    e.stopPropagation(); // do not click on entire button
    setIsMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDocument>) => {
    // ignore clicks on the parent
    if (ref.current.contains(e.target as HTMLDivElement)) return;
    setIsMenuOpen(false);
  };

  return (
    <>
      <Button
        a11yTitle="show options"
        data-test="trigger options"
        // do not show delete menu for default trigger
        disabled={trigger.is_default}
        onClick={handleClick}
        plain
      >
        <Box
          className={styles.triggerMenuButton}
          flex={false}
          margin={{ right: "small" }}
          pad={PAD}
          ref={ref}
          round="xsmall"
          style={{ opacity: isVisible ? 1 : 0, transition: hoverTransition }}
        >
          <More color="black" size={iconSize} />
        </Box>
      </Button>
      {isMenuOpen && (
        <Drop
          align={{ left: "right" }}
          onClickOutside={handleClickOutside}
          onEsc={() => setIsMenuOpen(false)}
          target={ref.current}
        >
          <TriggerMenu
            closeMenu={() => setIsMenuOpen(false)}
            triggerId={trigger.id}
            triggerName={trigger.name}
          />
        </Drop>
      )}
    </>
  );
}
