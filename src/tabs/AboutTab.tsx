import { articles } from '../data/articles'
import { ArticleItem } from '../features/articles/ArticleItem'

export function AboutTab() {
  return (
    <>
      <section className="tight">
        <div className="wrap">
          <div className="section-head fade-in">
            <div className="section-eyebrow">About</div>
            <h2>Building at the intersection<br />of cloud and AI</h2>
          </div>
          <div className="about-body fade-in">
            <p>I'm a software engineer with <strong>11 years of experience</strong> designing and building web applications on public cloud platforms, using modern JavaScript frameworks and robust backend architectures.</p>
            <p>More recently, my focus has shifted toward <strong>solving real business problems with agentic AI</strong> — building solutions using MCP, RAG pipelines, and autonomous agents that connect cloud infrastructure with practical, intelligent workflows.</p>
            <p>Currently a Senior Associate Software Engineer at <strong>JPMorgan Chase &amp; Co.</strong>, and <strong>AWS Certified</strong> as a Solutions Architect and Developer (Associate).</p>
          </div>
          <div className="pill-row fade-in">
            <span className="pill">Cloud Architecture</span>
            <span className="pill">Modern JavaScript</span>
            <span className="pill">Backend Systems</span>
            <span className="pill">Agentic AI</span>
            <span className="pill">MCP</span>
            <span className="pill">RAG</span>
          </div>
        </div>
      </section>

      <section className="tight" style={{ background: 'var(--bg-soft)' }}>
        <div className="wrap">
          <div className="section-head fade-in">
            <div className="section-eyebrow">Writing</div>
            <h2>Articles</h2>
            <p className="section-sub">Notes on agentic AI, RAG, and cloud architecture. Comments and likes are shared across visitors.</p>
          </div>
          <div className="article-list">
            {articles.map((article) => (
              <ArticleItem key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
