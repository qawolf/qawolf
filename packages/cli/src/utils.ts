import { parse, UrlWithStringQuery } from "url";

export const parseUrl = (urlString: string) => {
  let url = parse(urlString);

  // prefix w/ https if a protocol is not provided
  if (!url.protocol) {
    url = parse(`https://${urlString}`);
  }

  if (!url.hostname) {
    throw new Error(`Invalid url ${urlString}`);
  }

  return url;
};

export const getUrlRoot = (url: UrlWithStringQuery) => {
  if (!url.hostname) throw new Error(`Invalid url ${url.href}`);

  const parts = url.hostname.split(".");
  return parts[Math.max(0, parts.length - 2)];
};
