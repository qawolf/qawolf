import { Box, Button } from "grommet";
import { Down, Tag } from "grommet-icons";
import { useRef, useState } from "react";

import { SelectedTest, TestTriggers, Trigger } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { hoverTransition, iconSize } from "../../../../../theme/theme";
import Drop from "../../../../shared/Drop";
import Text from "../../../../shared/Text";
import styles from "./AssignTriggers.module.css";
import TriggersDropdown from "./TriggersDropdown";

type Props = {
  selectedTests: SelectedTest[];
  testTriggers: TestTriggers;
  triggers: Trigger[];
};

export default function AssignTriggers({
  selectedTests,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // do not show this if no non-default trigger
  if (!selectedTests.length || !triggers.some((g) => !g.is_default))
    return null;

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
      className={styles.selectTriggers}
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
          <TriggersDropdown
            selectedTests={selectedTests}
            testTriggers={testTriggers}
            triggers={triggers}
          />
        </Drop>
      )}
    </Button>
  );
}
