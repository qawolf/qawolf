import { Box, Button } from "grommet";
import { More } from "grommet-icons";
import { useRef, useState } from "react";

import { Group } from "../../../lib/types";
import { hoverTransition, iconSize } from "../../../theme/theme";
import Drop from "../../shared/Drop";
import GroupMenu from "./GroupMenu";
import styles from "./Sidebar.module.css";

type Props = {
  group: Group;
  isVisible: boolean;
};

const PAD = "2px"; // small enough it doesn't affect height of link

export default function GroupMenuButton({
  group,
  isVisible,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (group.is_default) return;
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
        data-test="group options"
        // do not show delete menu for default group
        disabled={group.is_default}
        onClick={handleClick}
        plain
      >
        <Box
          className={styles.groupMenuButton}
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
          <GroupMenu
            closeMenu={() => setIsMenuOpen(false)}
            groupId={group.id}
            groupName={group.name}
          />
        </Drop>
      )}
    </>
  );
}
