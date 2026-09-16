// Real Bedrock Runtime invocation, loaded lazily and only ever used if a
// visitor opts in via the Lab's "Live Bedrock" settings panel (BYO credentials,
// kept in sessionStorage — see awsConfig.ts). Without that, callers should
// treat this as unavailable and fall back to the simulated orchestrator.
// Note: some Bedrock Runtime endpoints reject cross-origin browser requests
// (no CORS headers) — callers must catch failures and degrade gracefully.

import { getBedrockCredentials, getBedrockModelId } from './awsConfig'

export function isBedrockLiveAvailable(): boolean {
  return getBedrockCredentials() !== null
}

export async function invokeBedrockSummary(prompt: string): Promise<string> {
  const creds = getBedrockCredentials()
  if (!creds) throw new Error('No live Bedrock credentials configured')

  const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime')
  const client = new BedrockRuntimeClient({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  })

  const modelId = getBedrockModelId()
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const res = await client.send(
    new InvokeModelCommand({
      modelId,
      body,
      contentType: 'application/json',
      accept: 'application/json',
    }),
  )

  const text = new TextDecoder().decode(res.body)
  const parsed = JSON.parse(text)
  const content = parsed?.content?.[0]?.text
  if (!content) throw new Error('Unexpected Bedrock response shape')
  return content
}
