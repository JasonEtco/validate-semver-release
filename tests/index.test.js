const path = require('path')
const runAction = require('..')
const { Toolkit } = require('actions-toolkit')

function mockToolkit (event) {
  // Load the relevant JSON file
  process.env.GITHUB_EVENT_PATH = path.join(
    __dirname,
    'fixtures',
    `${event}.json`
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
  beforeEach(() => {
    Object.assign(process.env, {
      GITHUB_EVENT: 'release',
      GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspace')
    })
  })

  it('exits neutral for draft releases', () => {
    const tools = mockToolkit('release-draft')
    runAction(tools)
    expect(tools.exit.neutral).toHaveBeenCalled()
  })

  it('exits failure for invalid tag', () => {
    const tools = mockToolkit('release-invalid-tag')
    runAction(tools)
    expect(tools.exit.failure).toHaveBeenCalled()
  })

  it('exits failure for a tag/version mismatch', () => {
    const tools = mockToolkit('release-wrong-version')
    runAction(tools)
    expect(tools.exit.failure).toHaveBeenCalled()
  })

  it('exits successfully with no issues', () => {
    const tools = mockToolkit('release')
    runAction(tools)
    expect(tools.exit.success).toHaveBeenCalled()
  })
})
