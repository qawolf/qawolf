import { Box } from "grommet";

import { useOnStripeCheckout } from "../../hooks/onStripeCheckout";
import { copy } from "../../theme/copy";
import { border } from "../../theme/theme";
import Button from "./AppButton";

export default function SubscribeBanner(): JSX.Element {
  const { isLoading, onClick } = useOnStripeCheckout();

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
        isDisabled={isLoading}
        label={copy.subscribe}
        onClick={onClick}
        type="primary"
      />
    </Box>
  );
}
