/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from "crypto";
import { NextApiRequest } from "next";

import {
  handleGitHubRequest,
  verifySignature,
} from "../../../../server/api/github";
import * as deploymentStautsHandler from "../../../../server/api/github/deployment_status";
import environment from "../../../../server/environment";
import { logger } from "../../utils";

const body = { hello: "world" };

describe("handleGitHubRequest", () => {
  let handleDeploymentStatusEventSpy: jest.SpyInstance;
  const end = jest.fn();
  const status = jest.fn().mockReturnValue({ end });

  const signature =
    "sha256=" +
    createHmac("sha256", environment.GITHUB_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

  beforeAll(() => {
    handleDeploymentStatusEventSpy = jest
      .spyOn(deploymentStautsHandler, "handleDeploymentStatusEvent")
      .mockResolvedValue();
  });

  afterEach(() => jest.clearAllMocks());

  it("handles deployment_status event", async () => {
    await handleGitHubRequest(
      {
        body,
        headers: {
          "x-github-event": "deployment_status",
          "x-hub-signature-256": signature,
        } as NextApiRequest["headers"],
      } as NextApiRequest,
      { status } as any,
      { db: null, logger }
    );

    expect(status).toBeCalledWith(200);
    expect(end).toBeCalled();

    expect(handleDeploymentStatusEventSpy.mock.calls[0][0]).toEqual(body);
  });

  it("ignores other events", async () => {
    await handleGitHubRequest(
      {
        body,
        headers: {
          "x-github-event": "check_run",
          "x-hub-signature-256": signature,
        } as NextApiRequest["headers"],
      } as NextApiRequest,
      { status } as any,
      { db: null, logger }
    );

    expect(status).toBeCalledWith(200);
    expect(end).toBeCalled();

    expect(
      deploymentStautsHandler.handleDeploymentStatusEvent
    ).not.toBeCalled();
  });
});

describe("verifySignature", () => {
  it("throws an error if signature is invalid", () => {
    const signature =
      "sha256=" +
      createHmac("sha256", "fakeSecret")
        .update(JSON.stringify(body))
        .digest("hex");

    const testFn = (): void => {
      return verifySignature(
        {
          body,
          headers: {
            "x-hub-signature-256": signature,
          } as NextApiRequest["headers"],
        } as NextApiRequest,
        logger
      );
    };

    expect(testFn).toThrowError("unauthorized");
  });

  it("does not throw an error if signature is valid", () => {
    const signature =
      "sha256=" +
      createHmac("sha256", environment.GITHUB_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest("hex");

    const testFn = (): void => {
      return verifySignature(
        {
          body,
          headers: {
            "x-hub-signature-256": signature,
          } as NextApiRequest["headers"],
        } as NextApiRequest,
        logger
      );
    };

    expect(testFn).not.toThrowError();
  });
});
