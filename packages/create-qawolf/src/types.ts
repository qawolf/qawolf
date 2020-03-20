export type Packages = { [name: string]: string };

export type PackageJson = {
  name: string;
  dependencies?: Packages;
  devDependencies?: Packages;
};
