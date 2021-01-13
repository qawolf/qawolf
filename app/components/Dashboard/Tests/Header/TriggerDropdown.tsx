import { Github } from "grommet-icons";

import { state } from "../../../../lib/state";
import { Group, Integration } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Dropdown from "../../../shared/Dropdown";
import Option from "../../../shared/Dropdown/Option";
import IconButton from "../../../shared/IconButton";
import { formatGroupTrigger } from "../utils";
import styles from "./Header.module.css";

type Props = {
  group: Group;
  integrations: Integration[];
  onClick: (repeatMinutes: number | null) => void;
};

const REPEAT_MINUTES_OPTIONS = [60 * 24, 60];

export default function TriggerDropdown({
  group,
  integrations,
  onClick,
}: Props): JSX.Element {
  const scheduleOptionsHtml = REPEAT_MINUTES_OPTIONS.map((option) => {
    return (
      <Option
        isSelected={option === group.repeat_minutes}
        key={option}
        message={formatGroupTrigger({ repeatMinutes: option })}
        onClick={() => onClick(option)}
      />
    );
  });

  const integrationOptionsHtml = integrations.map((integration) => {
    const handleClick = () =>
      state.setModal({
        group: { id: group.id, name: group.name },
        integration: {
          github_repo_name: integration.github_repo_name,
          id: integration.id,
        },
        name: "deployment",
      });

    return (
      <Option
        isSelected={group.deployment_integration_id === integration.id}
        key={integration.id}
        message={formatGroupTrigger({ repoName: integration.github_repo_name })}
        onClick={handleClick}
      />
    );
  });

  return (
    <Dropdown pad={{ vertical: "small" }}>
      {scheduleOptionsHtml}
      {integrationOptionsHtml}
      <Option
        isSelected={!group.deployment_integration_id && !group.repeat_minutes}
        message={formatGroupTrigger({})}
        onClick={() => onClick(null)}
      />
      <IconButton
        IconComponent={Github}
        className={styles.addSlack}
        color="black"
        href={process.env.NEXT_PUBLIC_GITHUB_APP_URL}
        justify="center"
        margin={{ horizontal: "medium", vertical: "small" }}
        message={
          integrations.length ? copy.manageGitHubRepos : copy.addGitHubRepo
        }
      />
    </Dropdown>
  );
}
