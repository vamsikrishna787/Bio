// All values are optional. Until they're supplied via a .env file (see README),
// every feature below transparently falls back to localStorage / a simulated
// run, so the site works fully with zero AWS setup.

export function getAwsRegion(): string {
  return import.meta.env.VITE_AWS_REGION || 'us-east-1'
}

export function getS3Bucket(): string | undefined {
  return import.meta.env.VITE_S3_BUCKET || undefined
}

export function getIdentityPoolId(): string | undefined {
  return import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || undefined
}

export function isS3Configured(): boolean {
  return Boolean(getS3Bucket() && getIdentityPoolId())
}

export function getBedrockModelId(): string {
  return import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0'
}

// Bring-your-own credentials for the Lab tab's optional "live Bedrock" mode.
// Entered by a visitor at runtime, kept in sessionStorage only — never bundled,
// never committed, cleared when the tab closes.
export interface BedrockCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
  region: string
}

const BEDROCK_CREDS_KEY = 'lab:bedrock-credentials'

export function getBedrockCredentials(): BedrockCredentials | null {
  try {
    const raw = sessionStorage.getItem(BEDROCK_CREDS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setBedrockCredentials(creds: BedrockCredentials | null) {
  try {
    if (creds) sessionStorage.setItem(BEDROCK_CREDS_KEY, JSON.stringify(creds))
    else sessionStorage.removeItem(BEDROCK_CREDS_KEY)
  } catch {
    // sessionStorage unavailable (private browsing etc.) — live mode just stays off
  }
}

export function isBedrockLiveConfigured(): boolean {
  return getBedrockCredentials() !== null
}
