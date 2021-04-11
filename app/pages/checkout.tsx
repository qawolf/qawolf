import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../components/shared/Spinner";
import { StateContext } from "../components/StateContext";
import { useEnsureUser } from "../hooks/ensureUser";
import { useCreateStripeCheckoutSession } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { stripe } from "../lib/stripe";
import { edgeSize } from "../theme/theme";

export default function Checkout(): JSX.Element {
  useEnsureUser();

  const { teamId } = useContext(StateContext);
  const { query } = useRouter();

  const cancel_uri = (query.cancel_uri as string) || routes.settings;

  const [
    createStripeCheckoutSession,
    { called },
  ] = useCreateStripeCheckoutSession();

  // create Stripe checkout session
  useEffect(() => {
    if (!called && teamId) {
      createStripeCheckoutSession({
        variables: {
          app_url: window.location.origin,
          cancel_uri,
          team_id: teamId,
        },
      }).then(({ data }) => {
        if (!data?.createStripeCheckoutSession) return;

        stripe.redirectToCheckout(data.createStripeCheckoutSession);
      });
    }
  }, [called, cancel_uri, createStripeCheckoutSession, teamId]);

  return <Spinner margin={{ top: edgeSize.xxxlarge }} />;
}
