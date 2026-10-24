import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register } from 'claude-code'

import type { Answer, Confidence, Draft, Item, Status, Vault } from '../types'

const PANE = 'cairn-pane'
const TITLE = 'cairn'
const NOTE_FOLDERS = ['concepts', 'systems', 'projects', 'synthesis', 'people', 'maps', 'queue']
const PRACTICE_HEADINGS = ['In one sentence', 'Why it exists', 'Connects to', 'Failure modes', 'My position']
const PRACTICE_MINUTES = 10
const CONFIDENCE: Confidence[] = ['guessing', 'unsure', 'fairly sure', 'certain']
// The Svg element refuses a source past 131,072 characters; a node with its edges is about 250.
const MAX_GRAPH_NODES = 300

const STATUS: Record<Status, { fill: string; theme: 'inactive' | 'suggestion' | 'warning' | 'success' | 'merged' | 'subtle'; label: string }> = {
  stub: { fill: '#9aa0a6', theme: 'inactive', label: 'grey stub' },
  open: { fill: '#4c8bf5', theme: 'suggestion', label: 'blue open' },
  draft: { fill: '#f29900', theme: 'warning', label: 'orange draft' },
  defensible: { fill: '#1e8e3e', theme: 'success', label: 'green defensible' },
  map: { fill: '#a142f4', theme: 'merged', label: 'purple map' },
  '': { fill: '#666666', theme: 'subtle', label: 'dark grey no status' },
}

const topic = atom({ plugin: 'cairn', key: 'topic' } as const, '')
const selected = atom({ plugin: 'cairn', key: 'selected' } as const, '')
const step = atom({ plugin: 'cairn', key: 'step' } as const, 0)
const startedAt = atom({ plugin: 'cairn', key: 'startedAt' } as const, 0)
const busy = atom({ plugin: 'cairn', key: 'busy' } as const, false)
const tick = atom({ plugin: 'cairn', key: 'tick' } as const, 0)
const EMPTY_VAULT: Vault = { items: [], sweepSlots: '', error: '' }
const vault = atom({ plugin: 'cairn', key: 'vault' } as const, EMPTY_VAULT, { shape: 'vault-2' })
const answers = atom({ plugin: 'cairn', key: 'answers' } as const, [] as Answer[], { shape: 'answers-2' })
const EMPTY_DRAFT: Draft = { text: '', thinking: '', confidence: '' }
const draft = atom({ plugin: 'cairn', key: 'draft' } as const, EMPTY_DRAFT, { shape: 'draft-2' })
const readback = atom({ plugin: 'cairn', key: 'readback' } as const, {} as Record<string, boolean>, { shape: 'readback-2' })

function frontmatter(text: string): Record<string, string> {
  const m = /^---\n([\s\S]*?)\n---/.exec(text)
  const out: Record<string, string> = {}
  let last = ''
  for (const line of (m?.[1] ?? '').split('\n')) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line)
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (kv?.[1]) {
      last = kv[1]
      out[last] = (kv[2] ?? '').trim()
    } else if (item && last) {
      out[last] = [out[last], item[1]].filter(Boolean).join(', ')
    }
  }
  return out
}

function list(v: string | undefined): string[] {
  return (v ?? '')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, '').replace(/^\[\[|\]\]$/g, ''))
    .filter(Boolean)
}

function section(text: string, heading: string): string {
  const lines = text.split('\n')
  const start = lines.indexOf(`## ${heading}`)
  if (start < 0) return ''
  const rest = lines.slice(start + 1)
  const end = rest.findIndex(l => l.startsWith('## '))
  return (end < 0 ? rest : rest.slice(0, end)).join('\n').trim()
}

