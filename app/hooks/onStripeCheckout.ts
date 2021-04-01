import { stripe } from "../lib/stripe";
import { useCreateStripeCheckoutSession } from "./mutations";

type UseOnStripeCheckout = {
  isLoading: boolean;
  onClick: () => void;
};

export const useOnStripeCheckout = (): UseOnStripeCheckout => {
  const [
    createStripeCheckoutSession,
    { loading },
  ] = useCreateStripeCheckoutSession();

  const handleClick = (): void => {
    createStripeCheckoutSession().then(({ data }) => {
      if (!data?.createStripeCheckoutSession) return;

      stripe.redirectToCheckout(data.createStripeCheckoutSession);
    });
  };

  return { isLoading: loading, onClick: handleClick };
};
