<h3 align="center">Validate Semver Release</h3>
<p align="center">A GitHub Action that validates GitHub Releases against semantic versioning rules<p>

## What it checks for

* That the Git tag and the version in your `package.json` match
* That the Git tag and the `package.json` version are both valid SemVer
* That if the release is a prerelease, so is your version (either `beta` or `next`)

## Usage

```yaml
# Triggered by new releases on GitHub
on: release

jobs:
  # Run some checks against the new release
  validate:
    steps:
      - uses: actions/checkout@v1
      - uses: JasonEtco/validate-semver-release@master
  # Publish the library to NPM if all is good!
  publish:
    needs: [validate]
    steps:
      - uses: actions/npm@master
        args: publish
```

If your release is a valid prerelease, it'll store the prerelease tag in a `release-workflow-tag` file in the workspace and will ouput it as the `release-workflow-tag` output:

```yaml
on: release

jobs:
  validate_and_publish:
    steps:
      - uses: actions/checkout@v1

      # Run the action with an `id` to get the outputs
      - uses: JasonEtco/validate-semver-release@master
        id: validate

      # Call `npm publish` with the specific tag
      - uses: actions/npm@master
        args: publish --tag ${{ steps.validate.outputs.release-workflow-tag }}
```

One example usage is to use the contents of that file in later actions to pass a `--tag` flag to `npm publish`.
