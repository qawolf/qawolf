import environment from "../../environment";
import { WOLF_VARIANTS } from "../../models/wolfOptions";
import { Invite, Suite, SuiteRun, Trigger, User } from "../../types";
import { buildGitDetail, buildSuiteName, buildWolfImage } from "./utils";

type BuildLoginCodeHtml = {
  login_code: string;
  user: User;
};

type BuildSuiteHtml = {
  runs: SuiteRun[];
  suite: Suite;
  trigger: Trigger | null;
  user: User;
};

const buildFailingRunHtml = ({ gif_url, id, test_name }: SuiteRun): string => {
  const gif = gif_url ? `<img src="${gif_url}" width="320px" />` : "";

  return `<a href='${environment.APP_URL}/run/${id}'>${test_name}</a><br />${gif}`;
};

const buildFooter = (wolfVariant: string): string => {
  const wolf = WOLF_VARIANTS.includes(wolfVariant) ? wolfVariant : "white";

  return `
  <div style='margin-top: 48px;'>
    <img src='https://qawolf-public.s3.us-east-2.amazonaws.com/wolf-${wolf}.png' style='display: block; margin: auto;' width="120px" />
  </div>
  <div style="border-top: 1px solid #667080; font-size: 12px; margin: 0 32px 48px; text-align: center;">
    <p style='color: #667080; margin: 48px 32px;'>QA Wolf is an end-to-end testing platform that helps teams ship confidently. Create, run, and share tests - all without leaving the browser.</p>
  </div>`;
};

const buildHeader = (): string => {
  return `
  <table>
    <tr>
      <td><img src='https://qawolf-public.s3.us-east-2.amazonaws.com/logo-small.png' style='object-fit: contain; width: 48px;' /></td>
      <td><h1 style='display: inline-block; font-size: 24px; font-weight: normal; margin: 0 8px;'>QA Wolf</h1></td>
    </tr>
  </table>`;
};

export const buildInviteHtml = (
  invite: Invite & { creator_email: string; team_name: string }
): string => {
  return `<div style='color: #2A3140; font-family: Helvetica, Arial, sans-serif;'>${buildHeader()}
  <div style='font-size: 16px; margin-top: 32px; text-align: center; width: 100%;'>
      <a style='color: inherit !important; font-weight: bold; text-decoration: none !important;'>${
        invite.creator_email
      }</a>
      <p style='margin: 8px 0'>has invited you to join the team</p>
      <b>${invite.team_name}</b>
      <br />
      <a href='${environment.APP_URL}/invite/${
    invite.id
  }' style='background: #4545E5; border-radius: 8px; color: #FFFFFF; display: inline-block; margin-top: 32px; font-weight: bold; padding: 16px 32px; text-decoration: none;'>Accept Invite</a>
  </div>${buildFooter(invite.wolf_variant)}
  </div>`;
};

export const buildLoginCode = (code: string): string => {
  return code.slice(0, 3) + "-" + code.slice(3);
};

export const buildLoginCodeHtml = ({
  login_code,
  user,
}: BuildLoginCodeHtml): string => {
  return `<div style='color: #2A3140; font-family: Helvetica, Arial, sans-serif;'>${buildHeader()}
  <div style='font-size: 16px; margin-top: 32px; text-align: center; width: 100%;'>
    <p>Enter the code below to log in to QA Wolf:</p>
    <p style="background: #F2F4F7; border-radius: 8px; display: inline-block; font-size: 48px; font-weight: bold; margin: 8px 0; padding: 8px 16px;">${buildLoginCode(
      login_code
    )}</p>
    <p>If you didn’t request this email, you can safely ignore it.</p>
  </div>${buildFooter(user.wolf_variant)}
  </div>`;
};

export const buildSuiteHtml = ({
  runs,
  suite,
  trigger,
  user,
}: BuildSuiteHtml): string => {
  const failingRuns = runs.filter((r) => r.status === "fail");
  const suiteName = buildSuiteName({ suite, trigger });

  const suiteHref = new URL(`/suites/${suite.id}`, environment.APP_URL).href;

  const anchor = `<a href='${suiteHref}'>${suiteName} tests</a>`;
  const git = buildGitDetail(suite);

  const wolfImage = buildWolfImage({ isPass: !failingRuns.length, user });
  const wolf = `${user.wolf_name} here:`;

  if (!failingRuns.length) {
    return `<p>${wolfImage} ${wolf} ${anchor} passed!</p>${git}`;
  }

  const failingRunsHtml = failingRuns.map((run) => {
    return buildFailingRunHtml(run);
  });

  return (
    `<p>${wolfImage} ${wolf} ${anchor} failed.</p>${git}<br />` +
    failingRunsHtml.join("<br />")
  );
};
