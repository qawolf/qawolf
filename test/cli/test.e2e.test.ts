import { exec } from 'child_process';

type ExecResult = {
  error: Error | null;
  stderr: string;
  stdout: string;
};

describe('test', () => {
  it('runs a test', async () => {
    const result = await new Promise<ExecResult>((resolve) =>
      exec(
        'npx qawolf test',
        {
          env: {
            ...process.env,
            CI: 'true',
            FORCE_COLOR: '0',
          },
        },
        (error, stderr, stdout) => resolve({ error, stderr, stdout }),
      ),
    );

    expect(result.stderr).toContain('Test: chromium\nnpx jest');
    expect(result.stdout).toContain('PASS test/.qawolf/scroll.test.js');
    expect(result.error).toBeNull();
  });
});
