const CLIENT_ID_KEY = 'bio:client-id'
const DISPLAY_NAME_KEY = 'bio:display-name'

export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

export function getDisplayName(): string {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function setDisplayName(name: string) {
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, name)
  } catch {
    // ignore
  }
}
