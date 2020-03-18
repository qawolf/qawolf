import { cyan, bold } from 'kleur';
import { getPackageJsonPath } from './packageJson';

export const logError = (error: Error): void => {
  if (error.message === 'cannot read package.json') {
    console.log(bold().yellow(`Cannot read ${getPackageJsonPath()}`));
    console.log(bold().yellow(`Create a package.json with "npm init"`));
  } else {
    console.error(error.message);
  }
};

export const logUseTypeScript = () => {
  console.log(cyan('Use TypeScript since we found a tsconfig.json'));
};

// TODO
export const promptRootDir = async () => {};
