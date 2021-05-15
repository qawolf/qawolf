import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { Onboarding } from "../../../lib/types";
import { copy } from "../../../theme/copy";

type BuildTipCopy = {
  href?: string;
  label: string;
  message: string;
  onClick?: () => void;
};

export const buildIsOnboarded = (onboarding: Onboarding | null): boolean => {
  if (!onboarding) return true;

  // completing tutorial not hard requirement for onboarding
  return (
    onboarding.has_created_test &&
    onboarding.has_trigger &&
    onboarding.has_invited_user
  );
};

export const buildTipCopy = (
  onboarding: Onboarding,
  onLearnClick: () => void
): BuildTipCopy => {
  if (!onboarding.has_completed_tutorial && !onboarding.has_created_test) {
    return {
      label: copy.startTutorial,
      message: copy.wolfTipTutorial,
      onClick: onLearnClick,
    };
  }

  if (!onboarding.has_created_test) {
    return {
      label: copy.createTest,
      message: copy.wolfTipCreateTest,
      onClick: (): void => {
        state.setModal({ name: "createTest" });
      },
    };
  }

  if (!onboarding.has_trigger) {
    return {
      label: copy.manageTriggers,
      message: copy.wolfTipTrigger,
      onClick: (): void => {
        state.setModal({ name: "triggers" });
      },
    };
  }

  return {
    href: routes.settings,
    label: copy.openSettings,
    message: copy.wolfTipInvite,
  };
};
