/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import * as sendGridApi from "../../../server/api/sendgrid";
import environment from "../../../server/environment";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

const { handleSendGridRequest, verifyRequest } = sendGridApi;

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status } as any;

const db = prepareTestDb();
const url = `/api/sendgrid?key=${environment.SENDGRID_WEBHOOK_SECRET}`;

describe("handleSendGridRequest", () => {
  beforeAll(() =>
    db("teams").insert(buildTeam({ inbox: "inbox@dev.qawolf.com" }))
  );

  afterEach(() => {
    jest.clearAllMocks();
    return db("emails").del();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    return db("teams").del();
  });

  it("ignores email if no corresponding team", async () => {
    jest.spyOn(sendGridApi, "buildEmailFields").mockResolvedValue({
      from: "spirit@qawolf.com",
      html: "html",
      subject: "subject",
      text: "text",
      to: "invalid@test.com",
    });

    await handleSendGridRequest({ url } as NextApiRequest, res, { db, logger });

    const dbEmails = await db("emails");

    expect(dbEmails).toEqual([]);
  });

  it("creates email record if corresponding team", async () => {
    jest.spyOn(sendGridApi, "buildEmailFields").mockResolvedValue({
      from: "spirit@qawolf.com",
      html: "html",
      subject: "subject",
      text: "text",
      to: "inbox+new@test.com",
    });

    await handleSendGridRequest({ url } as NextApiRequest, res, { db, logger });

    const dbEmails = await db("emails");

    expect(dbEmails).toMatchObject([
      {
        from: "spirit@qawolf.com",
        team_id: "teamId",
        to: "inbox+new@test.com",
      },
    ]);
  });
});

describe("verifyRequest", () => {
  it("throws an error if request is invalid", () => {
    expect((): void => {
      return verifyRequest("/api/sendgrid", logger);
    }).toThrowError("Unauthorized");

    expect((): void => {
      return verifyRequest("/api/sendgrid?key=invalid", logger);
    }).toThrowError("Unauthorized");
  });

  it("does not throw an error if request is valid", () => {
    expect((): void => {
      return verifyRequest(url, logger);
    }).not.toThrowError();
  });
});
