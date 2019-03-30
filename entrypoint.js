const fs = require('fs')
const path = require('path')
const semver = require('semver')
const { Toolkit } = require('actions-toolkit')

Toolkit.run(tools => {
  const pkg = tools.getPackageJSON()
  const { release } = tools.context.payload

  if (release.draft) {
    return tools.exit.neutral('This release is a draft! Aborting.')
  }

  const tag = semver.valid(release.tag_name)
  if (!tag) {
    return tools.exit.failure(`The tag ${release.tag_name} is not a valid tag.`)
  }

  if (pkg.version !== tag) {
    return tools.exit.failure(`Tag ${tag} and version in the package.json ${pkg.version} are not the same.`)
  }

  if (release.prerelease) {
    const prereleaseTag = semver.prerelease(release.tag_name)

    if (prereleaseTag === null) {
      return tools.exit.failure(`The release is a prerelease, but the version tag is not.`)
    }

    const VALID_TAGS = ['beta', 'next']
    const [tagName] = prereleaseTag

    if (!VALID_TAGS.includes(tagName)) {
      return tools.exit.failure(`Publish tag ${tagName} is not a valid tag - it must be one of ${VALID_TAGS.join(', ')}`)
    }

    fs.writeFileSync(path.join(tools.workspace, 'release-workflow-tag'), tagName)
  }

  return tools.exit.success(`Release of version ${tag} is all set!`)
}, { event: 'release' })
