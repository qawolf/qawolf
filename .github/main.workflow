workflow "Build and Test" {
  on = "push"
  resolves = ["Test", "Lint"]
}

action "Build" {
  uses = "actions/npm@master"
  args = "install"
}

action "Test" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "test"
}

action "Lint" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "lint"
}
