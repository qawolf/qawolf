import { buildCommentForSuite } from "../../../../server/services/gitHub/markdown";
import { SuiteRun, Trigger, User } from "../../../../server/types";

const failingRun = {
  id: "runId",
  gif_url: "https://media.giphy.com/media/10LKovKon8DENq/giphy.gif",
  status: "fail",
  test_name: "Subscribe",
};

const inProgressRun = {
  id: "run2Id",
  gif_url: "https://media.giphy.com/media/10LKovKon8DENq/giphy.gif",
  status: "created",
  test_name: "Log in",
};

const passingRun = {
  id: "run3Id",
  gif_url: "https://media.giphy.com/media/10LKovKon8DENq/giphy.gif",
  status: "pass",
  test_name: "Sign up",
};

describe("buildCommentForSuite", () => {
  it("builds a comment for single running test", () => {
    expect(
      buildCommentForSuite({
        runs: [inProgressRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Wolverina", wolf_variant: "black" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for multiple running tests", () => {
    expect(
      buildCommentForSuite({
        runs: [inProgressRun, inProgressRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for single passing test", () => {
    expect(
      buildCommentForSuite({
        runs: [passingRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for multiple passing tests", () => {
    expect(
      buildCommentForSuite({
        runs: [passingRun, passingRun, passingRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for single failing test", () => {
    expect(
      buildCommentForSuite({
        runs: [failingRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for multiple failing tests", () => {
    expect(
      buildCommentForSuite({
        runs: [failingRun, failingRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });

  it("builds a comment for suites with tests of all statuses", () => {
    expect(
      buildCommentForSuite({
        runs: [failingRun, passingRun, failingRun, inProgressRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();

    expect(
      buildCommentForSuite({
        runs: [failingRun, failingRun, inProgressRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();

    expect(
      buildCommentForSuite({
        runs: [passingRun, inProgressRun, passingRun, passingRun] as SuiteRun[],
        suite_id: "suiteId",
        trigger: { name: "Deployment" } as Trigger,
        user: { wolf_name: "Bean", wolf_variant: "husky" } as User,
      })
    ).toMatchSnapshot();
  });
});
