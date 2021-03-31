import { Box } from "grommet";

import { useCreateStripeCheckoutSession } from "../../hooks/mutations";
import { stripe } from "../../lib/stripe";
import { copy } from "../../theme/copy";
import { border } from "../../theme/theme";
import Button from "./AppButton";

export default function SubscribeBanner(): JSX.Element {
  const [
    createStripeCheckoutSession,
    { loading },
  ] = useCreateStripeCheckoutSession();
  // TODO: return null if already paid or not near limit

  const handleClick = (): void => {
    createStripeCheckoutSession().then(({ data }) => {
      if (!data?.createStripeCheckoutSession) return;

      stripe.redirectToCheckout(data.createStripeCheckoutSession);
    });
  };

  return (
    <Box
      align="center"
      background="gray2"
      border={{ ...border, side: "bottom" }}
      direction="row"
      flex={false}
      pad="xxsmall"
    >
      <Button
        isDisabled={loading}
        label={copy.subscribe}
        onClick={handleClick}
        type="primary"
      />
    </Box>
  );
}
