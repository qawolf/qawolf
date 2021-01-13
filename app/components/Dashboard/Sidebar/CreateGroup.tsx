import { Add } from "grommet-icons";

import { useCreateGroup } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";
import IconButton from "../../shared/IconButton";
import styles from "./Sidebar.module.css";

type Props = { teamId: string | null };

export default function CreateGroup({ teamId }: Props): JSX.Element {
  const [createGroup, { loading }] = useCreateGroup();

  const handleClick = () => {
    if (!teamId) return;
    createGroup({ variables: { team_id: teamId } });
  };
  // account for border in text margin
  const leftMargin = `calc(${edgeSize.medium} - 1px)`;

  return (
    <IconButton
      IconComponent={Add}
      className={styles.groupLink}
      color={colors.black}
      disabled={loading}
      message={copy.createGroup}
      onClick={handleClick}
      textMargin={{ left: leftMargin }}
    />
  );
}
