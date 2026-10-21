import { describe, expect, it } from "bun:test";

import { describeFetchCause } from "./fetchCause.js";

function failedFetch(options: { code: string; message: string }): TypeError {
  const inner = Object.assign(new Error(options.message), {
    code: options.code,
  });
  return new TypeError("fetch failed", { cause: inner });
}

describe("describeFetchCause", () => {
  it("names the code and message of the cause behind a bare fetch failure", () => {
    expect(
      describeFetchCause(
        failedFetch({ code: "UND_ERR_SOCKET", message: "other side closed" }),
      ),
    ).toBe("UND_ERR_SOCKET: other side closed");
  });

  it("does not repeat a code that the message already carries", () => {
    expect(
      describeFetchCause(
        failedFetch({ code: "ECONNRESET", message: "read ECONNRESET" }),
      ),
    ).toBe("read ECONNRESET");
  });

  it("reads a code that sits on the error itself", () => {
    const error = Object.assign(new Error("socket closed"), {
      code: "ConnectionClosed",
    });

    expect(describeFetchCause(error)).toBe("ConnectionClosed: socket closed");
  });

  it("masks a url so a query string never reaches the output", () => {
    const description = describeFetchCause(
      new Error(
        "request to https://app.qawolf.com/api/trpc/public.runner.list?input=%7B%22token%22%3A%22abc%22%7D failed",
      ),
    );

    expect(description).toBe("request to <url> failed");
  });

  it("clips a long message", () => {
    const description = describeFetchCause(new Error("x".repeat(500)));

    expect(description?.length).toBeLessThan(130);
  });

  it("ignores a code that is not a plain identifier", () => {
    const error = Object.assign(new Error("boom"), {
      code: "Bearer abc.def ghi",
    });

    expect(describeFetchCause(error)).toBe("boom");
  });

  it("returns nothing when the error says nothing", () => {
    expect(describeFetchCause(new Error(""))).toBeUndefined();
  });
});
