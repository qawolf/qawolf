import { useRouter } from "next/router";

import { stripe } from "../lib/stripe";
import { useCreateStripeCheckoutSession } from "./mutations";

type UseOnStripeCheckout = {
  isLoading: boolean;
  onClick: () => void;
};

export const useOnStripeCheckout = (): UseOnStripeCheckout => {
  const { pathname } = useRouter();

  const [
    createStripeCheckoutSession,
    { loading },
  ] = useCreateStripeCheckoutSession();

  const handleClick = (): void => {
    createStripeCheckoutSession({ variables: { cancel_uri: pathname } }).then(
      ({ data }) => {
        if (!data?.createStripeCheckoutSession) return;

        stripe.redirectToCheckout(data.createStripeCheckoutSession);
      }
    );
  };

  return { isLoading: loading, onClick: handleClick };
};
