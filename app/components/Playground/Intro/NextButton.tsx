import { Box } from "grommet";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";

type Props = {
  isComplete?: boolean;
  step: number;
};

export const width = "160px";

export default function NextButton({ isComplete, step }: Props): JSX.Element {
  return (
    <Box alignSelf="center" margin={{ top: "medium" }}>
      <Button
        href={`${routes.playground}/intro/${step + 1}`}
        label={isComplete ? copy.complete : copy.next}
        size="medium"
        type="outlineDark"
        width={width}
      />
    </Box>
  );
}
