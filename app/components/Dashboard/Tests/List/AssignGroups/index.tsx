import { Box, Button } from "grommet";
import { Down, Tag } from "grommet-icons";
import { useRef, useState } from "react";

import { Group, GroupTests, SelectedTest } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { hoverTransition, iconSize } from "../../../../../theme/theme";
import Drop from "../../../../shared/Drop";
import Text from "../../../../shared/Text";
import styles from "./AssignGroups.module.css";
import GroupsDropdown from "./GroupsDropdown";

type Props = {
  groups: Group[];
  groupTests: GroupTests;
  selectedTests: SelectedTest[];
};

export default function AssignGroups({
  groups,
  groupTests,
  selectedTests,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // do not show this if no non-default group
  if (!selectedTests.length || !groups.some((g) => !g.is_default)) return null;

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
      a11yTitle={copy.assignGroups}
      className={styles.selectGroups}
      onClick={handleClick}
      plain
    >
      <Box align="center" direction="row" margin={{ left: "medium" }} ref={ref}>
        <Tag color="fadedBlue" size={iconSize} />
        <Text color="fadedBlue" margin={{ horizontal: "small" }} size="medium">
          {copy.assignGroups}
        </Text>
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
          <GroupsDropdown
            groups={groups}
            groupTests={groupTests}
            selectedTests={selectedTests}
          />
        </Drop>
      )}
    </Button>
  );
}
