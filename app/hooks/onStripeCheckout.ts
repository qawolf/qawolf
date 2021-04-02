import { useRouter } from "next/router";
import { useContext } from "react";

import { StateContext } from "../components/StateContext";
import { stripe } from "../lib/stripe";
import { useCreateStripeCheckoutSession } from "./mutations";

type UseOnStripeCheckout = {
  isLoading: boolean;
  onClick: () => void;
};

export const useOnStripeCheckout = (): UseOnStripeCheckout => {
  const { pathname } = useRouter();

  const { teamId } = useContext(StateContext);

  const [
    createStripeCheckoutSession,
    { loading },
  ] = useCreateStripeCheckoutSession();

  const handleClick = (): void => {
    createStripeCheckoutSession({
      variables: {
        app_url: window.location.origin,
        cancel_uri: pathname,
        team_id: teamId,
      },
    }).then(({ data }) => {
      if (!data?.createStripeCheckoutSession) return;

      stripe.redirectToCheckout(data.createStripeCheckoutSession);
    });
  };

  return { isLoading: loading, onClick: handleClick };
};
