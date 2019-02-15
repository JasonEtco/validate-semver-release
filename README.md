<h3 align="center">Validate Semver Release</h3>
<p align="center">A GitHub Action that validates GitHub Releases against semantic versioning paradigms<p>

## Usage

```workflow
workflow "Publish a release" {
  on = "release"
  resolves = ["publish"]
}

action "Validate my release" {
  uses = "JasonEtco/validate-semver-release@master"
}
```

If your release is a valid prerelease, it'll store the prerelease tag in a `release-workflow-tag` file in the workspace.

One example usage is to use the contents of that file in later actions to pass a `--tag` flag to `npm publish`.
