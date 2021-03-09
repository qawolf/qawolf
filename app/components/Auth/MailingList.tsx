import { Box } from "grommet";
import { useContext } from "react";

import { state } from "../../lib/state";
import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import CheckBox from "../shared/CheckBox";
import Text from "../shared/Text";
import { StateContext } from "../StateContext";

type Props = { mode: AuthMode };

export default function MailingList({ mode }: Props): JSX.Element {
  const { isSubscribed } = useContext(StateContext);

  if (mode === "logIn") return null;

  const handleClick = (): void => {
    state.setIsSubscribed(!isSubscribed);
  };

  const labelHtml = (
    <Text color="textLight" size="xsmall" textAlign="center" weight="normal">
      {copy.mailingListSubscribe}
    </Text>
  );

  return (
    <Box
      align="center"
      direction="row"
      justify="center"
      margin={{ top: "small" }}
    >
      <CheckBox
        checked={isSubscribed}
        label={labelHtml}
        onChange={handleClick}
      />
    </Box>
  );
}
