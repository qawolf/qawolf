/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNetlifyDeploymentEvent } from "../../../../server/api/github/commit_status";

describe("isNetlifyDeploymentEvent", () => {
  it("returns false if event not from netlify", () => {
    expect(
      isNetlifyDeploymentEvent({
        description: "Deploy preview ready!",
        sender: { login: "qa-wolf[bot]" },
      } as any)
    ).toBe(false);
  });

  it("returns false if not a deploy event", () => {
    expect(
      isNetlifyDeploymentEvent({
        description: "Something else",
        sender: { login: "netlify[bot]" },
      } as any)
    ).toBe(false);
  });

  it("returns true otherwise", () => {
    expect(
      isNetlifyDeploymentEvent({
        description: "Deploy preview ready!",
        sender: { login: "netlify[bot]" },
      } as any)
    ).toBe(true);
  });
});
