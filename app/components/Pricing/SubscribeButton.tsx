import { useContext } from "react";

import { useOnStripeCheckout } from "../../hooks/onStripeCheckout";
import { useOnStripePortal } from "../../hooks/onStripePortal";
import { useTeam } from "../../hooks/queries";
import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import Button from "../shared/Button";
import { StateContext } from "../StateContext";
import { UserContext } from "../UserContext";

export default function SubscribeButton(): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { isLoggedIn } = useContext(UserContext);

  const {
    isLoading: isCheckoutLoading,
    onClick: onCheckoutClick,
  } = useOnStripeCheckout();
  const {
    isLoading: isPortalLoading,
    onClick: onPortalClick,
  } = useOnStripePortal();

  const { data } = useTeam({ id: teamId });
  const isSubscribed = data?.team?.plan === "business";

  const isSubscribedLabel = isSubscribed ? copy.manageBilling : copy.upgrade;
  const handleClick = isSubscribed ? onPortalClick : onCheckoutClick;

  return (
    <Button
      disabled={isCheckoutLoading || isPortalLoading}
      href={isLoggedIn ? undefined : routes.signUp}
      label={isLoggedIn ? isSubscribedLabel : copy.tryForFree}
      onClick={isLoggedIn ? handleClick : undefined}
      size="medium"
      type="primary"
    />
  );
}
