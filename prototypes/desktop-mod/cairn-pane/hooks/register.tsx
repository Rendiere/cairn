// PROTOTYPE for cairn issue #7: is a desktop side pane the right interface for cairn?
// One pane over the owner's vault, top to bottom: the session in progress, the map, the queue. Reads the vault, never writes it.
import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register } from 'claude-code'

import type { Answer, Draft, Item, Vault } from '../types'

const PANE = 'cairn-pane'
const TITLE = 'cairn (prototype)'
const NOTE_FOLDERS = ['concepts', 'systems', 'projects', 'synthesis', 'people', 'maps', 'queue']
const INTERVIEW_HEADINGS = ['In one sentence', 'Why it exists', 'Connects to', 'Failure modes', 'My position']
const SESSION_MINUTES = 20
const CONFIDENCE = ['guessing', 'unsure', 'fairly sure', 'certain']

const interviewing = atom({ plugin: 'cairn-pane', key: 'interviewing' } as const, false)
const selected = atom({ plugin: 'cairn-pane', key: 'selected' } as const, '')
const step = atom({ plugin: 'cairn-pane', key: 'step' } as const, 0)
const startedAt = atom({ plugin: 'cairn-pane', key: 'startedAt' } as const, 0)
const tick = atom({ plugin: 'cairn-pane', key: 'tick' } as const, 0)
const EMPTY_VAULT: Vault = { root: '', loadedAt: 0, items: [], sweepSlot: '', error: '' }
const vault = atom({ plugin: 'cairn-pane', key: 'vault' } as const, EMPTY_VAULT, { shape: 'vault-1' })
const answers = atom({ plugin: 'cairn-pane', key: 'answers' } as const, [] as Answer[], { shape: 'answers-1' })
const EMPTY_DRAFT: Draft = { text: '', thinking: '', confidence: '' }
const draft = atom({ plugin: 'cairn-pane', key: 'draft' } as const, EMPTY_DRAFT, { shape: 'draft-1' })
const readback = atom({ plugin: 'cairn-pane', key: 'readback' } as const, {} as Record<string, string>, {
  shape: 'readback-1',
})

function frontmatter(text: string): Record<string, string> {
  const m = /^---\n([\s\S]*?)\n---/.exec(text)
  const out: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line)
    if (kv?.[1]) out[kv[1]] = (kv[2] ?? '').trim()
  }
  return out
}

function list(v: string | undefined): string[] {
  return (v ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => s.trim().replace(/^\[\[|\]\]$/g, ''))
    .filter(Boolean)
}

function section(text: string, heading: string): string {
  const m = new RegExp(`^## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`, 'm').exec(text)
  return (m?.[1] ?? '').trim()
}

