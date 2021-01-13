import * as apiService from "../../src/services/api";
import { StatusReporter } from "../../src/services/StatusReporter";
import * as StatusReporterService from "../../src/services/StatusReporter";
import { Run } from "../../src/types";

describe("StatusReporter", () => {
  describe("report update", () => {
    let pingSpy: jest.SpyInstance;
    let updateRunnerSpy: jest.SpyInstance;

    const runs: Run[] = [];

    const mockRunner = {
      progress: () => ({}),
      run: (run: Run) => {
        runs.push(run);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    beforeAll(() => {
      pingSpy = jest.spyOn(StatusReporterService, "ping").mockResolvedValue();

      updateRunnerSpy = jest
        .spyOn(apiService, "updateRunner")
        .mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("pings itself before calling updateRunner", async () => {
      const reporter = new StatusReporter(mockRunner);
      await reporter._reportUpdate();
      expect(pingSpy).toBeCalledTimes(1);
    });

    it("calls updateRunner with is_ready the first time", async () => {
      const reporter = new StatusReporter(mockRunner);
      await reporter._reportUpdate();
      expect(updateRunnerSpy).toBeCalledWith({ is_ready: true });
    });

    it("calls updateRunner with is_healthy subsequent times", async () => {
      const reporter = new StatusReporter(mockRunner);
      await reporter._reportUpdate();
      await reporter._reportUpdate();
      await reporter._reportUpdate();
      expect(updateRunnerSpy.mock.calls[0]).toEqual([{ is_ready: true }]);
      expect(updateRunnerSpy.mock.calls[1]).toEqual([{ is_healthy: true }]);
      expect(updateRunnerSpy.mock.calls[2]).toEqual([{ is_healthy: true }]);
    });

    it("runs if a run is returned", async () => {
      const reporter = new StatusReporter(mockRunner);
      updateRunnerSpy.mockResolvedValue({ id: "runId" });
      await reporter._reportUpdate();
      expect(runs[0]).toMatchObject(
        expect.objectContaining({ run_id: "runId" })
      );
    });
  });
});
