import { errorCode } from "./errors.js";

const maxCauseDepth = 5;
const maxCauseMessageLength = 120;
const codePattern = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const urlPattern = /\bhttps?:\/\/\S+/g;

function causeChain(options: {
  error: Error;
  remainingDepth: number;
}): Error[] {
  const { error, remainingDepth } = options;
  const { cause } = error;
  if (!(cause instanceof Error) || remainingDepth === 0) return [error];
  return [
    error,
    ...causeChain({ error: cause, remainingDepth: remainingDepth - 1 }),
  ];
}

function shortMessage(message: string): string {
  const withoutUrls = message.replace(urlPattern, "<url>").trim();
  return withoutUrls.length > maxCauseMessageLength
    ? `${withoutUrls.slice(0, maxCauseMessageLength)}…`
    : withoutUrls;
}

export function describeFetchCause(error: Error): string | undefined {
  const chain = causeChain({ error, remainingDepth: maxCauseDepth });
  const root = chain.at(-1);
  const code = chain
    .map((link) => errorCode(link))
    .reverse()
    .find(
      (candidate) => candidate !== undefined && codePattern.test(candidate),
    );
  const message = root === undefined ? "" : shortMessage(root.message);
  if (code === undefined) return message || undefined;
  if (!message || message.includes(code)) return message || code;
  return `${code}: ${message}`;
}
