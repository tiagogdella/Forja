import db from '../../DB/db.js'
import { verificarToken } from '../utils/jwt.js'

// Protege rotas - requer login
export async function requireAuth(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            erro: 'Não autenticado',
            autenticado: false
        })
    }

    let payload
    try {
        payload = verificarToken(token)
    } catch (erro) {
        return res.status(401).json({
            erro: 'Token inválido ou expirado',
            autenticado: false
        })
    }

    try {
        const usuario = await db.prepare(
            'SELECT id, username, nome_completo FROM usuarios WHERE id = ? AND ativo = 1'
        ).get(payload.userId)

        if (!usuario) {
            return res.status(401).json({
                erro: 'Usuário inválido ou desativado',
                autenticado: false
            })
        }

        req.user = usuario
        next()
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao verificar autenticação' })
    }
}

// Verifica auth sem bloquear (para rotas opcionais)
export async function checkAuth(req, res, next) {
    const token = req.cookies.token

    if (token) {
        try {
            const payload = verificarToken(token)
            const usuario = await db.prepare(
                'SELECT id, username, nome_completo FROM usuarios WHERE id = ? AND ativo = 1'
            ).get(payload.userId)
            if (usuario) req.user = usuario
        } catch (_) {}
    }

    next()
}
