import { Box } from "grommet";
import { useRouter } from "next/router";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";

type Props = {
  isDisabled?: boolean;
  noMargin?: boolean;
  step: number;
};

export default function NextButton({
  isDisabled,
  noMargin,
  step,
}: Props): JSX.Element {
  const { push } = useRouter();

  const handleClick = (): void => {
    push(`${routes.guides}/create-a-test/${step + 1}`);
  };

  return (
    <Box align="end" margin={noMargin ? undefined : { top: "xlarge" }}>
      <Button
        isLarge
        label={copy.next}
        onClick={handleClick}
        type={isDisabled ? "disabled" : "primary"}
      />
    </Box>
  );
}
