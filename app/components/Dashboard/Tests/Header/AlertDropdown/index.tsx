import { useUpdateTrigger } from "../../../../../hooks/mutations";
import { Integration, Trigger } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import Dropdown from "../../../../shared/Dropdown";
import Option from "../../../../shared/Dropdown/Option";
import AddSlack from "./AddSlack";

type HandleClick = {
  is_email_enabled: boolean;
  alert_integration_id: string | null;
};

type Props = {
  integrations: Integration[];
  trigger: Trigger;
};

export default function AlertDropdown({
  integrations,
  trigger,
}: Props): JSX.Element {
  const [updateTrigger] = useUpdateTrigger();

  const handleClick = ({
    is_email_enabled,
    alert_integration_id,
  }: HandleClick) => {
    updateTrigger({
      optimisticResponse: {
        updateTrigger: {
          ...trigger,
          is_email_enabled,
          alert_integration_id,
        },
      },
      variables: {
        id: trigger.id,
        is_email_enabled,
        alert_integration_id,
      },
    });
  };

  const slackOptions = integrations.map((integration) => {
    return (
      <Option
        isSelected={trigger.alert_integration_id === integration.id}
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
        isSelected={trigger.is_email_enabled}
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
        isSelected={!trigger.is_email_enabled && !trigger.alert_integration_id}
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
