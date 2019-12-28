---
id: cli
title: CLI
---

QA Wolf provides CLI commands to [record browser tests ✅](get_started#-record-a-browser-test), [record browser scripts 🤖](get_started#-record-a-browser-script), and [set up CI ☁️](#set_up_ci).

## Commands

You can use [environment variables](api#environment-variables) when running the commands below. For example:

```bash
QAW_DATA_ATTRIBUTE=data-qa npx qawolf record <url> [name]
```

This will record your test using `data-qa` as the [data attribute](api#qaw_data_attribute) to look for when finding elements.

### npx qawolf --help

See all commands and options.

### npx qawolf record \[--script] <url\> [name]

- `--script` (optional): Record a node script instead of a [Jest](https://jestjs.io) test.
- `url` (required): visit this URL to begin your test.
- `name` (optional): Your file will be saved to `.qawolf/tests/name.test.js` or `.qawolf/scripts/name.js`. The name defaults to the URL hostname if not provided. `name` will be converted to camel case.

Record a browser [test ✅](get_started#-record-a-browser-test) or [script 🤖](get_started#-record-a-browser-script).

### npx qawolf test \[name]

- `name` (optional) If `name` is not provided, QA Wolf will run all of your tests. If `name` is provided, QA Wolf will run that specific test. If you provide an invalid `name`, you will be prompted in the CLI to choose a test from a list of all tests.

Run a specific test or all tests.

### npx qawolf azure

Generate a pipeline file for [Azure DevOps](https://azure.microsoft.com/en-us/services/devops). See [Set Up <img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/azure-190760.png" /> Azure](set_up_ci#azure) for more details.

### npx qawolf circleci

Generate a workflow file for [CircleCI](https://circleci.com). See [Set Up <img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/circleci-283066.png" /> CircleCI](set_up_ci#circleci) for more details.

### npx qawolf github

Generate a workflow file for [GitHub Actions](https://github.com/features/actions). See [Set Up <img align="center" height="20px" src="https://camo.githubusercontent.com/7710b43d0476b6f6d4b4b2865e35c108f69991f3/68747470733a2f2f7777772e69636f6e66696e6465722e636f6d2f646174612f69636f6e732f6f637469636f6e732f313032342f6d61726b2d6769746875622d3235362e706e67" /> GitHub](set_up_ci#github) for more details.

### npx qawolf gitlab

Generate a workflow file for [GitLab CI/CD](https://docs.gitlab.com/ee/ci/README.html). See [Set Up 🦊 GitLab](set_up_ci#gitlab) for more details.

### npx qawolf howl

🐺😉
