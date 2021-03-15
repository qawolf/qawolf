import { Box } from "grommet";

import { useCreateTestFromGuide } from "../../../hooks/createTestFromGuide";
import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { Onboarding } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";
import { Section as SectionType } from "./helpers";
import Section from "./Section";

type Props = {
  onToggleOpen: (section: SectionType) => void;
  onboarding: Onboarding;
  openSection: SectionType | null;
  teamId: string;
  userId?: string;
};

export default function Sections({
  onToggleOpen,
  onboarding,
  openSection,
  teamId,
  userId,
}: Props): JSX.Element {
  const { loading, onClick: onLearnClick } = useCreateTestFromGuide({
    href: "/create-a-test",
    name: "Guide: Create a Test",
    teamId,
    userId,
  });

  const handleCreateClick = (): void => {
    state.setModal({ name: "createTest" });
  };

  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds: [] });
  };

  return (
    <Box gap={edgeSize.medium}>
      <Section
        isComplete={onboarding.has_completed_tutorial}
        isDisabled={loading || !userId}
        isOpen={openSection === "learn"}
        onButtonClick={onLearnClick}
        onToggleOpen={onToggleOpen}
        section="learn"
      />
      <Section
        isComplete={onboarding.has_created_test}
        isOpen={openSection === "createTest"}
        onButtonClick={handleCreateClick}
        onToggleOpen={onToggleOpen}
        section="createTest"
      />
      <Section
        isComplete={onboarding.has_added_trigger_to_test}
        isOpen={openSection === "addTrigger"}
        onButtonClick={handleTriggerClick}
        onToggleOpen={onToggleOpen}
        section="addTrigger"
      />
      <Section
        buttonHref={routes.settings}
        isComplete={onboarding.has_invited_user}
        isOpen={openSection === "inviteUser"}
        onToggleOpen={onToggleOpen}
        section="inviteUser"
      />
    </Box>
  );
}
