import { parse } from "url";

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

export const getUnknownOptions = (args: string[], allowOptions: string[]) => {
  return args.filter(
    arg => !allowOptions.some(option => arg.startsWith(option))
  );
};
