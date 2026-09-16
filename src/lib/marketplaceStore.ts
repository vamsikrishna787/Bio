import { readJSON, writeJSON } from './remoteStore'

interface DownloadStats {
  count: number
}

export async function getDownloadCount(packId: string, seed = 0): Promise<number> {
  const stats = await readJSON<DownloadStats>(`marketplace/${packId}/downloads.json`, { count: seed })
  return stats.count
}

export async function recordDownload(packId: string, seed = 0): Promise<number> {
  const stats = await readJSON<DownloadStats>(`marketplace/${packId}/downloads.json`, { count: seed })
  const next = { count: stats.count + 1 }
  await writeJSON(`marketplace/${packId}/downloads.json`, next)
  return next.count
}
