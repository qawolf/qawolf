import { Box } from "grommet";
import { useEffect, useState } from "react";

import { useOnboarding } from "../../../hooks/queries";
import Spinner from "../../shared/Spinner";
import { getOpenSection, Section as SectionType } from "./helpers";
import Sections from "./Sections";
import Welcome from "./Welcome";

type Props = { teamId: string };

const maxWidth = "800px";

export default function GetStarted({ teamId }: Props): JSX.Element {
  const [openSection, setOpenSection] = useState<SectionType | null>(null);

  const { data } = useOnboarding({ team_id: teamId });
  const onboarding = data?.onboarding || null;

  useEffect(() => {
    if (!onboarding) return;
    setOpenSection(getOpenSection(onboarding));
  }, [onboarding]);

  const completeCount = onboarding
    ? Object.values(onboarding).filter((v) => v).length
    : 0;

  const handleToggleOptn = (section: SectionType): void => {
    setOpenSection((prev) => {
      if (prev === section) return null;
      return section;
    });
  };

  const innerHtml = onboarding ? (
    <Box flex={false} pad={{ horizontal: "medium" }} style={{ maxWidth }}>
      <Welcome completeCount={completeCount} wolfColor="white" />
      <Sections
        onToggleOpen={handleToggleOptn}
        onboarding={onboarding}
        openSection={openSection}
        teamId={teamId}
      />
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
