import { parse, UrlWithStringQuery } from 'url';

export const omitArgs = (args: string[], argsToOmit: string[]): string[] => {
  return args.filter(arg => !argsToOmit.some(skip => arg.startsWith(skip)));
};

export const parseUrl = (urlString: string): UrlWithStringQuery => {
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
