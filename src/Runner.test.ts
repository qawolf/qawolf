import { Size } from "./browser/device";
import { loginJob } from "./fixtures/job";
import { Runner } from "./Runner";

const step = loginJob.steps[0];

test("step callbacks called at correct time", async () => {
  const callback = jest.fn();
  const callback2 = jest.fn();
  const callback3 = jest.fn();
  const callback4 = jest.fn();

  const runner = new Runner({
    beforeStep: [callback, callback2],
    afterStep: [callback3],
    afterRun: [callback4]
  });

  expect(callback).not.toBeCalled();
  expect(callback2).not.toBeCalled();
  expect(callback3).not.toBeCalled();
  expect(callback4).not.toBeCalled();

  await runner.step(step);

  expect(callback).toBeCalledTimes(1);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(1);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).toBeCalledTimes(1);
  expect(callback3).toBeCalledWith(runner);
  expect(callback4).not.toBeCalled();

  await runner.step(step);

  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(2);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).toBeCalledTimes(2);
  expect(callback3).toBeCalledWith(runner);
  expect(callback4).not.toBeCalled();
});

test("run callbacks called at correct time", async () => {
  const callback = jest.fn();
  const callback2 = jest.fn();
  const callback3 = jest.fn();
  const callback4 = jest.fn();

  const runner = new Runner({
    beforeStep: [callback, callback2],
    afterStep: [callback3],
    afterRun: [callback4]
  });

  expect(callback).not.toBeCalled();
  expect(callback2).not.toBeCalled();
  expect(callback3).not.toBeCalled();
  expect(callback4).not.toBeCalled();

  await runner.run({
    name: "Log in",
    size: "desktop" as Size,
    steps: [step, step],
    url: "url"
  });

  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(2);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).toBeCalledTimes(2);
  expect(callback3).toBeCalledWith(runner);
  expect(callback4).toBeCalledTimes(1);
  expect(callback4).toBeCalledWith(runner);
});

test("getRun throws error if run not created", () => {
  const runner = new Runner();

  expect(() => runner.getRun()).toThrowError();
});

test("runs property is created after job is run", async () => {
  const runner = new Runner();
  await runner.run({
    name: "Log in",
    size: "desktop" as Size,
    steps: [step, step],
    url: "url"
  });

  const run = runner.getRun();

  expect(run).toMatchObject({
    name: "Log in",
    status: "pass"
  });
  expect(run.startTime).toBeTruthy();
});
