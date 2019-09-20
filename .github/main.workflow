workflow "CI" {
  resolves = ["npm run lint"]
  on = "push"
}

action "npm run lint" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "npm run lint"
}
