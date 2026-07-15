# TODO — forja

Backlog de melhorias e mudanças futuras do projeto. Cada seção é uma frente de trabalho; vamos riscando os itens conforme forem implementados.

---

## 1. Migrar autenticação de sessão de servidor para JWT

**Por quê:** hoje a auth usa `express-session` + `memorystore` (sessão guardada na RAM do processo Node — ver `backend/middleware/session.js`). O Render (free tier) hiberna o backend depois de ~15min sem uso; quando volta, é um processo novo com a memória zerada, ou seja, todas as sessões ativas são perdidas — mesmo o cookie tendo `maxAge` de 7 dias. É por isso que precisa logar de novo todo dia no iPhone. JWT resolve isso na raiz porque o token é autocontido (não depende de nada guardado no servidor).

**Decisão de transporte (definir antes de começar):** manter o token num **cookie httpOnly** (em vez de `localStorage` + header `Authorization`). Motivo: o app já usa `credentials: 'include'` + CORS com `credentials: true` em tudo (`src/services/api.js`, `backend/server.js`), então a troca fica quase transparente pro frontend — só muda o que tem *dentro* do cookie (token assinado em vez de id de sessão em memória). `localStorage` exigiria mudar o `apiFetch` inteiro pra anexar header em toda chamada, e fica exposto a roubo via XSS.

**Trade-off a decidir:** sessão de servidor hoje revalida no banco a cada request (`requireAuth` faz `SELECT ... WHERE id = ? AND ativo = 1`), então desativar um usuário (`ativo = 0`) derruba o acesso dele na hora. Com JWT 100% stateless isso se perde — o token continua válido até expirar mesmo se o usuário for desativado. Recomendo manter essa consulta ao banco a cada request mesmo com JWT (perde um pouco da "pureza" stateless, mas preserva a revogação imediata, que é um comportamento de segurança que já existe hoje e não devíamos regredir).

### Passos

- [x] Adicionar dependência `jsonwebtoken` no `package.json`
- [x] Definir `JWT_SECRET` como variável de ambiente (gerar um secret forte novo — não reaproveitar o `SESSION_SECRET` hardcoded que existe hoje como fallback) e configurar no `.env` local e no painel do Render
- [x] Criar util de assinar/verificar token (`backend/utils/jwt.js`) com payload mínimo (`userId`, `username`) e expiração de 7 dias (igual ao `maxAge` atual)
- [x] `backend/routes/auth.js` — `POST /login`: em vez de `req.session.userId = ...`, assinar o JWT e setar via `res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'none', maxAge: ... })`
- [x] `backend/routes/auth.js` — `POST /logout`: trocar `req.session.destroy()` por `res.clearCookie('token', ...)`
- [x] `backend/routes/auth.js` — `GET /status`: não precisou mexer, a rota só lê `req.user`, quem monta isso é o middleware (item abaixo)
- [ ] Adicionar `cookie-parser` (dependência que faltava no plano original — sem ela `req.cookies` não existe, e o middleware de auth precisa ler o cookie `token`)
- [ ] `backend/middleware/auth.js` — reescrever `requireAuth` e `checkAuth` pra verificar o JWT do cookie (com `jwt.verify`) em vez de `req.session.userId`, mantendo a consulta `usuarios WHERE id = ? AND ativo = 1` (ver trade-off acima)
- [ ] `backend/server.js` — remover o `sessionMiddleware` (não precisa mais de `express-session`/`memorystore`)
- [ ] Remover dependências `express-session` e `memorystore` do `package.json` depois que tudo estiver migrado e testado
- [ ] Testar fluxo completo: login → navegar entre telas → esperar o Render hibernar (ou forçar restart) → confirmar que continua autenticado sem precisar logar de novo
- [ ] Testar especificamente no iPhone (motivo original do problema) por alguns dias
- [ ] Testar cenário de usuário desativado (`ativo = 0`) — confirmar que ainda derruba o acesso na próxima request, não só no próximo login

---

## 2. (placeholder pra próximas frentes)

Vamos adicionando aqui conforme surgirem — próximas ideias, bugs conhecidos, features.
