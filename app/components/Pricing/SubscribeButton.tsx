import { useContext } from "react";

import { useBuildCheckoutHref } from "../../hooks/buildCheckoutHref";
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

  const checkoutHref = useBuildCheckoutHref();
  const { isLoading, onClick } = useOnStripePortal();

  const { data } = useTeam({ id: teamId });
  const isSubscribed = data?.team?.plan === "business";

  const isSubscribedLabel = isSubscribed ? copy.manageBilling : copy.upgrade;

  const handleClick = isSubscribed ? onClick : undefined;
  const href = isSubscribed ? undefined : checkoutHref;

  return (
    <Button
      disabled={isLoading}
      href={isLoggedIn ? href : routes.signUp}
      label={isLoggedIn ? isSubscribedLabel : copy.tryForFree}
      onClick={isLoggedIn ? handleClick : undefined}
      size="medium"
      type="primary"
    />
  );
}
