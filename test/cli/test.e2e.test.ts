import { exec as execAsync } from 'child_process';

type ExecResult = {
  error: Error | null;
  stderr: string;
  stdout: string;
};

const exec = (command: string): Promise<ExecResult> => {
  const env = {
    ...process.env,
    CI: 'true',
    FORCE_COLOR: '0',
  };

  return new Promise((resolve) =>
    execAsync(command, { env }, (error, stderr, stdout) =>
      resolve({ error, stderr, stdout }),
    ),
  );
};

describe('test', () => {
  it('runs a test', async () => {
    const result = await exec('npx qawolf test');
    expect(result.error).toBeNull();
    expect(result.stderr).toContain('Test: chromium\nnpx jest');
    expect(result.stdout).toContain('PASS test/.qawolf/scroll.test.js');
  });
});
