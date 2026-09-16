import { useEffect, useState, type FormEvent } from 'react'
import type { Article } from '../../data/articles'
import { addComment, getComments, getLikes, toggleLike, type Comment, type Likes } from '../../lib/articlesStore'
import { formatDate, formatInline } from '../../lib/format'
import { getClientId, getDisplayName, setDisplayName } from '../../lib/visitor'

export function ArticleItem({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [likes, setLikes] = useState<Likes | null>(null)
  const [commentText, setCommentText] = useState('')
  const [authorName, setAuthorName] = useState(getDisplayName())
  const [posting, setPosting] = useState(false)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    if (!expanded || comments !== null) return
    let cancelled = false
    Promise.all([getComments(article.slug), getLikes(article.slug)]).then(([c, l]) => {
      if (!cancelled) {
        setComments(c)
        setLikes(l)
      }
    })
    return () => {
      cancelled = true
    }
  }, [expanded, article.slug, comments])

  const clientId = getClientId()
  const hasLiked = likes?.likedBy.includes(clientId) ?? false

  async function handleLike() {
    setLiking(true)
    try {
      setLikes(await toggleLike(article.slug))
    } finally {
      setLiking(false)
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    try {
      setDisplayName(authorName)
      setComments(await addComment(article.slug, authorName, commentText))
      setCommentText('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <article className="article-card fade-in">
      <button className="article-card-header" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
        <div>
          <div className="article-meta">
            {formatDate(article.date)} &middot; {article.tags.join(', ')}
          </div>
          <h3>{article.title}</h3>
          <p className="article-excerpt">{article.excerpt}</p>
        </div>
        <span className="article-chevron" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="article-body">
          {article.paragraphs.map((p, i) => (
            <p key={i}>{formatInline(p)}</p>
          ))}

          <div className="article-actions">
            <button
              type="button"
              className={`like-btn${hasLiked ? ' liked' : ''}`}
              onClick={handleLike}
              disabled={liking || !likes}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={hasLiked ? '#ff375f' : 'none'} stroke={hasLiked ? '#ff375f' : 'currentColor'} strokeWidth="1.8">
                <path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.2 5 5.7 5c2 0 3.4 1.1 4.3 2.4C10.9 6.1 12.3 5 14.3 5c3.5 0 5.2 3.4 3.7 6.9C19.5 16.4 12 21 12 21Z" />
              </svg>
              {likes ? likes.count : '…'}
            </button>
            <span className="comment-count">{comments ? comments.length : '…'} comments</span>
          </div>

          <div className="comments-section">
            {comments?.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-author">{c.author}</div>
                <p>{c.text}</p>
              </div>
            ))}
            {comments?.length === 0 && <p className="comments-empty">Be the first to comment.</p>}

            <form className="comment-form" onSubmit={handleComment}>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                maxLength={40}
                required
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                maxLength={500}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  )
}
