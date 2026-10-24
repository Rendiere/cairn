export type Status = 'stub' | 'open' | 'draft' | 'defensible' | 'map' | ''

export type Item = {
  slug: string
  title: string
  folder: string
  status: Status
  company: string
  date: string
  depends: string[]
  question: string
}

export type Vault = {
  items: Item[]
  sweepSlots: string
  error: string
}

export type Confidence = '' | 'guessing' | 'unsure' | 'fairly sure' | 'certain'

export type Answer = {
  heading: string
  text: string
  thinking: string
  confidence: Confidence
  reading: string
}

export type Draft = { text: string; thinking: string; confidence: Confidence }

declare module 'claude-code' {
  interface PluginState {
    cairn: {
      topic: string
      selected: string
      step: number
      startedAt: number
      busy: boolean
      tick: number
      vault: Shaped<Vault>
      answers: Shaped<Answer[]>
      draft: Shaped<Draft>
      readback: Shaped<Record<string, boolean>>
    }
  }
}
