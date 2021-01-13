import pullRunnerImage from "../../src/cli/pullRunnerImage";
import * as pullRunnerImageFns from "../../src/cli/pullRunnerImage";

const noOp = () => {
  /* no-op */
};

jest
  .spyOn(pullRunnerImageFns, "prepareSingleProgressBar")
  .mockReturnValue([noOp, noOp]);
jest
  .spyOn(pullRunnerImageFns, "prepareMultiProgressBar")
  .mockReturnValue([noOp, noOp]);

const docker = {
  modem: {
    followProgress: jest
      .fn()
      .mockName("docker.modem.followProgress")
      .mockImplementation((_, onFinished) => {
        onFinished();
      }),
  },
  pull: jest.fn().mockName("docker.pull"),
};

beforeEach(() => jest.clearAllMocks());

test("pulls with multiple progress bars when verbose is true", async () => {
  await pullRunnerImage(docker as any, true);

  expect(pullRunnerImageFns.prepareSingleProgressBar).not.toHaveBeenCalled();
  expect(pullRunnerImageFns.prepareMultiProgressBar).toHaveBeenCalled();
  expect(docker.pull).toHaveBeenCalled();
});

test("pulls with a single progress bar when verbose is false", async () => {
  await pullRunnerImage(docker as any, false);

  expect(pullRunnerImageFns.prepareMultiProgressBar).not.toHaveBeenCalled();
  expect(pullRunnerImageFns.prepareSingleProgressBar).toHaveBeenCalled();
  expect(docker.pull).toHaveBeenCalled();
});
