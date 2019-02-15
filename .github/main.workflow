workflow "Test my code" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "actions/npm@master"
  args = "ci"
}

action "npm test" {
  uses = "actions/npm@master"
  args = "test"
  needs = ["npm ci"]
}
