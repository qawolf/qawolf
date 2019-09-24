import { Runner } from "./Runner";
import { loginJob } from "./fixtures/job";

const step = loginJob.steps[0];

test("step callbacks called at correct time", async () => {
  const callback = jest.fn();
  const callback2 = jest.fn();
  const callback3 = jest.fn();

  const runner = new Runner({
    beforeStep: [callback, callback2],
    afterRun: [callback3]
  });

  expect(callback).not.toBeCalled();
  expect(callback2).not.toBeCalled();
  expect(callback3).not.toBeCalled();

  await runner.step(step);

  expect(callback).toBeCalledTimes(1);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(1);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).not.toBeCalled();

  await runner.step(step);

  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(2);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).not.toBeCalled();
});

test("run callbacks called at correct time", async () => {
  const callback = jest.fn();
  const callback2 = jest.fn();
  const callback3 = jest.fn();

  const runner = new Runner({
    beforeStep: [callback, callback2],
    afterRun: [callback3]
  });

  expect(callback).not.toBeCalled();
  expect(callback2).not.toBeCalled();
  expect(callback3).not.toBeCalled();

  await runner.run({ href: "href", steps: [step, step] });

  expect(callback).toBeCalledTimes(2);
  expect(callback).toBeCalledWith(runner);
  expect(callback2).toBeCalledTimes(2);
  expect(callback2).toBeCalledWith(runner);
  expect(callback3).toBeCalledTimes(1);
  expect(callback3).toBeCalledWith(runner);
});
