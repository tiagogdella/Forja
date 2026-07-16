import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../../DB/db.js';
import { checkAuth } from '../middleware/auth.js'
import { assinarToken } from '../utils/jwt.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ erro: 'Username e senha são obrigatórios' });
  }

  try {
    const usuario = await db.prepare(
      'SELECT * FROM usuarios WHERE username = ? COLLATE NOCASE AND ativo = 1'
    ).get(username);

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
    }

    await db.prepare('UPDATE usuarios SET ultimo_login = ? WHERE id = ?')
      .run(new Date().toISOString(), usuario.id);

    const token = assinarToken({ userId: usuario.id, username: usuario.username })
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })

    res.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nome_completo: usuario.nome_completo
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, nome_completo } = req.body

  if (!username || !password) {
    return res.status(400).json({ erro: 'Username e senha são obrigatórios' })
  }

  if (username.length < 3) {
    return res.status(400).json({ erro: 'Username deve ter no mínimo 3 caracteres' })
  }

  if (password.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' })
  }

  try {
    const existente = await db.prepare(
      'SELECT id FROM usuarios WHERE username = ? COLLATE NOCASE'
    ).get(username)

    if (existente) {
      return res.status(409).json({ erro: 'Username já existe' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await db.prepare(`
      INSERT INTO usuarios (username, password_hash, nome_completo, data_criacao, ativo)
      VALUES (?, ?, ?, ?, 1)
    `).run(username, passwordHash, nome_completo || null, new Date().toISOString())

    const usuario = {
      id: result.lastInsertRowid,
      username,
      nome_completo: nome_completo || null
    }

    const token = assinarToken({ userId: usuario.id, username: usuario.username })

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
    })

    res.json({ sucesso: true, usuario })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  res.json({ sucesso: true })
})

// GET /api/auth/status
router.get('/status', checkAuth, (req, res) => {
  if (req.user) {
    res.json({
      autenticado: true,
      usuario: {
        id: req.user.id,
        username: req.user.username,
        nome_completo: req.user.nome_completo
      }
    });
  } else {
    res.json({ autenticado: false });
  }
});

export default router;