function sweepSlot(toml: string): string {
  const on: string[] = []
  for (const block of toml.split(/^\[cadence\./m).slice(1)) {
    const name = block.split(']')[0]
    if (/enabled\s*=\s*true/.test(block)) on.push(`${name} ${/slot\s*=\s*"([^"]*)"/.exec(block)?.[1] ?? ''}`.trim())
  }
  return on.length ? on.join(', ') : 'no sweep slot set'
}

async function loadVault($: EngineInterface): Promise<Vault> {
  const home = (await $.env.get('HOME')) ?? ''
  try {
    const config = await $.fs.read(`${home}/.config/cairn/config.toml`)
    const root = (/^vault\s*=\s*"([^"]+)"/m.exec(config)?.[1] ?? '').replace(/^~/, home)
    const items: Item[] = []
    for (const folder of NOTE_FOLDERS) {
      if (!(await $.fs.exists(`${root}/${folder}`))) continue
      for (const entry of await $.fs.list(`${root}/${folder}`)) {
        if (entry.kind !== 'file' || !entry.name.endsWith('.md')) continue
        const text = await $.fs.read(`${root}/${folder}/${entry.name}`)
        const fm = frontmatter(text)
        items.push({
          slug: entry.name.replace(/\.md$/, ''),
          title: /^# (.+)$/m.exec(text)?.[1] ?? entry.name,
          folder,
          type: fm.type ?? folder,
          status: fm.status ?? (folder === 'maps' ? 'map' : ''),
          company: fm.company ?? '',
          date: (fm.reviewed || list(fm.interviewed).at(-1) || fm.opened || '').trim(),
          depends: list(fm.depends),
          question: folder === 'queue' ? section(text, 'The question') : section(text, 'In one sentence'),
          headings: [...text.matchAll(/^## (.+)$/gm)].map(m => m[1] ?? ''),
        })
      }
    }
    const vaultToml = (await $.fs.exists(`${root}/cairn.toml`)) ? await $.fs.read(`${root}/cairn.toml`) : ''
    return { root, loadedAt: await $.clock.now(), items, sweepSlot: sweepSlot(`${config}\n${vaultToml}`), error: '' }
  } catch (err) {
    return { ...EMPTY_VAULT, error: String(err) }
  }
}

async function refresh($: EngineInterface) {
  const v = await loadVault($)
  await update($, vault, () => v)
}

function minutesSince(start: number, now: number): number {
  return start ? Math.floor((now - start) / 60000) : 0
}

function bar(done: number, total: number, width: number): string {
  const filled = Math.max(0, Math.min(width, Math.round((done / Math.max(1, total)) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const STATUS_COLOR: Record<string, string> = {
  stub: '#9aa0a6',
  open: '#4c8bf5',
  draft: '#f29900',
  defensible: '#1e8e3e',
  map: '#a142f4',
}

function graphSvg(items: Item[]): string {
  const cols: Record<string, Item[]> = {}
  for (const it of items) (cols[it.folder] ??= []).push(it)
  const folders = Object.keys(cols)
  const W = 180
  const H = 44
  const pos: Record<string, { x: number; y: number }> = {}
  folders.forEach((f, ci) => (cols[f] ?? []).forEach((it, ri) => (pos[it.slug] = { x: 20 + ci * W, y: 40 + ri * H })))
  const rows = Math.max(...folders.map(f => cols[f]?.length ?? 0), 1)
  const edges = items
    .flatMap(it => it.depends.map(d => [pos[it.slug], pos[d]] as const))
    .filter(([a, b]) => a && b)
    .map(([a, b]) => `<line x1="${a!.x}" y1="${a!.y}" x2="${b!.x + 150}" y2="${b!.y}" stroke="#888" stroke-width="1.5"/>`)
  const heads = folders.map((f, ci) => `<text x="${20 + ci * W}" y="18" font-size="12" fill="#888">${f}</text>`)
  const nodes = items.map(it => {
    const p = pos[it.slug]!
    const label = it.title.length > 22 ? `${it.title.slice(0, 21)}…` : it.title
    return `<g><rect x="${p.x}" y="${p.y - 14}" width="150" height="28" rx="6" fill="${STATUS_COLOR[it.status] ?? '#666'}"/><text x="${p.x + 8}" y="${p.y + 4}" font-size="11" fill="#fff">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></g>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${folders.length * W + 20} ${rows * H + 40}">${heads.join('')}${edges.join('')}${nodes.join('')}</svg>`
}


export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'cairn-pane', description: 'PROTOTYPE: open the cairn side pane' })
    await refresh($)
    $.clock.every(30_000, () => void update($, tick, n => n + 1))
    return next(e)
  })

  on('command.run', { command: 'cairn-pane' }, async $ => {
    await refresh($)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'cairn pane opened (prototype).' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const { Input, Select, Svg } = $.ui.resolve(e) as Partial<Elements['desktop']>
    const v = await read($, vault)
    const width = e.props.bodyColumns

    if (v.error) return <Text color="error">Could not read the vault: {v.error}</Text>

    const queue = v.items.filter(i => i.folder === 'queue' && i.status === 'open')
    const drafts = v.items.filter(i => i.status === 'draft')
    const due = v.items.filter(i => i.status === 'defensible').sort((a, b) => a.date.localeCompare(b.date))
    const sel = await read($, selected)
    const picked = v.items.find(i => i.slug === sel)
    const topic = (picked?.folder === 'queue' ? picked : undefined) ?? queue.find(i => !i.company) ?? queue[0]
    const isInterviewing = await read($, interviewing)

    const heading = (text: string) => (
      <Text bold size="heading">
        {text}
      </Text>
    )

    const now = async () => {
      if (!isInterviewing) {
        const marks = await read($, readback)
        const card = due[0]
        return (
          <Box flexDirection="column" gap={1}>
            <Text bold>Today's read-back: {card?.title ?? 'nothing defensible yet'}</Text>
            {card?.headings
              .filter(name => !['Sources', 'Going deeper'].includes(name))
              .map(name => {
                const mark = marks[`${card.slug}#${name}`]
                return (
                  <Box flexDirection="row" gap={1}>
                    <Text>
                      {mark === 'mine' ? '✓' : mark === 'redo' ? '✗' : '·'} {name}
                    </Text>
                    <Button key={`mine-${name}`} plain label="still mine" onPress={() => void update($, readback, m => ({ ...m, [`${card.slug}#${name}`]: 'mine' }))} />
                    <Button key={`redo-${name}`} plain label="re-interview" onPress={() => void update($, readback, m => ({ ...m, [`${card.slug}#${name}`]: 'redo' }))} />
                  </Box>
                )
              })}
            {topic && (
              <Button key="start" variant="primary" label={`Start interview: ${topic.title}`} onPress={() => void update($, interviewing, () => true)} />
            )}
          </Box>
        )
      }

      const s = await read($, step)
      const start = await read($, startedAt)
      await read($, tick)
      const clock = await $.clock.now()
      const done = await read($, answers)
      const d = await read($, draft)
      const used = minutesSince(start, clock)
      const question = INTERVIEW_HEADINGS[s]
      const finished = s >= INTERVIEW_HEADINGS.length
      const answer = async () => {
        if (!question) return
        if (!(await read($, startedAt))) {
          const t = await $.clock.now()
          await update($, startedAt, () => t)
        }
        const cur = await read($, draft)
        const reading = await $.model.complete({
          model: 'claude-haiku-5-5',
          maxTokens: 120,
          system: 'You read one answer from a learner. In two short sentences say what they seem to understand and what they seem to be missing. Do not teach.',
          prompt: `Topic: ${topic?.title}\nQuestion: ${question}\nConfidence: ${cur.confidence || 'not given'}\nThinking aloud: ${cur.thinking}\nAnswer: ${cur.text}`,
        })
        await update($, answers, list => [
          ...list,
          { heading: question, ...cur, reading: reading.isAnswered ? reading.text : `(no reading: ${reading.reason})` },
        ])
        await update($, draft, () => EMPTY_DRAFT)
        await update($, step, n => n + 1)
      }
      const stop = () =>
        void Promise.all([
          update($, interviewing, () => false),
          update($, step, () => 0),
          update($, startedAt, () => 0),
          update($, answers, () => []),
          update($, draft, () => EMPTY_DRAFT),
        ])
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Interview: {topic?.title ?? 'no open queue item'}</Text>
          <Text>
            Step {Math.min(s + 1, INTERVIEW_HEADINGS.length)} of {INTERVIEW_HEADINGS.length}{' '}
            {bar(s, INTERVIEW_HEADINGS.length, Math.max(5, Math.min(30, width - 20)))}
          </Text>
          <Text color={used > SESSION_MINUTES ? 'error' : undefined} dimColor={!start}>
            {start ? `${used} of ${SESSION_MINUTES} min used, ${Math.max(0, SESSION_MINUTES - used)} left` : `${SESSION_MINUTES} min, starts on your first answer`}
          </Text>
          <Box flexDirection="column">
            {INTERVIEW_HEADINGS.map((name, i) => (
              <Text dimColor={i !== s} bold={i === s}>
                {i < s ? '✓' : i === s ? '›' : '·'} {name}
              </Text>
            ))}
          </Box>
          {!finished && (!Input || !Select) && <Text dimColor>This surface has no text fields.</Text>}
          {!finished && Input && Select && (
            <Box flexDirection="column" gap={1}>
              <Input
                key="answer"
                label={question}
                placeholder="Your answer, in your words"
                rows={3}
                value={d.text}
                onInput={t => void update($, draft, x => ({ ...x, text: t }))}
                onSubmit={t => void update($, draft, x => ({ ...x, text: t }))}
              />
              <Input
                key="thinking"
                label="Thinking aloud (optional)"
                placeholder="Stream of consciousness, typed or dictated"
                rows={3}
                value={d.thinking}
                onInput={t => void update($, draft, x => ({ ...x, thinking: t }))}
                onSubmit={t => void update($, draft, x => ({ ...x, thinking: t }))}
              />
              <Select
                key="confidence"
                label="Confidence"
                options={CONFIDENCE.map(c => ({ value: c }))}
                value={d.confidence || undefined}
                onSelect={c => void update($, draft, x => ({ ...x, confidence: c }))}
              />
              <Button key="answer-btn" variant="primary" label="Answer" onPress={() => void answer()} />
            </Box>
          )}
          {done.length > 0 && (
            <Markdown
              text={done
                .map(a => `**${a.heading}** (${a.confidence || 'no rating'})\n\n> ${a.text || '_empty_'}\n\n_Model's reading:_ ${a.reading}`)
                .join('\n\n')}
            />
          )}
          {finished && <Text color="success">Done. In cairn this is where the transcript and note would be written.</Text>}
          <Button key="stop" plain label={finished ? 'close interview' : 'stop interview'} onPress={stop} />
        </Box>
      )
    }

    const row = (it: Item) => (
      <Button key={`row-${it.slug}`} plain onPress={() => void update($, selected, () => (it.slug === sel ? '' : it.slug))}>
        {it.slug === sel ? '› ' : '  '}
        {it.title} <Text dimColor>{[it.date, it.company].filter(Boolean).join(' · ')}</Text>
      </Button>
    )

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" gap={1}>
          <Text dimColor>Prototype · {v.items.length} notes and queue items</Text>
          <Button key="refresh" plain label="refresh" onPress={() => void refresh($)} />
        </Box>

        {heading('Now')}
        {await now()}

        {heading('Map')}
        {Svg ? (
          <Box flexDirection="column">
            <Svg source={graphSvg(v.items)} alt="cairn vault graph" width={Math.max(20, width - 2)} />
            <Text dimColor>grey stub · blue open · orange draft · green defensible · purple map</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            {v.items.map(it => (
              <Text>
                <Text color={it.status === 'defensible' ? 'success' : it.status === 'draft' ? 'warning' : 'suggestion'}>■</Text> {it.folder}/{it.slug}
                {it.depends.length ? <Text dimColor> → {it.depends.join(', ')}</Text> : ''}
              </Text>
            ))}
          </Box>
        )}

        {heading('Queue')}
        <Text dimColor>Next sweep: {v.sweepSlot}</Text>
        <Box flexDirection="column">
          <Text bold>Open ({queue.length})</Text>
          {queue.map(row)}
        </Box>
        {drafts.length > 0 && (
          <Box flexDirection="column">
            <Text bold>Drafts ({drafts.length})</Text>
            {drafts.map(row)}
          </Box>
        )}
        {picked && (
          <Box flexDirection="column" borderStyle="round" paddingX={1}>
            <Markdown
              text={`**${picked.title}** · ${picked.folder} · ${picked.status || 'no status'}\n\n${picked.question || '_no question or one-sentence answer yet_'}${picked.depends.length ? `\n\nDepends on: ${picked.depends.join(', ')}` : ''}`}
            />
            <Button key="study" variant="primary" label={`/cairn:study ${picked.slug}`} onPress={() => void $.prompt.fill({ text: `/cairn:study ${picked.slug}`, mode: 'replace' })} />
          </Box>
        )}
      </Box>
    )
  })
}
