import {
  buildInviteHtml,
  buildLoginCodeHtml,
  buildSuiteHtml,
} from "../../../../server/services/alert/html";
import { buildInvite, buildSuite, buildTrigger, buildUser } from "../../utils";

const suite = buildSuite({});
const trigger = buildTrigger({});
const user = buildUser({});

describe("buildInviteHtml", () => {
  it("builds html for invite", () => {
    const html = buildInviteHtml({
      ...buildInvite({}),
      creator_email: "spirit@qawolf.com",
      team_name: "My Team",
    });

    expect(html).toMatchSnapshot();
  });
});

describe("buildLoginCodeHtml", () => {
  it("builds html for login code", () => {
    const html = buildLoginCodeHtml({
      login_code: "SPIRIT",
      user: buildUser({}),
    });

    expect(html).toMatchSnapshot();
  });
});

describe("buildSuiteHtml", () => {
  it("builds html for failure email", () => {
    const html = buildSuiteHtml({
      runs: [
        {
          gif_url: "https://gif.gif",
          id: "runId",
          is_test_deleted: false,
          status: "pass",
          test_id: "testId",
          test_name: "logIn",
        },
        {
          gif_url: "https://gif.gif",
          id: "run2Id",
          is_test_deleted: false,
          status: "fail",
          test_id: "test2Id",
          test_name: "signUp",
        },
        {
          gif_url: null,
          id: "run3Id",
          is_test_deleted: false,
          status: "fail",
          test_id: "test3Id",
          test_name: "logOut",
        },
      ],
      suite,
      trigger,
      user,
    });

    expect(html).toMatchSnapshot();
  });

  it("builds html for success email", () => {
    const html = buildSuiteHtml({
      runs: [
        {
          gif_url: "https://gif.gif",
          id: "runId",
          is_test_deleted: false,
          status: "pass",
          test_id: "testId",
          test_name: "logIn",
        },
      ],
      suite,
      trigger,
      user,
    });

    expect(html).toMatchSnapshot();
  });

  it("builds html for success email with git", () => {
    const html = buildSuiteHtml({
      runs: [
        {
          gif_url: "https://gif.gif",
          id: "runId",
          is_test_deleted: false,
          status: "pass",
          test_id: "testId",
          test_name: "logIn",
        },
      ],
      suite: {
        ...suite,
        branch: "feature",
        commit_message: "initial commit",
        commit_url: "https://github.com/qawolf/repo/pull/123/commits/sha",
        pull_request_url: "https://github.com/qawolf/repo/pull/123",
      },
      trigger,
      user,
    });

    expect(html).toMatchSnapshot();
  });

  it("builds html for success email with no trigger", () => {
    const html = buildSuiteHtml({
      runs: [
        {
          gif_url: "https://gif.gif",
          id: "runId",
          is_test_deleted: false,
          status: "pass",
          test_id: "testId",
          test_name: "logIn",
        },
      ],
      suite,
      trigger: null,
      user,
    });

    expect(html).toMatchSnapshot();
  });

  it("builds html for success email with tag names", () => {
    const html = buildSuiteHtml({
      runs: [
        {
          gif_url: "https://gif.gif",
          id: "runId",
          is_test_deleted: false,
          status: "pass",
          test_id: "testId",
          test_name: "logIn",
        },
      ],
      suite: {
        ...suite,
        tag_names: "Sign up",
      },
      trigger: null,
      user,
    });

    expect(html).toMatchSnapshot();
  });
});
