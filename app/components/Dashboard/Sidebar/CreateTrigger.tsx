import { Add } from "grommet-icons";

import { useCreateTrigger } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";
import IconButton from "../../shared/IconButton";
import styles from "./Sidebar.module.css";

type Props = { teamId: string | null };

export default function CreateTrigger({ teamId }: Props): JSX.Element {
  const [createTrigger, { loading }] = useCreateTrigger();

  const handleClick = () => {
    if (!teamId) return;
    createTrigger({ variables: { name: "placeholder", team_id: teamId } });
  };
  // account for border in text margin
  const leftMargin = `calc(${edgeSize.medium} - 1px)`;

  return (
    <IconButton
      IconComponent={Add}
      className={styles.triggerLink}
      color={colors.black}
      disabled={loading}
      message={copy.createGroup}
      onClick={handleClick}
      textMargin={{ left: leftMargin }}
    />
  );
}
