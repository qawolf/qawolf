import { Box } from "grommet";

import { ShortTest } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { borderSize } from "../../../../../theme/theme";
import CheckBox from "../../../../shared/CheckBox";
import Text from "../../../../shared/Text";
import Actions from "./Actions";

type Props = {
  checkedTestIds: string[];
  setCheckedTestIds: (testIds: string[]) => void;
  tests: ShortTest[];
};

export default function Header({
  checkedTestIds,
  setCheckedTestIds,
  tests,
}: Props): JSX.Element {
  const checked =
    !!tests.length && tests.every((t) => checkedTestIds.includes(t.id));
  const indeterminate =
    !checked && tests.some((t) => checkedTestIds.includes(t.id));

  const handleClick = (): void => {
    if (checked) {
      setCheckedTestIds([]);
    } else {
      const testIds = tests.map((t) => t.id);
      setCheckedTestIds(testIds);
    }
  };

  const label = checkedTestIds.length
    ? copy.selected(checkedTestIds.length)
    : copy.testCount(tests.length);

  const testIds = checkedTestIds.length
    ? checkedTestIds
    : tests.map((t) => t.id);

  return (
    <Box
      align="center"
      background="gray1"
      border={{ color: "gray3", side: "horizontal", size: borderSize.xsmall }}
      direction="row"
      flex={false}
      justify="between"
      pad={{ horizontal: "medium", vertical: "small" }}
    >
      <Box align="center" direction="row">
        <CheckBox
          checked={checked}
          indeterminate={indeterminate}
          onChange={handleClick}
        />
        <Text color="gray9" margin={{ left: "small" }} size="componentBold">
          {label}
        </Text>
      </Box>
      <Actions hasCheckedTests={checkedTestIds.length > 0} testIds={testIds} />
    </Box>
  );
}
