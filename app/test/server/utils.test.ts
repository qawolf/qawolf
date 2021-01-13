import {
  ALPHABET,
  buildApiKey,
  buildDigest,
  buildLoginCode,
  isCorrectCode,
  minutesFromNow,
  validateEmail,
} from "../../server/utils";
import { logger } from "./utils";

describe("buildApiKey", () => {
  it("returns an api key", () => {
    const apiKey = buildApiKey();

    expect(apiKey).toHaveLength(39);
    expect(apiKey.slice(0, 7)).toBe("qawolf_");
    expect(apiKey).not.toMatch("-");
  });
});

describe("buildLoginCode", () => {
  it("builds a 6 letter code", () => {
    const code = buildLoginCode();

    expect(code).toHaveLength(6);
    code.split("").forEach((char) => {
      expect(ALPHABET).toContain(char);
    });
  });
});

describe("isCorrectCode", () => {
  const code = "ABCDEF";
  let digest: string;

  beforeAll(async () => {
    digest = await buildDigest(code);
  });

  it("returns true if login code is correct", async () => {
    const isCorrect = await isCorrectCode({ code, digest });

    expect(isCorrect).toBe(true);
    expect(digest).not.toBe(code);
  });

  it("returns false if login code is incorrect", async () => {
    const isCorrect = await isCorrectCode({
      code: "ABC123",
      digest,
    });

    expect(isCorrect).toBe(false);
  });
});

describe("minutesFromNow", () => {
  const realDateNow = Date.now.bind(global.Date);

  beforeAll(() => {
    global.Date.now = () => new Date("2020-06-23T14:04:53.643Z").getTime();
  });

  afterAll(() => {
    global.Date.now = realDateNow;
  });

  it("builds the correct date for -10 minutes", () => {
    expect(minutesFromNow(-10)).toBe("2020-06-23T13:54:53.643Z");
  });

  it("builds the correct date for 10 minutes", () => {
    expect(minutesFromNow(10)).toBe("2020-06-23T14:14:53.643Z");
  });

  it("builds the correct date for 30 minutes", () => {
    expect(minutesFromNow(30)).toBe("2020-06-23T14:34:53.643Z");
  });

  it("builds the correct date for 70 minutes", () => {
    expect(minutesFromNow(70)).toBe("2020-06-23T15:14:53.643Z");
  });
});

describe("validateEmail", () => {
  it("throws an error if email invalid", () => {
    const testFn = (): void => {
      return validateEmail("invalid.email", logger);
    };

    expect(testFn).toThrowError("invalid email address");
  });

  it("does not throw an error if email valid", () => {
    const testFn = (): void => {
      return validateEmail("spirit@qawolf.com", logger);
    };

    expect(testFn).not.toThrowError();
  });
});