function sweepSlots(toml: string): string {
  const on: string[] = []
  for (const block of toml.split(/^\[cadence\./m).slice(1)) {
    const name = block.split(']')[0]
    if (/enabled\s*=\s*true/.test(block)) on.push(`${name} ${/slot\s*=\s*["']([^"']*)["']/.exec(block)?.[1] ?? ''}`.trim())
  }
  return on.length ? on.join(', ') : 'none set; /cairn:setup sets them'
}

function asStatus(v: string | undefined, folder: string): Status {
  if (v === 'stub' || v === 'open' || v === 'draft' || v === 'defensible') return v
  return folder === 'maps' ? 'map' : ''
}

async function readText($: EngineInterface, path: string): Promise<string> {
  return (await $.fs.exists(path)) ? (await $.fs.read(path)).replace(/\r\n/g, '\n') : ''
}

async function loadVault($: EngineInterface): Promise<Vault> {
  const home = (await $.env.get('HOME')) ?? ''
  const configPath = ((await $.env.get('CAIRN_CONFIG')) || `${home}/.config/cairn/config.toml`).replace(/^~/, home)
  try {
    const config = await readText($, configPath)
    if (!config) return { ...EMPTY_VAULT, error: `No cairn config at ${configPath}. Run /cairn:setup.` }
    const root = (/^vault\s*=\s*["']([^"']+)["']/m.exec(config)?.[1] ?? '').replace(/^~/, home)
    if (!root || !(await $.fs.exists(root))) {
      return { ...EMPTY_VAULT, error: `The vault ${root || '(not set)'} named in ${configPath} is missing. Run /cairn:setup to repair it.` }
    }
    const items: Item[] = []
    for (const folder of NOTE_FOLDERS) {
      if (!(await $.fs.exists(`${root}/${folder}`))) continue
      for (const entry of await $.fs.list(`${root}/${folder}`)) {
        if (entry.kind !== 'file' || !entry.name.endsWith('.md')) continue
        const text = await readText($, `${root}/${folder}/${entry.name}`)
        const fm = frontmatter(text)
        items.push({
          slug: entry.name.replace(/\.md$/, ''),
          title: /^# (.+)$/m.exec(text)?.[1] ?? entry.name,
          folder,
          status: asStatus(fm.status, folder),
          company: fm.company ?? '',
          date: list(fm.interviewed).at(-1) || fm.opened || '',
          depends: list(fm.depends),
          question: section(text, folder === 'queue' ? 'The question' : 'In one sentence'),
        })
      }
    }
    const vaultToml = await readText($, `${root}/cairn.toml`)
    return { items, sweepSlots: sweepSlots(vaultToml.includes('[cadence.') ? vaultToml : config), error: '' }
  } catch (err) {
    return { ...EMPTY_VAULT, error: `Could not read the vault: ${String(err)}. Run /cairn:setup to check it.` }
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

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
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
  const heads = folders.map((f, ci) => `<text x="${20 + ci * W}" y="18" font-size="12" fill="#888">${escape(f)}</text>`)
  const nodes = items.map(it => {
    const p = pos[it.slug]!
    const label = it.title.length > 22 ? `${it.title.slice(0, 21)}…` : it.title
    return `<g><rect x="${p.x}" y="${p.y - 14}" width="150" height="28" rx="6" fill="${STATUS[it.status].fill}"/><text x="${p.x + 8}" y="${p.y + 4}" font-size="11" fill="#fff">${escape(label)}</text></g>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${folders.length * W + 20} ${rows * H + 40}">${heads.join('')}${edges.join('')}${nodes.join('')}</svg>`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)
    $.clock.every(30_000, () => void update($, tick, n => n + 1))
    return next(e)
  })

  on('command.run', { command: 'cairn:pane' }, async $ => {
    await refresh($)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'cairn pane opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const { Input, Select, Svg } = $.ui.resolve(e) as Elements['desktop']
    const hasSvg = e.surface !== 'terminal'
    const hasFields = e.surface !== 'mobile'
    const v = await read($, vault)
    const width = e.props.bodyColumns

    if (v.error) return <Text color="error">{v.error}</Text>

    const queue = v.items.filter(i => i.folder === 'queue' && i.status === 'open')
    const drafts = v.items.filter(i => i.status === 'draft')
    const due = v.items.filter(i => i.status === 'defensible').sort((a, b) => a.date.localeCompare(b.date))
    const sel = await read($, selected)
    const picked = v.items.find(i => i.slug === sel)
    const practiceSlug = await read($, topic)
    const practice = v.items.find(i => i.slug === practiceSlug)
    const nextTopic = (picked?.folder === 'queue' ? picked : undefined) ?? queue.find(i => !i.company) ?? queue[0]
    const fill = (text: string) => () => void $.prompt.fill({ text, mode: 'replace' })

    const heading = (text: string) => (
      <Text bold size="heading">
        {text}
      </Text>
    )

    const readBack = async () => {
      const card = due[0]
      if (!card) return <Text dimColor>No defensible note is due a read-back.</Text>
      const kept = (await read($, readback))[card.slug]
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Today's read-back: {card.title}</Text>
          <Markdown text={card.question ? `> ${card.question.replace(/\n/g, '\n> ')}` : '_No answer under "In one sentence"._'} />
          {kept ? (
            <Text color="success">✓ Still sounds like you. Noted in this pane only; the sweep records read-backs.</Text>
          ) : (
            <Box flexDirection="row" gap={1}>
              <Text>Does this still sound like you?</Text>
              <Button key="readback-yes" plain label="yes" onPress={() => void update($, readback, m => ({ ...m, [card.slug]: true }))} />
              <Button key="readback-no" plain label={`no: /cairn:interview ${card.slug}`} onPress={fill(`/cairn:interview ${card.slug}`)} />
            </Box>
          )}
          {nextTopic && (
            <Button key="start" variant="primary" label={`Practice interview: ${nextTopic.title}`} onPress={() => void update($, topic, () => nextTopic.slug)} />
          )}
        </Box>
      )
    }

    const practiceInterview = async (item: Item) => {
      const s = await read($, step)
      const start = await read($, startedAt)
      await read($, tick)
      const clock = await $.clock.now()
      const done = await read($, answers)
      const d = await read($, draft)
      const isBusy = await read($, busy)
      const used = minutesSince(start, clock)
      const finished = s >= PRACTICE_HEADINGS.length
      const setDraft = (field: 'text' | 'thinking') => (t: string) => void update($, draft, x => ({ ...x, [field]: t }))
      const answer = async () => {
        let claimed = false
        await update($, busy, b => {
          claimed = !b
          return true
        })
        if (!claimed) return
        const at = await read($, step)
        const question = PRACTICE_HEADINGS[at]
        if (question) {
          if (!(await read($, startedAt))) {
            const t = await $.clock.now()
            await update($, startedAt, () => t)
          }
          const cur = await read($, draft)
          const reading = await $.model.complete({
            model: 'claude-haiku-5-5',
            maxTokens: 120,
            system: 'You read one answer from a learner. In two short sentences say what they seem to understand and what they seem to be missing. Do not teach.',
            prompt: `Topic: ${item.title}\nQuestion: ${question}\nConfidence: ${cur.confidence || 'not given'}\nThinking aloud: ${cur.thinking}\nAnswer: ${cur.text}`,
          })
          await update($, answers, list => [
            ...list,
            { heading: question, ...cur, reading: reading.isAnswered ? reading.text : `(no reading: ${reading.reason})` },
          ])
          await update($, draft, () => EMPTY_DRAFT)
          await update($, step, n => n + 1)
        }
        await update($, busy, () => false)
      }
      const stop = () =>
        void Promise.all([
          update($, topic, () => ''),
          update($, step, () => 0),
          update($, startedAt, () => 0),
          update($, answers, () => []),
          update($, draft, () => EMPTY_DRAFT),
        ])
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Practice interview: {item.title}</Text>
          <Text dimColor>Answers stay in this pane and are not saved. /cairn:interview writes the note.</Text>
          <Text>
            Question {Math.min(s + 1, PRACTICE_HEADINGS.length)} of {PRACTICE_HEADINGS.length}{' '}
            {bar(s, PRACTICE_HEADINGS.length, Math.max(5, Math.min(30, width - 20)))}
          </Text>
          <Text color={used > PRACTICE_MINUTES ? 'error' : undefined} dimColor={!start}>
            {start ? `${used} of ${PRACTICE_MINUTES} min used, ${Math.max(0, PRACTICE_MINUTES - used)} left` : `${PRACTICE_MINUTES} min, starts on your first answer`}
          </Text>
          <Box flexDirection="column">
            {PRACTICE_HEADINGS.map((name, i) => (
              <Text dimColor={i !== s} bold={i === s}>
                {i < s ? '✓' : i === s ? '›' : '·'} {name}
              </Text>
            ))}
          </Box>
          {!finished && !hasFields && <Text dimColor>This surface has no text fields; the desktop app does.</Text>}
          {!finished && hasFields && (
            <Box flexDirection="column" gap={1}>
              <Input key="answer" label={PRACTICE_HEADINGS[s]} placeholder="Your answer, in your words" rows={3} value={d.text} onInput={setDraft('text')} onSubmit={setDraft('text')} />
              <Input
                key="thinking"
                label="Thinking aloud (optional)"
                placeholder="Stream of consciousness, typed or dictated"
                rows={3}
                value={d.thinking}
                onInput={setDraft('thinking')}
                onSubmit={setDraft('thinking')}
              />
              <Select
                key="confidence"
                label="Confidence"
                options={CONFIDENCE.map(c => ({ value: c }))}
                value={d.confidence || undefined}
                onSelect={c => void update($, draft, x => ({ ...x, confidence: CONFIDENCE.find(k => k === c) ?? '' }))}
              />
              <Button key="answer-btn" variant="primary" label={isBusy ? 'Reading your answer…' : 'Answer'} onPress={() => void answer()} />
            </Box>
          )}
          {done.length > 0 && (
            <Markdown
              text={done
                .map(a => `**${a.heading}** (${a.confidence || 'no rating'})\n\n> ${a.text || '_empty_'}\n\n_Model's reading:_ ${a.reading}`)
                .join('\n\n')}
            />
          )}
          {finished && <Button key="interview" variant="primary" label={`/cairn:interview ${item.slug}`} onPress={fill(`/cairn:interview ${item.slug}`)} />}
          <Button key="stop" plain label={finished ? 'close practice' : 'stop practice'} onPress={stop} />
        </Box>
      )
    }

    const row = (it: Item) => (
      <Button key={`row-${it.slug}`} plain onPress={() => void update($, selected, cur => (cur === it.slug ? '' : it.slug))}>
        {it.slug === sel ? '› ' : '  '}
        {it.title} <Text dimColor>{[it.date, it.company].filter(Boolean).join(' · ')}</Text>
      </Button>
    )
    const drawn = v.items.slice(0, MAX_GRAPH_NODES)
    const legend = [...new Set(drawn.map(i => i.status))].map(s => STATUS[s].label).join(' · ')

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="row" gap={1}>
          <Text dimColor>{v.items.length} notes and queue items</Text>
          <Button key="refresh" plain label="refresh" onPress={() => void refresh($)} />
        </Box>

        {heading('Now')}
        {practice ? await practiceInterview(practice) : await readBack()}

        {heading('Map')}
        {hasSvg ? (
          <Box flexDirection="column">
            <Svg source={graphSvg(drawn)} alt="cairn vault graph" width={Math.max(20, width - 2)} />
            <Text dimColor>{legend}</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            {drawn.map(it => (
              <Text>
                <Text color={STATUS[it.status].theme}>■</Text> {it.folder}/{it.slug}
                {it.depends.length ? <Text dimColor> → {it.depends.join(', ')}</Text> : ''}
              </Text>
            ))}
          </Box>
        )}
        {v.items.length > drawn.length && <Text dimColor>{v.items.length - drawn.length} more not drawn.</Text>}

        {heading('Queue')}
        <Text dimColor>Sweep slots: {v.sweepSlots}</Text>
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
            <Button key="study" variant="primary" label={`/cairn:study ${picked.slug}`} onPress={fill(`/cairn:study ${picked.slug}`)} />
          </Box>
        )}
      </Box>
    )
  })
}
