export interface MarketplacePack {
  id: string
  name: string
  tagline: string
  description: string
  category: 'Agent' | 'Skill'
  version: string
  seedDownloads: number
  files: { label: string; path: string }[]
  connect?: 'gmail-demo'
}

export const marketplacePacks: MarketplacePack[] = [
  {
    id: 'gmail-inbox-agent',
    name: 'Gmail Inbox Agent',
    tagline: 'Triage, draft replies, and summarize threads from your inbox.',
    description:
      'A minimal agent + skill pair that connects to Gmail over MCP. The skill file defines the capabilities (search threads, draft replies, label/triage) and the agent config wires those capabilities to a model. Ships as a downloadable starting point — point it at your own Gmail MCP connection to run it for real.',
    category: 'Agent',
    version: '0.1.0',
    seedDownloads: 128,
    files: [
      { label: 'agent.json', path: '/skills/gmail-agent/agent.json' },
      { label: 'SKILL.md', path: '/skills/gmail-agent/SKILL.md' },
    ],
    connect: 'gmail-demo',
  },
]
