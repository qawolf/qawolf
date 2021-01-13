# QA Wolf Recorder

## Build

```sh
npm install

npm run build
# or
npm run build:watch
```

## Run Tests

```sh
npm install
npm test
```

## Test the Speed of Functions

```sh
npm install
npm run build # Important! The speed tests run on the built QA Wolf library.
npm run test:speed -- <name-of-test-to-run>
```

If you don't want to run `npm run build` after each code change, then have `npm run build:watch` running in a separate process.

Currently supported test names:

- **selector**: runs `qawolf.buildSelector` for various element scenarios
- **tag-cue-value**: runs `qawolf.buildCueValueForTag` for various element scenarios

For any test name, the script does essentially the same thing. It runs through all of the scenarios 2 times, keeps track of how long the function execution takes, and averages the result. The result is printed on screen. Test timing runs in the test browser, so it shouldn't be impacted by Playwright or anything else on the Node.js side.

NOTE: You can change the number of times to run each scenario for the average by temporarily changing the `AVERAGE_OF_TIMES` constant in _test/performance/speed.ts_.

Example intended usage:

1. Run `npm run test:speed -- selector`. Save off the logs.
2. Make a change to code that runs as part of a `buildSelector` call.
3. Run `npm run build`
4. Run `npm run test:speed -- selector` again on the same computer, under similar load. Save off the logs.
5. Compare the numbers in the two logs to see if any of the scenarios got faster or slower as a result of your change. Include any significant speed improvement logs in your PR to justify your change.

### Modifying the Script

- You can add more scenarios by updating the relevant `runFn` function in the `switch` statement in _test/performance/speed.ts_.
- You can add tests for additional functions by adding a case to the `switch` statement in _test/performance/speed.ts_. In general you only need to copy one of the other switch cases and then adjust it to test the function you are interested in.
