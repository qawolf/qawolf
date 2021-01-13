import { FaRegTrashAlt } from "react-icons/fa";

import { state } from "../../../../lib/state";
import { SelectedTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { colors } from "../../../../theme/theme";
import IconButton from "../../../shared/IconButton";
import styles from "./List.module.css";

type Props = {
  selectedTests: SelectedTest[];
};

export default function DeleteTests({ selectedTests }: Props): JSX.Element {
  if (!selectedTests.length) return null;

  const handleClick = () => {
    state.setModal({
      name: "deleteTest",
      tests: selectedTests,
    });
  };

  return (
    <IconButton
      IconComponent={FaRegTrashAlt}
      className={styles.createTest}
      color={colors.red}
      margin={{ left: "medium" }}
      message={copy.deleteTests}
      onClick={handleClick}
    />
  );
}
