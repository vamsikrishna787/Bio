export interface Article {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  paragraphs: string[]
}

export const articles: Article[] = [
  {
    slug: 'why-mcp-matters',
    title: 'Why the Model Context Protocol matters more than the models',
    date: '2026-08-12',
    tags: ['MCP', 'Agentic AI'],
    excerpt:
      'Model quality gets all the headlines, but the thing that actually determines whether an agent is useful in production is how cleanly it can reach your systems.',
    paragraphs: [
      "Every few months a new model claims the top of some leaderboard, and every few months teams re-litigate whether to switch providers. That churn is a distraction from the harder problem: **getting a model safely and reliably connected to the systems it needs to act on**. That's the problem MCP (Model Context Protocol) actually solves.",
      "Before MCP, every agent framework invented its own bespoke tool-calling glue — one integration per tool, per framework, per model provider. MCP standardizes that boundary: a server describes its tools once, and any MCP-aware client can discover and call them, regardless of which model is driving the conversation.",
      "In practice this means the integration work you do once — say, wiring up Gmail, a ticketing system, or an internal API — is reusable across every agent you build afterward, and portable if you swap the underlying model. That's the leverage: **decoupling capability from model choice**.",
      "The Gmail agent in this site's Marketplace tab is a small, concrete example of that shape: a skill file that describes **what** the agent can do, and an MCP connection that describes **how** it reaches Gmail — independent of whichever model ends up calling it.",
    ],
  },
  {
    slug: 'rag-thats-actually-grounded',
    title: 'RAG that’s actually grounded, not just retrieval-shaped',
    date: '2026-07-03',
    tags: ['RAG', 'Cloud Architecture'],
    excerpt:
      'Most RAG pipelines fail quietly: they retrieve something plausible-looking and the model confidently builds on it anyway. The fix is mostly boring engineering, not a fancier embedding model.',
    paragraphs: [
      "The pitch for retrieval-augmented generation is simple: fetch relevant context, hand it to the model, get a grounded answer. The failure mode is just as simple: the retriever returns something **topically related but wrong**, and the model, having no way to know that, answers confidently anyway.",
      "Chasing a better embedding model rarely fixes this. What actually moves the needle is unglamorous: chunking that respects document structure instead of fixed character windows, metadata filters that narrow the search space before the vector search runs, and a re-ranking pass that checks relevance with something more precise than cosine similarity.",
      "The other lever nobody wants to build is **abstention** — the pipeline needs a path where, if nothing retrieved clears a confidence bar, the model says so instead of synthesizing an answer from thin context. That single behavior does more for trust than any amount of prompt tuning.",
      "On AWS this tends to land on OpenSearch or a vector-enabled datastore behind a retrieval Lambda, with the ingestion side doing the real work: cleaning, chunking, and re-embedding on a schedule so the index doesn't quietly drift from the source of truth.",
    ],
  },
  {
    slug: 'orchestrator-pattern',
    title: 'The orchestrator/sub-agent pattern, explained with a flight search',
    date: '2026-06-18',
    tags: ['Agentic AI', 'Architecture'],
    excerpt:
      'Multi-agent systems sound complicated until you see the shape: one planner, several narrow workers, and an aggregation step. The Lab tab on this site runs exactly this pattern live.',
    paragraphs: [
      "A lot of “multi-agent” architecture diagrams are more confusing than the problem they're solving. Strip away the jargon and the pattern that actually works most often is simple: an **orchestrator** breaks a task into independent sub-tasks, hands each to a narrow **sub-agent**, and aggregates whatever comes back.",
      "The flight-search demo in the Lab tab is that pattern in its smallest useful form. The orchestrator receives “find the cheapest flight from A to B,” fans that out to one sub-agent per airline running concurrently, and each sub-agent's only job is answering one narrow question well.",
      "The interesting engineering isn't the sub-agents — it's the orchestrator's aggregation and failure handling: what happens if one sub-agent times out, how ties get broken, and how the final summary gets generated from structured results rather than re-parsing free text.",
      "This is also why the pattern is worth building even in simulation first: the orchestration logic, event stream, and aggregation step are all real code that doesn't change when you swap a simulated sub-agent for one that calls a live API or a Bedrock-hosted model.",
    ],
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
