import { daysFromNow, minutesFromNow } from "../../shared/utils";

describe("daysFromNow", () => {
  const realDate = Date.bind(global.Date);
  const testDate = new Date("2020-06-23T14:04:53.643Z");

  beforeAll(() => {
    global.Date = class extends Date {
      constructor() {
        super();
        return testDate;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  it("builds the correct date for -30 days", () => {
    expect(daysFromNow(-30)).toBe("2020-05-24T14:04:53.643Z");
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
