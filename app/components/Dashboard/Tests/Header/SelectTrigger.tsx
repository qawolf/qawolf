import { Box, Button } from "grommet";
import { Down } from "grommet-icons";
import { useRef, useState } from "react";

import { useUpdateGroup } from "../../../../hooks/mutations";
import { Group, Integration } from "../../../../lib/types";
import { hoverTransition, iconSize } from "../../../../theme/theme";
import Drop from "../../../shared/Drop";
import Text from "../../../shared/Text";
import { formatGroupTrigger } from "../utils";
import styles from "./Header.module.css";
import TriggerDropdown from "./TriggerDropdown";
import TriggerHoverText from "./TriggerHoverText";

type Props = {
  group: Group;
  integrations: Integration[];
};

export default function SelectTrigger({
  group,
  integrations,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [updateGroup, { loading }] = useUpdateGroup();

  const headline = formatGroupTrigger({
    repeatMinutes: group.repeat_minutes,
    repoName: integrations.find((i) => i.id === group.deployment_integration_id)
      ?.github_repo_name,
    skipOwnerInRepoName: true,
  });

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDocument>) => {
    // ignore clicks on the button
    if (ref.current.contains(e.target as HTMLDivElement)) return;
    setIsOpen(false);
  };

  const handleUpdate = (repeat_minutes: number | null) => {
    const updates = {
      deployment_branches: null,
      deployment_environment: null,
      deployment_integration_id: null,
      repeat_minutes,
    };

    updateGroup({
      optimisticResponse: {
        updateGroup: { ...group, ...updates },
      },
      variables: { id: group.id, ...updates },
    });
  };

  return (
    <Button
      a11yTitle="set trigger"
      margin={{ horizontal: "large" }}
      onClick={handleClick}
      plain
    >
      <Box
        align="center"
        className={styles.selectTrigger}
        direction="row"
        ref={ref}
        style={{ position: "relative" }}
      >
        <Box margin={{ right: "small" }}>
          <Text color="fadedBlue" size="medium" weight="bold">
            {headline}
          </Text>
        </Box>
        {!isOpen && <TriggerHoverText group={group} loading={loading} />}
        <Down
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
          <TriggerDropdown
            group={group}
            integrations={integrations}
            onClick={handleUpdate}
          />
        </Drop>
      )}
    </Button>
  );
}
