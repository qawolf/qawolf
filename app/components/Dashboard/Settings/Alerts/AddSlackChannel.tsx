import { Slack } from "grommet-icons";
import { useRef } from "react";

import { useCreateSlackIntegrationUrl } from "../../../../hooks/mutations";
import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import Button from "../../../shared-new/AppButton";

type Props = { teamId: string };

export default function AddSlackChannel({ teamId }: Props): JSX.Element {
  const isRedirectingRef = useRef(false);

  const [
    createSlackIntegrationUrl,
    { data, loading },
  ] = useCreateSlackIntegrationUrl({
    redirect_uri: `${routes.slack}/${teamId}`,
  });

  // if received Slack URL go there
  if (data && data.createSlackIntegrationUrl) {
    isRedirectingRef.current = true;
    window.location.href = data.createSlackIntegrationUrl;
  }

  return (
    <Button
      IconComponent={Slack}
      iconColor="plain"
      isDisabled={loading}
      justify="center"
      label={copy.addSlackChannel}
      onClick={createSlackIntegrationUrl}
      type="secondary"
    />
  );
}
