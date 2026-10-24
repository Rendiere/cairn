export type Item = {
  slug: string
  title: string
  folder: string
  type: string
  status: string
  company: string
  date: string
  depends: string[]
  question: string
  headings: string[]
}

export type Vault = {
  root: string
  loadedAt: number
  items: Item[]
  sweepSlot: string
  error: string
}

export type Answer = {
  heading: string
  text: string
  thinking: string
  confidence: string
  reading: string
}

export type Draft = { text: string; thinking: string; confidence: string }

declare module 'claude-code' {
  interface PluginState {
    'cairn-pane': {
      interviewing: boolean
      selected: string
      step: number
      startedAt: number
      tick: number
      vault: Shaped<Vault>
      answers: Shaped<Answer[]>
      draft: Shaped<Draft>
      readback: Shaped<Record<string, string>>
    }
  }
}
