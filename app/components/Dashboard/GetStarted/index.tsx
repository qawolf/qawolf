import { Box } from "grommet";

import { useOnboarding } from "../../../hooks/queries";
import { edgeSize } from "../../../theme/theme";
import Spinner from "../../shared/Spinner";
import Welcome from "./Welcome";

type Props = { teamId: string };

const maxWidth = "800px";

export default function GetStarted({ teamId }: Props): JSX.Element {
  const { data } = useOnboarding({ team_id: teamId });
  const onboarding = data?.onboarding || null;

  const completeCount = onboarding
    ? Object.values(onboarding).filter((v) => v).length
    : 0;

  const innerHtml = onboarding ? (
    <Box
      flex={false}
      gap={edgeSize.medium}
      pad={{ horizontal: "medium" }}
      style={{ maxWidth }}
    >
      <Welcome completeCount={completeCount} wolfColor="white" />
    </Box>
  ) : (
    <Spinner />
  );

  return (
    <Box
      align="center"
      background="gray2"
      overflow={{ vertical: "auto" }}
      pad={{ vertical: "xxlarge" }}
      width="full"
    >
      {innerHtml}
    </Box>
  );
}
