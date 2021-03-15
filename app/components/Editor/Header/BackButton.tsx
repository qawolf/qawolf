import { useRouter } from "next/router";
import { useContext } from "react";

import { useUpdateUser } from "../../../hooks/mutations";
import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import ArrowLeft from "../../shared/icons/ArrowLeft";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";

export default function BackButton(): JSX.Element {
  const { push } = useRouter();

  const { dashboardUri } = useContext(StateContext);
  const { user } = useContext(UserContext);

  const [updateUser] = useUpdateUser();

  const handleClick = (): void => {
    if (user.onboarded_at) {
      push(dashboardUri || routes.tests);
    } else {
      updateUser({
        variables: { onboarded_at: new Date().toISOString() },
      });
      push(routes.getStarted);
    }
  };

  return (
    <Button
      IconComponent={ArrowLeft}
      a11yTitle={copy.backToDashboard}
      margin={{ right: "xxxsmall" }}
      onClick={handleClick}
      type="ghost"
    />
  );
}
