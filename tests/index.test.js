const path = require('path')
const { Toolkit } = require('actions-toolkit')

function mockToolkit (event, workspace = 'workspace') {
  // Load the relevant JSON file
  process.env.GITHUB_EVENT_PATH = path.join(
    __dirname,
    'fixtures',
    `${event}.json`
  )
  // Load the relevant workspace file
  process.env.GITHUB_WORKSPACE = path.join(
    __dirname,
    'fixtures',
    workspace
  )

  // Silence warning
  Toolkit.prototype.warnForMissingEnvVars = jest.fn()

  // Mock the toolkit exit functions
  const tools = new Toolkit()
  tools.exit.neutral = jest.fn()
  tools.exit.failure = jest.fn()
  tools.exit.success = jest.fn()
  return tools
}

describe('validate-semver-release', () => {
  let runAction

  beforeEach(() => {
    Toolkit.run = jest.fn(fn => { runAction = fn })
    require('../entrypoint')

    Object.assign(process.env, {
      GITHUB_EVENT: 'release',
      GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspace')
    })
  })

  it('exits neutral for draft releases', async () => {
    const tools = mockToolkit('release-draft')
    await runAction(tools)
    expect(tools.exit.neutral).toHaveBeenCalled()
    expect(tools.exit.neutral.mock.calls).toMatchSnapshot()
  })

  it('exits failure for invalid tag', async () => {
    const tools = mockToolkit('release-invalid-tag')
    await runAction(tools)
    expect(tools.exit.failure).toHaveBeenCalled()
    expect(tools.exit.failure.mock.calls).toMatchSnapshot()
  })

  it('exits failure for a tag/version mismatch', async () => {
    const tools = mockToolkit('release-wrong-version')
    await runAction(tools)
    expect(tools.exit.failure).toHaveBeenCalled()
    expect(tools.exit.failure.mock.calls).toMatchSnapshot()
  })

  it('exits successfully with no issues', async () => {
    const tools = mockToolkit('release')
    await runAction(tools)
    expect(tools.exit.success).toHaveBeenCalled()
    expect(tools.exit.success.mock.calls).toMatchSnapshot()
  })

  describe('prereleases', async () => {
    it('exits failure with no semver prelease on the tag', async () => {
      const tools = mockToolkit('release-prerelease-not-tag')
      await runAction(tools)
      expect(tools.exit.failure).toHaveBeenCalled()
      expect(tools.exit.failure.mock.calls).toMatchSnapshot()
    })

    it('exits failure with an invalid prerelease tag', async () => {
      const tools = mockToolkit('release-prerelease-invalid-tag', 'workspace-invalid-prerelease')
      await runAction(tools)
      expect(tools.exit.failure).toHaveBeenCalled()
      expect(tools.exit.failure.mock.calls).toMatchSnapshot()
    })

    it('writes to a file with a valid tag and version', async () => {
      const tools = mockToolkit('release-prerelease', 'workspace-prerelease')
      await runAction(tools)
      expect(tools.exit.success).toHaveBeenCalled()
      expect(tools.exit.success.mock.calls).toMatchSnapshot()
      const file = tools.getFile('release-workflow-tag')
      expect(file).toBe('beta')
    })
  })
})
