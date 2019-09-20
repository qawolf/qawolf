workflow "Build and Test" {
  resolves = ["Lint"]
  on = "push"
}

action "Build" {
  uses = "actions/npm@master"
  args = "install"
  env = {
    NODE_AUTH_TOKEN = "${{ secrets.GITHUB_TOKEN }}"
  }
  secrets = ["GITHUB_TOKEN"]
}

action "Lint" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "lint"
}
