import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'cairn-pane',
  component: 'Pane',
  requestId: 'cairn-pane',
  props: {
    title: 'cairn (prototype)',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

const FILES: Record<string, string> = {
  '/home/.config/cairn/config.toml': 'vault = "~/brain"\n\n[cadence.weekly]\nenabled = true\nslot = "Fri 09:00"\n',
  '/home/brain/concepts/parquet.md':
    '---\ntype: concept\ndepends: []\nstatus: defensible\ninterviewed: [2026-09-29]\n---\n# Parquet\n\n## In one sentence\n\nColumns on disk.\n\n## Why it exists\n\n## Sources\n',
  '/home/brain/queue/parquet-bloom-filters.md':
    '---\ntype: queue\ndepends: [parquet]\nstatus: open\nopened: 2026-10-09\n---\n# Parquet bloom filters\n\n## The question\n\nWhen do they help?\n',
}

test('the pane draws its three sections and starts an interview, on the terminal and the desktop', async ($, on) => {
  on('command.register', () => ({ value: { command: 'cairn-pane' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('env.get', () => ({ value: '/home' }))
  on('clock.every', () => ({ value: { cancel: () => {} } }))
  on('clock.now', () => ({ value: 0 }))
  on('fs.read', (_, e) => ({ value: FILES[e.path] ?? '' }))
  on('fs.exists', (_, e) => ({ value: Object.keys(FILES).some(p => p.startsWith(`${e.path}/`) || p === e.path) }))
  on('fs.list', (_, e) => ({
    value: Object.keys(FILES)
      .filter(p => p.startsWith(`${e.path}/`))
      .map(p => ({ name: p.slice(e.path.length + 1), kind: 'file', size: 1, mtimeMs: 0, isLink: false })),
  }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    for (const name of ['Now', 'Map', 'Queue']) expect(await ui.find({ type: 'Text', text: name })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Today's read-back: Parquet/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Fri 09:00/ })).toBeDefined()
    await ui.press({ key: 'start' })
    expect(await ui.find({ type: 'Text', text: /Interview: Parquet bloom filters/ })).toBeDefined()
    await ui.press({ key: 'stop' })
    expect(await ui.find({ type: 'Text', text: /Today's read-back/ })).toBeDefined()
    await ui.unmount()
  }
})
