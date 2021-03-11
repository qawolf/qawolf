import { Box } from "grommet";
import { useRouter } from "next/router";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";

type Props = { step: number };

export const width = "160px";

export default function NextButton({ step }: Props): JSX.Element {
  const { push } = useRouter();

  const handleClick = (): void => {
    push(`${routes.playground}/intro/${step + 1}`);
  };

  return (
    <Box alignSelf="center" margin={{ top: "medium" }}>
      <Button
        label={copy.next}
        onClick={handleClick}
        size="medium"
        type="outlineDark"
        width={width}
      />
    </Box>
  );
}
