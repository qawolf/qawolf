workflow "Build and Test" {
  resolves = ["Lint"]
  on = "push"
}

action "Build" {
  uses = "actions/npm@master"
  args = "install"
}

action "Lint" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "lint"
  secrets = ["GITHUB_TOKEN"]
}
