import { Box } from "grommet";
import { useRouter } from "next/router";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";

type Props = { step: number };

export default function NextButton({ step }: Props): JSX.Element {
  const { push } = useRouter();

  const handleClick = (): void => {
    push(`${routes.guides}/create-a-test/${step + 1}`);
  };

  return (
    <Box align="end" margin={{ top: "xlarge" }}>
      <Button isLarge label={copy.next} onClick={handleClick} type="primary" />
    </Box>
  );
}
