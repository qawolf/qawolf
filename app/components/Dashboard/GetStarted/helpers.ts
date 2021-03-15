import { routes } from "../../../lib/routes";
import { Onboarding } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";

export type Section = "addTrigger" | "createTest" | "inviteUser" | "learn";

export const containerProps = {
  background: "gray0",
  round: edgeSize.xxsmall,
};

export const buttonLabels: { [section in Section]: string } = {
  addTrigger: "",
  createTest: "",
  inviteUser: "",
  learn: copy.startTutorial,
};

export const completeButtonLabels = {
  learn: copy.revisitTutorial,
};

export const details: { [section in Section]: string } = {
  addTrigger: "",
  createTest: "",
  inviteUser: "",
  learn: copy.learnQaWolfDetail,
};

export const docsHref: { [section in Section]: string } = {
  addTrigger: "",
  createTest: "",
  inviteUser: "",
  learn: `${routes.docs}/create-a-test`,
};

export const labels: { [section in Section]: string } = {
  addTrigger: "",
  createTest: "",
  inviteUser: "",
  learn: copy.learnQaWolf,
};

export const getOpenSection = (onboarding: Onboarding): Section | null => {
  if (!onboarding.has_completed_tutorial) return "learn";
  if (!onboarding.has_created_test) return "createTest";
  if (!onboarding.has_added_trigger_to_test) return "addTrigger";
  if (!onboarding.has_invited_user) return "inviteUser";

  return null;
};
