import { MailDataRequired } from "@sendgrid/mail";
import * as EmailValidator from "email-validator";

import { Logger } from "../../Logger";
import { deleteInvite, findInvite } from "../../models/invite";
import { findUsersForTeam } from "../../models/user";
import { ModelOptions, Suite, SuiteRun, Trigger, User } from "../../types";
import { sendEmail } from "../sendgrid";
import {
  buildInviteHtml,
  buildLoginCode,
  buildLoginCodeHtml,
  buildSuiteHtml,
} from "./html";
import { buildSuiteName } from "./utils";

type SendEmailAlert = {
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger | null;
};

type SendEmailForLoginCode = {
  logger: Logger;
  login_code: string;
  user: User;
};

type SendEmailForSuite = {
  logger: Logger;
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger | null;
  user: User;
};

export const buildFrom = (wolfName: string): MailDataRequired["from"] => {
  const wolfEmail = `${wolfName.toLowerCase()}@qawolf.com`;

  return {
    email: EmailValidator.validate(wolfEmail) ? wolfEmail : "hello@qawolf.com",
    name: `${wolfName} the QA Wolf`,
  };
};

export const sendEmailForInvite = async (
  inviteId: string,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendEmailForInvite");
  log.debug("invite", inviteId);

  const invite = await findInvite(inviteId, options);

  try {
    await sendEmail({
      from: buildFrom(invite.wolf_name),
      html: buildInviteHtml(invite),
      subject: `🐺 ${invite.creator_email} has invited you to join the team ${invite.team_name}`,
      reply_to: "hello@qawolf.com",
      to: invite.email,
    });

    log.debug("email sent");
  } catch (error) {
    log.alert("error: email invite", invite);
    // delete invite from database if cannot send email
    await deleteInvite(invite.id, options);
  }
};

export const sendEmailForLoginCode = async ({
  logger,
  login_code,
  user,
}: SendEmailForLoginCode): Promise<void> => {
  const log = logger.prefix("sendEmailForLoginCode");
  log.debug(user.email);

  if (!user.login_code_digest || !user.login_code_expires_at) {
    logger.error(`No login code for user ${user.id}`);
    throw new Error("No login code for user");
  }

  try {
    await sendEmail({
      from: buildFrom(user.wolf_name),
      html: buildLoginCodeHtml({ login_code, user }),
      reply_to: "hello@qawolf.com",
      subject: `🐺 QA Wolf code: ${buildLoginCode(login_code)}`,
      to: user.email,
    });

    log.debug(`sent email to ${user.email}`);
  } catch (error) {
    logger.alert("error: email code", user.email, error.message);
  }
};

export const sendEmailForSuite = async ({
  logger,
  runs,
  suite,
  trigger,
  user,
}: SendEmailForSuite): Promise<void> => {
  const log = logger.prefix("sendEmailForSuite");
  log.debug(user.email);

  const is_fail = runs.some((r) => r.status === "fail");
  const suiteName = buildSuiteName({ suite, trigger });

  const subject = is_fail
    ? `❌ Your ${suiteName} tests failed.`
    : `✅ Your ${suiteName} tests passed.`;

  try {
    await sendEmail({
      from: buildFrom(user.wolf_name),
      html: buildSuiteHtml({ runs, suite, trigger }),
      reply_to: "hello@qawolf.com",
      subject,
      to: user.email,
    });

    log.debug("sent email to %s", user.email);
  } catch (error) {
    log.alert("error: email alert", user.email, error.message);
  }
};

export const sendEmailAlert = async (
  { runs, suite, trigger }: SendEmailAlert,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("sendEmailAlert");
  log.debug("suite", suite.id);

  const users = await findUsersForTeam(suite.team_id, options);

  const sendPromises = users.map((user) =>
    sendEmailForSuite({
      logger: options.logger,
      runs,
      suite,
      trigger,
      user,
    })
  );

  await Promise.all(sendPromises);
};
