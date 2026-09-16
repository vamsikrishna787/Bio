import type { DiagramEdge, DiagramNode } from '../features/systemDesign/FlowDiagram'

export interface SystemDesign {
  id: string
  title: string
  summary: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  width?: number
  height?: number
}

export const systemDesigns: SystemDesign[] = [
  {
    id: 'agentic-rag',
    title: 'Agentic RAG Pipeline',
    summary:
      'Documents are chunked and embedded into a vector store ahead of time; at query time a retriever + re-ranker ground the model’s answer in the right passages instead of its own memory.',
    width: 760,
    height: 320,
    nodes: [
      { id: 'docs', x: 90, y: 60, w: 120, h: 56, label: 'Documents', variant: 'store' },
      { id: 'chunk', x: 260, y: 60, w: 120, h: 56, label: 'Chunker' },
      { id: 'embed', x: 430, y: 60, w: 120, h: 56, label: 'Embedder' },
      { id: 'store', x: 600, y: 60, w: 130, h: 56, label: 'Vector Store', variant: 'store' },
      { id: 'query', x: 90, y: 240, w: 120, h: 56, label: 'User Query' },
      { id: 'retrieve', x: 260, y: 240, w: 120, h: 56, label: 'Retriever' },
      { id: 'rerank', x: 430, y: 240, w: 120, h: 56, label: 'Re-ranker' },
      { id: 'llm', x: 600, y: 240, w: 140, h: 56, label: 'LLM Agent', variant: 'accent', icon: 'robot' },
      { id: 'response', x: 730, y: 150, w: 100, h: 56, label: 'Response' },
    ],
    edges: [
      { from: 'docs', to: 'chunk' },
      { from: 'chunk', to: 'embed' },
      { from: 'embed', to: 'store' },
      { from: 'query', to: 'retrieve' },
      { from: 'store', to: 'retrieve', label: 'similarity search' },
      { from: 'retrieve', to: 'rerank' },
      { from: 'rerank', to: 'llm' },
      { from: 'query', to: 'llm' },
      { from: 'llm', to: 'response' },
    ],
  },
  {
    id: 'multi-agent-orchestrator',
    title: 'Multi-Agent Orchestrator',
    summary:
      'One orchestrator decomposes a task and dispatches it to narrow sub-agents running concurrently, then aggregates their results — the exact pattern the Lab tab runs live.',
    width: 760,
    height: 320,
    nodes: [
      { id: 'task', x: 380, y: 40, w: 170, h: 52, label: 'Task: cheapest flight', variant: 'accent' },
      { id: 'orch', x: 380, y: 135, w: 190, h: 56, label: 'Orchestrator Agent', variant: 'accent', icon: 'robot' },
      { id: 'a1', x: 100, y: 235, w: 145, h: 56, label: 'Delta Agent', icon: 'robot' },
      { id: 'a2', x: 262, y: 235, w: 150, h: 56, label: 'United Agent', icon: 'robot' },
      { id: 'a3', x: 500, y: 235, w: 160, h: 56, label: 'American Agent', icon: 'robot' },
      { id: 'a4', x: 668, y: 235, w: 165, h: 56, label: 'Southwest Agent', icon: 'robot' },
      { id: 'result', x: 380, y: 300, w: 190, h: 40, label: 'Aggregated result' },
    ],
    edges: [
      { from: 'task', to: 'orch' },
      { from: 'orch', to: 'a1' },
      { from: 'orch', to: 'a2' },
      { from: 'orch', to: 'a3' },
      { from: 'orch', to: 'a4' },
      { from: 'a1', to: 'result' },
      { from: 'a2', to: 'result' },
      { from: 'a3', to: 'result' },
      { from: 'a4', to: 'result' },
    ],
  },
  {
    id: 'mcp-tool-integration',
    title: 'MCP Tool Integration',
    summary:
      'The Model Context Protocol standardizes the boundary between a model-driven agent and the tools it can call — one client/server contract, reusable across models and tools.',
    width: 760,
    height: 300,
    nodes: [
      { id: 'agent', x: 110, y: 150, w: 160, h: 56, label: 'Agent / Model', variant: 'accent', icon: 'robot' },
      { id: 'client', x: 320, y: 150, w: 130, h: 56, label: 'MCP Client' },
      { id: 'server', x: 510, y: 150, w: 130, h: 56, label: 'MCP Server' },
      { id: 't1', x: 690, y: 60, w: 130, h: 50, label: 'Gmail API', variant: 'store' },
      { id: 't2', x: 690, y: 150, w: 130, h: 50, label: 'Internal DB', variant: 'store' },
      { id: 't3', x: 690, y: 240, w: 130, h: 50, label: 'Calendar API', variant: 'store' },
    ],
    edges: [
      { from: 'agent', to: 'client', label: 'tool calls' },
      { from: 'client', to: 'server', label: 'MCP protocol' },
      { from: 'server', to: 't1' },
      { from: 'server', to: 't2' },
      { from: 'server', to: 't3' },
    ],
  },
  {
    id: 'agentic-sdlc',
    title: 'Agentic SDLC Lifecycle',
    summary:
      'Specialized agents own each phase of the software lifecycle — planning, coding, testing, and deployment — with a human approval gate before release and a monitoring feedback loop back into planning.',
    width: 760,
    height: 300,
    nodes: [
      { id: 'plan', x: 90, y: 60, w: 120, h: 56, label: 'Plan', variant: 'accent' },
      { id: 'code', x: 280, y: 60, w: 150, h: 56, label: 'Code Agent', icon: 'robot' },
      { id: 'test', x: 470, y: 60, w: 150, h: 56, label: 'Test Agent', icon: 'robot' },
      { id: 'review', x: 660, y: 60, w: 160, h: 56, label: 'Review Agent', icon: 'robot' },
      { id: 'approval', x: 660, y: 230, w: 160, h: 56, label: 'Human Approval', variant: 'store' },
      { id: 'deploy', x: 470, y: 230, w: 160, h: 56, label: 'Deploy Agent', icon: 'robot' },
      { id: 'monitor', x: 280, y: 230, w: 165, h: 56, label: 'Monitor Agent', icon: 'robot' },
    ],
    edges: [
      { from: 'plan', to: 'code' },
      { from: 'code', to: 'test' },
      { from: 'test', to: 'review' },
      { from: 'review', to: 'approval' },
      { from: 'approval', to: 'deploy' },
      { from: 'deploy', to: 'monitor' },
      { from: 'monitor', to: 'plan', label: 'feedback loop' },
    ],
  },
]
