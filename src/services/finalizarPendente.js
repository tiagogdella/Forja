import { apiFetch } from './api'

const CHAVE_PREFIXO = 'treino_finalizar_pendente_'

export function salvarPendente(execucaoId, treinoId, series) {
    localStorage.setItem(`${CHAVE_PREFIXO}${execucaoId}`, JSON.stringify({ execucaoId, treinoId, series }))
}

export function removerPendente(execucaoId) {
    localStorage.removeItem(`${CHAVE_PREFIXO}${execucaoId}`)
}

export function listarPendentes() {
    const pendentes = []
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i)
        if (chave?.startsWith(CHAVE_PREFIXO)) {
            try {
                pendentes.push(JSON.parse(localStorage.getItem(chave)))
            } catch (e) {}
        }
    }
    return pendentes
}

export async function tentarFinalizar(execucaoId, series) {
    const res = await apiFetch(`/api/execucoes/${execucaoId}/finalizar`, {
        method: 'POST',
        body: JSON.stringify({ series })
    })
    const dados = await res.json()
    return { ok: res.ok, dados }
}
