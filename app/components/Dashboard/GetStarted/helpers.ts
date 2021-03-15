import { Onboarding } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";

export type Section = "addTrigger" | "createTest" | "inviteUser" | "learn";

export const containerProps = {
  background: "gray0",
  round: edgeSize.xxsmall,
};

export const getOpenSection = (onboarding: Onboarding): Section | null => {
  if (!onboarding.has_completed_tutorial) return "learn";
  if (!onboarding.has_created_test) return "createTest";
  if (!onboarding.has_added_trigger_to_test) return "addTrigger";
  if (!onboarding.has_invited_user) return "inviteUser";

  return null;
};
