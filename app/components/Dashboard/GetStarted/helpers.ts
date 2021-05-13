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
  addTrigger: copy.manageTriggers,
  createTest: copy.createTest,
  inviteUser: copy.openSettings,
  learn: copy.startTutorial,
};

export const completeButtonLabels = {
  learn: copy.revisitTutorial,
};

export const details: { [section in Section]: string } = {
  addTrigger: copy.addTriggerToTestDetail,
  createTest: copy.createFirstTestDetail,
  inviteUser: copy.inviteWolfpackDetail,
  learn: copy.learnQaWolfDetail,
};

export const docsHref: { [section in Section]: string } = {
  addTrigger: `${routes.docs}/run-tests-on-a-schedule`,
  createTest: `${routes.docs}/create-a-test`,
  inviteUser: `${routes.docs}/invite-team-members`,
  learn: `${routes.docs}/create-a-test`,
};

export const labels: { [section in Section]: string } = {
  addTrigger: copy.addTriggerToTest,
  createTest: copy.createFirstTest,
  inviteUser: copy.inviteWolfpack,
  learn: copy.learnQaWolf,
};

export const getOpenSection = (onboarding: Onboarding): Section | null => {
  if (!onboarding.has_completed_tutorial) return "learn";
  if (!onboarding.has_created_test) return "createTest";
  if (!onboarding.has_trigger) return "addTrigger";
  if (!onboarding.has_invited_user) return "inviteUser";

  return null;
};
