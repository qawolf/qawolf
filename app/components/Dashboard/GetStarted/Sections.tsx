import { useContext } from "react";

import { useCreateTestFromGuide } from "../../../hooks/createTestFromGuide";
import { Onboarding } from "../../../lib/types";
import { UserContext } from "../../UserContext";
import { Section as SectionType } from "./helpers";
import Section from "./Section";

type Props = {
  onToggleOpen: (section: SectionType) => void;
  onboarding: Onboarding;
  openSection: SectionType | null;
  teamId: string;
};

export default function Sections({
  onToggleOpen,
  onboarding,
  openSection,
  teamId,
}: Props): JSX.Element {
  const { user } = useContext(UserContext);

  const { loading, onClick: onLearnClick } = useCreateTestFromGuide({
    href: "/create-a-test",
    name: "Guide: Create a Test",
    teamId,
    userId: user?.id,
  });

  return (
    <>
      <Section
        isComplete={onboarding.has_completed_tutorial}
        isDisabled={loading || !user}
        isOpen={openSection === "learn"}
        onButtonClick={onLearnClick}
        onToggleOpen={onToggleOpen}
        section="learn"
      />
    </>
  );
}
