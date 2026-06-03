const API_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://hackeando-seu-treino.onrender.com')

export async function apiFetch(endpoint, options = {}) {
    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    })
}