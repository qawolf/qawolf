import sgMail, { MailDataRequired } from "@sendgrid/mail";

import environment from "../../environment";
import { Logger } from "../../Logger";
import { deleteInvite, findInvite } from "../../models/invite";
import { findUsersForTeam } from "../../models/user";
import { Group, Suite, SuiteRun, User } from "../../types";
import {
  buildInviteHtml,
  buildLoginCode,
  buildLoginCodeHtml,
  buildSuiteHtml,
} from "./html";

sgMail.setApiKey(environment.SENDGRID_API_KEY);

type SendEmailForInvite = {
  inviteId: string;
  logger: Logger;
};

type SendEmailForLoginCode = {
  logger: Logger;
  login_code: string;
  user: User;
};

type SendEmailForSuite = {
  group: Group;
  logger: Logger;
  runs: SuiteRun[];
  suite_id: string;
  user: User;
};

type SendEmailAlert = {
  group: Group;
  logger: Logger;
  runs: SuiteRun[];
  suite: Suite;
};

const buildFrom = (wolfName: string): MailDataRequired["from"] => {
  return {
    email: `${wolfName.toLowerCase()}@qawolf.com`,
    name: `${wolfName} the QA Wolf`,
  };
};

export const sendEmailForInvite = async ({
  inviteId,
  logger,
}: SendEmailForInvite): Promise<void> => {
  const log = logger.prefix("sendEmailForInvite");
  log.debug("invite", inviteId);

  const invite = await findInvite(inviteId, { logger });

  try {
    const message = {
      to: [{ email: invite.email }],
      from: buildFrom(invite.wolf_name),
      subject: `🐺 ${invite.creator_email} has invited you to join the team ${invite.team_name}`,
      html: buildInviteHtml(invite),
      reply_to: { email: "hello@qawolf.com" },
    };

    await sgMail.send(message);
    log.debug("email sent");
  } catch (error) {
    logger.alert("error: email invite", invite);
    // delete invite from database if cannot send email
    await deleteInvite(invite.id, { logger });
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
    const message = {
      to: [{ email: user.email }],
      from: buildFrom(user.wolf_name),
      subject: `🐺 QA Wolf code: ${buildLoginCode(login_code)}`,
      html: buildLoginCodeHtml({ login_code, user }),
      reply_to: { email: "hello@qawolf.com" },
    };

    log.debug(`send email to ${user.email}`);
    await sgMail.send(message);
  } catch (error) {
    logger.alert("error: email code", user.email, error.message);
  }
};

export const sendEmailForSuite = async ({
  group,
  logger,
  runs,
  suite_id,
  user,
}: SendEmailForSuite): Promise<void> => {
  const log = logger.prefix("sendEmailForSuite");
  log.debug(user.email);

  const is_fail = runs.some((r) => r.status === "fail");

  const subject = is_fail
    ? `🐺 Oh no! Your ${group.name} tests failed.`
    : `🎉 All good! Your ${group.name} tests passed.`;

  try {
    const message = {
      to: [{ email: user.email }],
      from: buildFrom(user.wolf_name),
      subject,
      html: buildSuiteHtml({ group, runs, suite_id }),
      reply_to: { email: "hello@qawolf.com" },
    };

    log.debug("send email to %s", user.email);
    await sgMail.send(message);
  } catch (error) {
    logger.alert("error: email alert", user.email, error.message);
  }
};

export const sendEmailAlert = async ({
  group,
  logger,
  runs,
  suite,
}: SendEmailAlert): Promise<void> => {
  const log = logger.prefix("sendEmailAlert");
  log.debug("suite", suite.id);

  const users = await findUsersForTeam(suite.team_id, { logger });

  const sendPromises = users.map((user) =>
    sendEmailForSuite({ group, logger, runs, suite_id: suite.id, user })
  );

  await Promise.all(sendPromises);
};
