import { Box } from "grommet";
import { useEffect, useState } from "react";

import { useOnboarding } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";
import Spinner from "../../shared/Spinner";
import { getOpenSection, Section as SectionType } from "./helpers";
import Section from "./Section";
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

  const handleSectionClick = (section: SectionType): void => {
    setOpenSection((prev) => {
      if (prev === section) return null;
      return section;
    });
  };

  const innerHtml = onboarding ? (
    <Box
      flex={false}
      gap={edgeSize.medium}
      pad={{ horizontal: "medium" }}
      style={{ maxWidth }}
    >
      <Welcome completeCount={completeCount} wolfColor="white" />
      <Section
        isComplete={onboarding.has_completed_tutorial}
        isOpen={openSection === "learn"}
        label={copy.learnQaWolf}
        onClick={() => handleSectionClick("learn")}
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
