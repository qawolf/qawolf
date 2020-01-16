---
id: set_up_ci
title: ☁️ Set Up CI
---

With QA Wolf, you can run your [browser test ✅](quick_start#-create-a-browser-test) or [browser script 🤖](quick_start#-create-a-browser-script) in CI with one command. [Debugging artifacts](set_up_ci#️-debug) like a video, GIF, and detailed logs are automatically created for each run in CI.

This tutorial assumes that you have already [created a browser test](create_a_test) or script.

![](https://storage.googleapis.com/docs.qawolf.com/home/github.gif)

## Commands

We auto-generate [<img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/azure-190760.png" /> Azure](#azure), [<img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/circleci-283066.png" /> CircleCI](#circleci), [<img align="center" height="20px" src="https://camo.githubusercontent.com/7710b43d0476b6f6d4b4b2865e35c108f69991f3/68747470733a2f2f7777772e69636f6e66696e6465722e636f6d2f646174612f69636f6e732f6f637469636f6e732f313032342f6d61726b2d6769746875622d3235362e706e67" /> GitHub](#github), [🦊 GitLab](#gitlab), [🤵 Jenkins](#jenkins) workflow files. [Let us know](https://gitter.im/qawolf/community) if you would like another provider!

### <a name="azure"></a> <img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/azure-190760.png" /> Azure

Generate a pipeline file for [Azure DevOps](https://azure.microsoft.com/en-us/services/devops):

```bash
npx qawolf azure
```

This will generate a file called `azure-pipelines.yml` at the root of your project. You can edit `azure-pipelines.yml` to suit your needs.

#### Trigger

The workflow will run per commit. To run your tests on a schedule, follow [Azure's documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/triggers?view=azure-devops&tabs=yaml#scheduled-triggers).

#### Environment Variables

You can configure your tests with [environment variables](api#environment-variables) directly, or by [adding them to your Azure DevOps pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#secret-variables).

Example:

```yaml
steps:
  - script: qawolf test
    env:
      # override the default sleep time
      QAW_SLEEP_MS: 0
      # set secret environment variables in Azure DevOps pipeline
      QAW_CREATE_ACCOUNT_1: $(SECRET_PASSWORD)
```

To learn more about configuring pipelines in Azure DevOps, see [Azure's documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline).

### <a name="circleci"></a> <img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/circleci-283066.png" /> CircleCI

Generate a workflow file for [CircleCI](https://circleci.com):

```bash
npx qawolf circleci
```

This will generate a file called `config.yml` in the `.circleci` directory at the root of your project. You can edit `.circleci/config.yml` to suit your needs.

#### Trigger

The workflow will run per commit. To run your tests on a [schedule](https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow), comment in the following lines:

```yaml
# example for running on a schedule, edthem to suit your needs
# documentation: https://circleci.com/docs/2.0/api-reference/#schedule
workflows:
  version: 2
  on_schedule:
    jobs:
      - build
    triggers:
      - schedule:
          # test on schedule using cron syntax
          cron: "0 * * * *" # every hour
          filters:
            branches:
              only:
                - master
```

#### Environment Variables

You can configure your tests with [environment variables](api#environment-variables) directly, or by [adding them to your CircleCI settings](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project).

Example:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: qawolf/qawolf:latest
        environment:
          # override the default sleep time
          QAW_SLEEP_MS: 0
          # set secret environment variables in CircleCI settings
          QAW_CREATE_ACCOUNT_1: ${SECRET_PASSWORD}
```

To learn more about configuring workflows in CircleCI, see [CircleCI's documentation](https://circleci.com/docs/2.0/api-reference).

### <a name="github"></a> <img align="center" height="20px" src="https://camo.githubusercontent.com/7710b43d0476b6f6d4b4b2865e35c108f69991f3/68747470733a2f2f7777772e69636f6e66696e6465722e636f6d2f646174612f69636f6e732f6f637469636f6e732f313032342f6d61726b2d6769746875622d3235362e706e67" /> GitHub

Generate a workflow file for [GitHub Actions](https://github.com/features/actions):

```bash
npx qawolf github
```

This will generate a file called `qawolf.yml` in the `.github/workflows` directory at the root of your project. You can edit `.github/workflows/qawolf.yml` to suit your needs.

#### Trigger

The workflow will run per commit. To run your tests on a [schedule](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#onschedule), comment in the following lines:

```yaml
name: qawolf
on:
  push:

  schedule:
    # test on schedule using cron syntax
    - cron: "0 * * * *" # every hour
```

#### Environment Variables

You can configure your tests with [environment variables](api#environment-variables) directly, or by [adding them to your GitHub repository](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets).

Example:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
        with:
          fetch-depth: 50
      - name: qawolf test
        uses: qawolf/qawolf@master
        env:
          # override the default sleep time
          QAW_SLEEP_MS: 0
          # set secret environment variables in GitHub repository settings
          QAW_CREATE_ACCOUNT_1: ${{ secrets.PASSWORD }}
```

To learn more about configuring workflows in GitHub Actions, see [GitHub's documentation](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/configuring-workflows).

### <a name="gitlab"></a> 🦊 GitLab

Generate a configuration file for [GitLab CI/CD](https://docs.gitlab.com/ee/ci/README.html):

```bash
npx qawolf gitlab
```

This will generate a file called `.gitlab-ci.yml` at the root of your project. You can edit `.gitlab-ci.yml` to suit your needs.

#### Trigger

The workflow will run per commit. To run your tests on a schedule, follow [GitLab's documentation](https://docs.gitlab.com/ee/user/project/pipelines/schedules.html).

#### Environment Variables

You can configure your tests with [environment variables](api#environment-variables) directly, or by [adding them to your GitLab settings](https://docs.gitlab.com/ee/ci/variables/#protected-environment-variables).

Example:

```yaml
qawolf:
  image: qawolf/qawolf:latest
  script: qawolf test
  variables:
    # override the default sleep time
    QAW_SLEEP_MS: 0
    # set protected environment variables in GitLab settings
    QAW_CREATE_ACCOUNT_1: $SECRET_PASSWORD
```

To learn more about configuring pipelines in GitLab, see [GitLab's documentation](https://docs.gitlab.com/ee/ci/yaml/).

### <a name="jenkins"></a> 🤵 Jenkins

Generate a Jenkinsfile for [Jenkins](https://jenkins.io/doc/book/pipeline/jenkinsfile):

```bash
npx qawolf jenkins
```

This will generate a file called `Jenkinsfile` at the root of your project. You can edit `Jenkinsfile` to suit your needs.

#### Environment Variables

You can configure your tests with [environment variables](api#environment-variables).

Example:

```
environment {
  // override the default sleep time
  QAW_SLEEP_MS = 0
}
```

To learn more about configuring pipelines in Jenkins, see [Jenkins's documentation](https://jenkins.io/doc/pipeline/tour/hello-world/).

## 🕵️ Debug

Each test generates debugging artifacts that you can use to understand failures. These include a video, gif, interactive DOM recording, and browser logs.

![](https://storage.googleapis.com/docs.qawolf.com/home/debug.gif)
