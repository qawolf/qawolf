/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from "crypto";
import { NextApiRequest } from "next";

import {
  handleGitHubRequest,
  verifySignature,
} from "../../../../server/api/github";
import * as deploymentStautsHandler from "../../../../server/api/github/deployment_status";
import { dropTestDb, migrateDb } from "../../../../server/db";
import environment from "../../../../server/environment";
import { Logger } from "../../../../server/Logger";
import { logger } from "../../utils";

const body = { hello: "world" };

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("handleGitHubRequest", () => {
  const end = jest.fn();
  const status = jest.fn().mockReturnValue({ end });

  const signature =
    "sha256=" +
    createHmac("sha256", environment.GITHUB_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

  beforeAll(() => {
    jest
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
      { status } as any
    );

    expect(status).toBeCalledWith(200);
    expect(end).toBeCalled();

    expect(deploymentStautsHandler.handleDeploymentStatusEvent).toBeCalledWith({
      logger: expect.any(Logger),
      payload: body,
    });
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
      { status } as any
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

    expect(testFn).toThrowError("Unauthorized");
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
