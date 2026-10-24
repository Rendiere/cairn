import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'cairn',
  component: 'Pane',
  requestId: 'cairn-pane',
  props: {
    title: 'cairn',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const VAULT: Record<string, string> = {
  '/home/brain/cairn.toml': "owner = 'Ada'\n\n[cadence.weekly]\nenabled = true\nslot = \"Fri 09:00\"\n",
  '/home/brain/concepts/parquet.md':
    '---\r\ntype: concept\r\ndepends: []\r\nstatus: defensible\r\ninterviewed: [2026-09-29]\r\n---\r\n# Parquet\r\n\r\n## In one sentence\r\n\r\nColumns on disk.\r\nRow groups inside.\r\n\r\n## Why it exists\r\n\r\n## Sources\r\n',
  '/home/brain/queue/parquet-bloom-filters.md':
    '---\ntype: queue\ndepends:\n  - "[[parquet]]"\nstatus: open\nopened: 2026-10-09\n---\n# Parquet bloom filters\n\n## The question\n\nWhen do they help?\n',
}

function vaultOn(on: Parameters<Parameters<typeof test>[1]>[1], files: Record<string, string>, env: Record<string, string>) {
  on('env.get', (_, e) => ({ value: env[e.name] }))
  on('clock.every', () => ({ value: {} }))
  on('clock.now', () => ({ value: 0 }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('fs.read', (_, e) => ({ value: files[e.path] ?? '' }))
  on('fs.exists', (_, e) => ({ value: Object.keys(files).some(p => p === e.path || p.startsWith(`${e.path}/`)) }))
  on('fs.list', (_, e) => ({
    value: Object.keys(files)
      .filter(p => p.startsWith(`${e.path}/`))
      .map(p => ({ name: p.slice(e.path.length + 1), kind: 'file', size: 1, mtimeMs: 0, isLink: false })),
  }))
}

test('the pane draws Now, Map and Queue and runs a practice interview, on the terminal and the desktop', async ($, on) => {
  vaultOn(on, { ...VAULT, '/home/.config/cairn/config.toml': "vault = '~/brain'\n" }, { HOME: '/home' })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect((await $.command.run({ command: 'cairn:pane' })).text).toBe('cairn pane opened.')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    for (const name of ['Now', 'Map', 'Queue']) expect(await ui.find({ type: 'Text', text: name })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Today's read-back: Parquet/ })).toBeDefined()
    expect(await ui.find({ type: 'Markdown', text: '> Columns on disk.\n> Row groups inside.' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Sweep slots: weekly Fri 09:00/ })).toBeDefined()
    if (surface === 'terminal') expect(await ui.find({ type: 'Text', text: /→ parquet/ })).toBeDefined()
    await ui.press({ key: 'start' })
    expect(await ui.find({ type: 'Text', text: /Practice interview: Parquet bloom filters/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /10 min/ })).toBeDefined()
    await ui.press({ key: 'stop' })
    expect(await ui.find({ type: 'Text', text: /Today's read-back/ })).toBeDefined()
    await ui.unmount()
  }
})

test('CAIRN_CONFIG names the config, and a missing one points at setup', async ($, on) => {
  vaultOn(on, VAULT, { HOME: '/home', CAIRN_CONFIG: '/elsewhere/config.toml' })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: 'No cairn config at /elsewhere/config.toml. Run /cairn:setup.' })).toBeDefined()
  await ui.unmount()
})
