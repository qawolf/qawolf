import glob from 'glob';

export const detectTypeScript = async (): Promise<boolean> => {
  return new Promise(resolve => {
    glob('tsconfig*.json', (error, files) => {
      if (error) resolve(false);
      else resolve(files.length > 0);
    });
  });
};
