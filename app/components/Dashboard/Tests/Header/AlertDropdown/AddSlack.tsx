import { Slack } from "grommet-icons";
import { MouseEvent, useContext, useRef } from "react";

import { useCreateSlackIntegrationUrl } from "../../../../../hooks/mutations";
import { routes } from "../../../../../lib/routes";
import { copy } from "../../../../../theme/copy";
import IconButton from "../../../../shared/IconButton";
import { StateContext } from "../../../../StateContext";
import styles from "../Header.module.css";

export default function AddSlack(): JSX.Element {
  const isRedirectingRef = useRef(false);

  const { groupId } = useContext(StateContext);

  const [
    createSlackIntegrationUrl,
    { data, loading },
  ] = useCreateSlackIntegrationUrl({
    // include group id so we can update that group's alert
    // preferences after they install the Slack app
    redirect_uri: `${routes.slack}/${groupId}`,
  });

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    createSlackIntegrationUrl();
  };

  // if received Slack URL go there
  if (data && data.createSlackIntegrationUrl) {
    isRedirectingRef.current = true;
    window.location.href = data.createSlackIntegrationUrl;
  }

  return (
    <IconButton
      IconComponent={Slack}
      className={styles.addSlack}
      color="black"
      disabled={isRedirectingRef.current || loading}
      iconColor="plain"
      justify="center"
      margin={{ horizontal: "medium", vertical: "small" }}
      message={copy.slackIntegration}
      onClick={handleClick}
    />
  );
}
