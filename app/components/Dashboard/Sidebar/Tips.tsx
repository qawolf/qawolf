import { Box } from "grommet";
import { useContext } from "react";

import { useCreateTestFromGuide } from "../../../hooks/createTestFromGuide";
import { Onboarding } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import { buildTipCopy } from "./helpers";

type Props = {
  onboarding: Onboarding;
  userId: string;
  wolfName: string;
};

export default function Tips({
  onboarding,
  userId,
  wolfName,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { loading, onClick: onLearnClick } = useCreateTestFromGuide({
    guide: "Create a Test",
    href: "/create-a-test",
    teamId,
    userId,
  });

  const { href, label, message, onClick } = buildTipCopy(
    onboarding,
    onLearnClick
  );

  return (
    <Box margin={{ bottom: "xxsmall" }} width="full">
      <Box
        align="center"
        border={border}
        margin={{ horizontal: "medium" }}
        pad="small"
        round="xxsmall"
      >
        <Text color="gray9" size="componentParagraph">
          {copy.wolfHere(wolfName)}
          {message}
        </Text>
        <Button
          href={href}
          isDisabled={loading}
          label={label}
          margin={{ top: "small" }}
          onClick={onClick}
          type="primary"
        />
      </Box>
    </Box>
  );
}
