export const omitArgs = (args: string[], argsToOmit: string[]): string[] => {
  return args.filter(arg => !argsToOmit.some(skip => arg.startsWith(skip)));
};
