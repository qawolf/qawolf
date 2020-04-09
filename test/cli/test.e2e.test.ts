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
    QAW_HEADLESS: 'true',
  };

  return new Promise((resolve) =>
    execAsync(command, { env }, (error, stderr, stdout) =>
      resolve({ error, stderr, stdout }),
    ),
  );
};

describe('npx qawolf test', () => {
  it('runs a test', async () => {
    // run a specific test to prevent it executing
    // the example test generated in create.e2e.test
    const result = await exec('npx qawolf test scroll');
    expect(result.error).toBeNull();
    expect(result.stderr).toContain('Test: chromium\nnpx jest');
    expect(result.stdout).toContain('PASS test/.qawolf/scroll.test.ts');
  });
});
