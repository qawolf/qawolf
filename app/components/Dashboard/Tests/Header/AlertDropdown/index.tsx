import { useUpdateGroup } from "../../../../../hooks/mutations";
import { Group, Integration } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import Dropdown from "../../../../shared/Dropdown";
import Option from "../../../../shared/Dropdown/Option";
import AddSlack from "./AddSlack";

type HandleClick = {
  is_email_enabled: boolean;
  alert_integration_id: string | null;
};

type Props = { group: Group; integrations: Integration[] };

export default function AlertDropdown({
  group,
  integrations,
}: Props): JSX.Element {
  const [updateGroup] = useUpdateGroup();

  const handleClick = ({
    is_email_enabled,
    alert_integration_id,
  }: HandleClick) => {
    updateGroup({
      optimisticResponse: {
        updateGroup: {
          ...group,
          is_email_enabled,
          alert_integration_id,
        },
      },
      variables: {
        id: group.id,
        is_email_enabled,
        alert_integration_id,
      },
    });
  };

  const slackOptions = integrations.map((integration) => {
    return (
      <Option
        isSelected={group.alert_integration_id === integration.id}
        key={integration.id}
        message={copy.alertSlack({
          channel: integration.slack_channel || "",
          team_name: integration.team_name,
        })}
        onClick={() =>
          handleClick({
            is_email_enabled: false,
            alert_integration_id: integration.id,
          })
        }
      />
    );
  });

  return (
    <Dropdown pad={{ vertical: "small" }}>
      <Option
        isSelected={group.is_email_enabled}
        message={copy.alertEmail}
        onClick={() =>
          handleClick({
            is_email_enabled: true,
            alert_integration_id: null,
          })
        }
      />
      {slackOptions}
      <Option
        isSelected={!group.is_email_enabled && !group.alert_integration_id}
        message={copy.alertNone}
        onClick={() =>
          handleClick({
            is_email_enabled: false,
            alert_integration_id: null,
          })
        }
      />
      <AddSlack />
    </Dropdown>
  );
}
