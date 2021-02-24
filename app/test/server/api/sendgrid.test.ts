/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import * as sendGridApi from "../../../server/api/sendgrid";
import environment from "../../../server/environment";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

const { buildSendDate, handleSendGridRequest, verifyRequest } = sendGridApi;

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status } as any;

const db = prepareTestDb();
const url = `/api/sendgrid?key=${environment.SENDGRID_WEBHOOK_SECRET}`;

describe("buildSendDate", () => {
  afterEach(() => jest.restoreAllMocks());

  it("parses date from headers", () => {
    expect(buildSendDate(" Date: Thu, 18 Feb 2021 10:18:51 -0700\n")).toBe(
      new Date("Thu, 18 Feb 2021 10:18:51 -0700").toISOString()
    );
  });

  it("defaults to now if headers do not include date", () => {
    const mockDate = new Date("2021-01-01");
    jest.spyOn(global, "Date").mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockDate as any;
    });

    expect(buildSendDate("invalid")).toBe(new Date("2021-01-01").toISOString());
  });

  it("defaults to now if headers specify invalid date", () => {
    const mockDate = new Date("2021-01-01");
    jest.spyOn(global, "Date").mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockDate as any;
    });

    expect(buildSendDate(" Date: XXX\n")).toBe(
      new Date("2021-01-01").toISOString()
    );
  });
});

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
      headers: "Date: Thu, 18 Feb 2021 10:18:51 -0700\n",
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
      headers: "Date: Thu, 18 Feb 2021 10:18:51 -0700\n",
      html: "html",
      subject: "subject",
      text: "text",
      to: "inbox+new@dev.qawolf.com",
    });

    await handleSendGridRequest({ url } as NextApiRequest, res, { db, logger });

    const dbEmails = await db("emails");

    expect(dbEmails).toMatchObject([
      {
        created_at: new Date("Thu, 18 Feb 2021 10:18:51 -0700"),
        from: "spirit@qawolf.com",
        team_id: "teamId",
        to: "inbox+new@dev.qawolf.com",
      },
    ]);
  });
});

describe("verifyRequest", () => {
  it("throws an error if request is invalid", () => {
    expect((): void => {
      return verifyRequest("/api/sendgrid", logger);
    }).toThrowError("unauthorized");

    expect((): void => {
      return verifyRequest("/api/sendgrid?key=invalid", logger);
    }).toThrowError("unauthorized");
  });

  it("does not throw an error if request is valid", () => {
    expect((): void => {
      return verifyRequest(url, logger);
    }).not.toThrowError();
  });
});
