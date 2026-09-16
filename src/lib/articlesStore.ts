import { readJSON, writeJSON } from './remoteStore'
import { getClientId } from './visitor'

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface Likes {
  count: number
  likedBy: string[]
}

export async function getComments(slug: string): Promise<Comment[]> {
  return readJSON<Comment[]>(`articles/${slug}/comments.json`, [])
}

export async function addComment(slug: string, author: string, text: string): Promise<Comment[]> {
  const comments = await getComments(slug)
  const next: Comment[] = [
    ...comments,
    { id: crypto.randomUUID(), author: author.trim() || 'Anonymous', text: text.trim(), createdAt: new Date().toISOString() },
  ]
  await writeJSON(`articles/${slug}/comments.json`, next)
  return next
}

export async function getLikes(slug: string): Promise<Likes> {
  return readJSON<Likes>(`articles/${slug}/likes.json`, { count: 0, likedBy: [] })
}

export async function toggleLike(slug: string): Promise<Likes> {
  const likes = await getLikes(slug)
  const clientId = getClientId()
  const alreadyLiked = likes.likedBy.includes(clientId)
  const likedBy = alreadyLiked ? likes.likedBy.filter((id) => id !== clientId) : [...likes.likedBy, clientId]
  const next: Likes = { count: likedBy.length, likedBy }
  await writeJSON(`articles/${slug}/likes.json`, next)
  return next
}
