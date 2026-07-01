const API_BASE = import.meta.env.VITE_API_URL || ''

export function apiUrl(path) {
  if (!path) return API_BASE
  if (/^https?:\/\//.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const normalizedBase = API_BASE.replace(/\/$/, '')
  return `${normalizedBase}${normalizedPath}`
}

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options)
}
