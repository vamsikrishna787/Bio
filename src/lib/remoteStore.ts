// A tiny JSON key-value store with two backends:
//  - S3 (via an unauthenticated Cognito Identity Pool) when VITE_S3_BUCKET +
//    VITE_COGNITO_IDENTITY_POOL_ID are configured — see README for setup.
//  - localStorage otherwise (and always, as a local cache for instant reads).
// This lets comments/likes/download-counts be genuinely shared across
// visitors when AWS is wired up, while the site fully works without it.

import { getAwsRegion, getIdentityPoolId, getS3Bucket, isS3Configured } from './awsConfig'

const LOCAL_PREFIX = 'remote-store:'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LOCAL_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function cacheLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore quota/private-browsing errors — S3 (if configured) is still authoritative
  }
}

async function getS3Handle() {
  const [{ S3Client, GetObjectCommand, PutObjectCommand }, { fromCognitoIdentityPool }] = await Promise.all([
    import('@aws-sdk/client-s3'),
    import('@aws-sdk/credential-providers'),
  ])
  const region = getAwsRegion()
  const client = new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region },
      identityPoolId: getIdentityPoolId()!,
    }),
  })
  return { client, GetObjectCommand, PutObjectCommand, bucket: getS3Bucket()! }
}

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  if (!isS3Configured()) return readLocal(key, fallback)
  try {
    const { client, GetObjectCommand, bucket } = await getS3Handle()
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const text = await res.Body!.transformToString()
    const parsed = JSON.parse(text) as T
    cacheLocal(key, parsed)
    return parsed
  } catch (err: unknown) {
    if ((err as { name?: string })?.name !== 'NoSuchKey') {
      console.warn(`[remoteStore] S3 read failed for "${key}", using local cache`, err)
    }
    return readLocal(key, fallback)
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  cacheLocal(key, value)
  if (!isS3Configured()) return
  try {
    const { client, PutObjectCommand, bucket } = await getS3Handle()
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(value),
        ContentType: 'application/json',
      }),
    )
  } catch (err) {
    console.warn(`[remoteStore] S3 write failed for "${key}", kept local-only`, err)
  }
}
