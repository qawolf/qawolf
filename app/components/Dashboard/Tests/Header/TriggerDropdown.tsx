import { Github } from "grommet-icons";

import { state } from "../../../../lib/state";
import { Integration, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Dropdown from "../../../shared/Dropdown";
import Option from "../../../shared/Dropdown/Option";
import IconButton from "../../../shared/IconButton";
import { formatTrigger } from "../utils";
import styles from "./Header.module.css";

type Props = {
  integrations: Integration[];
  onClick: (repeatMinutes: number | null) => void;
  trigger: Trigger;
};

const REPEAT_MINUTES_OPTIONS = [60 * 24, 60];

export default function TriggerDropdown({
  integrations,
  onClick,
  trigger,
}: Props): JSX.Element {
  const scheduleOptionsHtml = REPEAT_MINUTES_OPTIONS.map((option) => {
    return (
      <Option
        isSelected={option === trigger.repeat_minutes}
        key={option}
        message={formatTrigger({ repeatMinutes: option })}
        onClick={() => onClick(option)}
      />
    );
  });

  const integrationOptionsHtml = integrations.map((integration) => {
    const handleClick = () => {};

    return (
      <Option
        isSelected={trigger.deployment_integration_id === integration.id}
        key={integration.id}
        message={formatTrigger({ repoName: integration.github_repo_name })}
        onClick={handleClick}
      />
    );
  });

  return (
    <Dropdown pad={{ vertical: "small" }}>
      {scheduleOptionsHtml}
      {integrationOptionsHtml}
      <Option
        isSelected={
          !trigger.deployment_integration_id && !trigger.repeat_minutes
        }
        message={formatTrigger({})}
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
