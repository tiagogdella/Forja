# BUGS — forja

Histórico de bugs encontrados e corrigidos, com data e motivo. Existe porque várias vezes já perguntamos "por que esse código está aqui?" sem lembrar — isso documenta o *porquê*, não só o *o quê* (o `TODO.md` é pra planejamento futuro; este arquivo é pra não esquecer o passado).

Ordem: mais recente primeiro.

---

## [Em andamento] Finalizar treino perde dados numa conexão ruim

**Identificado:** 2026-10-03
**Sintoma:** usuário aumenta número de séries, preenche tudo, mas quando volta ao treino o progresso sumiu — execuções abandonadas no banco com **zero séries salvas**. Investigado com dados reais contra produção: nenhum problema de cota do Turso (310 execuções / 1640 séries no total, bem longe do limite), nenhum bug geral no backend (testado com conta descartável, funcionou perfeito).
**Causa raiz:** `finalizarTreino()` manda **uma requisição de rede por série** (até 10 requisições sequenciais pra um treino de 3x3). Numa rede fraca de academia, se a 1ª falhar (mesmo após o retry de ~50s do `apiFetch`), o laço para ali — as séries seguintes nem chegam a ser tentadas, mesmo já digitadas na tela. Combinado com uso via iPhone em modo "app da tela de início", onde o Safari pode suspender a aba no meio da espera.
**Fix desenhado (ainda não implementado):**
1. Backend: uma rota só recebe a execução inteira (todas as séries de uma vez) numa transação — ou salva tudo, ou nada, nunca fica pela metade.
2. Frontend: ao clicar "Finalizar", salva o pacote completo no `localStorage` *antes* de tentar mandar — funciona como fila de reenvio.
3. Se a requisição falhar, o cache local continua; na próxima vez que o app abrir (não só depois do erro), tenta reenviar sozinho, sem o usuário precisar refazer nada.
**Status:** desenho fechado com o usuário, aguardando implementação.

---

## 2026-09-28 — `!important` quebrava o contraste do botão "Voltar" no modo escuro

**Sintoma:** dentro da tela de execução de treino (modo foco escuro), o link "< Voltar" ficava quase invisível — texto escuro em fundo escuro.
**Causa:** `.navbar-brand { color: var(--ink) !important; }` (regra base, modo claro) sempre vencia `.focus-mode .navbar-brand { color: var(--d-ink); }` (sem `!important`), não importa a especificidade do seletor — `!important` ganha de qualquer regra sem `!important`, sempre.
**Fix:** adicionado `!important` também na regra do modo escuro. Commit `6158acf`.

## 2026-09-28 — `node --test` com glob `**` não funciona no Node 20 (CI)

**Sintoma:** e-mail de erro do GitHub toda vez que dava push na branch de arquitetura — CI falhando silenciosamente havia 3 pushes.
**Causa:** o fix anterior (ver abaixo, 2026-08-31) usava `node --test 'backend/**/*.test.js'`, que funciona no Node 24 (local) mas **não** no Node 20 (versão do `.github/workflows/ci.yml`) — Node 20 trata `**` como caminho literal, não como glob recursivo. Reproduzido instalando Node 20 local (`brew install node@20`) pra confirmar antes de mexer.
**Fix:** troca pra `node --test $(find backend -name '*.test.js')` — o glob é resolvido pelo *shell*, não pelo Node, então não depende de nenhuma versão entender `**`. Commit `21e7871`.

## 2026-08-31 — `npm test` quebrado: `node --test` com pasta não funciona

**Sintoma:** `npm test` dava `MODULE_NOT_FOUND` tentando rodar a pasta `backend/` como se fosse um script.
**Causa:** `node --test backend/` (passando diretório) não escaneia a pasta atrás de testes nessa versão do Node — tenta carregar a pasta como entry point.
**Fix:** glob explícito `'backend/**/*.test.js'` — que por sua vez gerou o bug de cima no CI, só corrigido de vez em 28/09. Commit `1223bc6`.

## 2026-08-31 — `API_URL` hardcoded pro Render quebrava teste local

**Sintoma:** `npm start` + abrir `localhost:3000` ficava "carregando" indefinidamente, sem erro visível.
**Causa:** `src/services/api.js` tinha fallback de produção `API_URL = 'https://hackeando-seu-treino.onrender.com'` — sobra da arquitetura antiga (frontend no GitHub Pages, backend no Render, domínios diferentes). O build local, mesmo servido pelo próprio `localhost:3000`, tentava falar com o Render de verdade; como o CORS só libera `tiagogdella.github.io`, toda chamada falhava e ficava re-tentando por ~50s (o retry de hibernação) antes de desistir.
**Fix:** `API_URL = ''` sempre (caminho relativo) — funciona em dev, build local e produção, já que front e back sempre rodam na mesma origem agora. Commit `08a474b`.

## 2026-08-24 — Rascunho de treino "zumbi", ficava preso pra sempre

**Sintoma:** app sempre abria o mesmo treino "pela metade", mesmo depois de finalizado com sucesso; às vezes a semana seguinte "não salvava".
**Causa:** duas falhas relacionadas em `TreinoView.vue`: (1) o rascunho local só era apagado se a busca de progressão (só informativa) desse certo *depois* do finalizar — qualquer falha ali deixava o rascunho preso; (2) a tela sempre restaurava o rascunho salvo mesmo quando a execução dele já tinha sido finalizada de verdade, mostrando "treino restaurado" e dados velhos numa sessão nova.
**Fix:** apaga o rascunho assim que o finalizar confirma sucesso (antes da parte informativa); só restaura o rascunho quando é de fato a mesma execução em aberto — caso contrário descarta sozinho. Commit `28dfac8`.

## 2026-08-21 — `bcrypt.compare` invertido no login (Fase 5)

**Sintoma:** encontrado testando manualmente a Fase 5 (auth alinhado à arquitetura em camadas) — login com senha errada não dava 401 como esperado.
**Causa:** argumentos do `bcrypt.compare(hash, senha)` invertidos (deveria ser `bcrypt.compare(senha, hash)`) durante a extração do `authService.js`.
**Fix:** ordem dos argumentos corrigida. Parte do commit `1625659` (Fase 5 completa).

## 2026-07-15 — Cookie JWT não persistia no app do iPhone (tela de início)

**Sintoma:** login funcionava no Safari normal, mas no app "Adicionado à Tela de Início" caía pra tela de login em minutos — não por expiração.
**Causa:** frontend (`tiagogdella.github.io`) e backend (`onrender.com`) são domínios diferentes — o `Set-Cookie` do backend é cookie *cross-site* do ponto de vista do Safari, e o iOS (Intelligent Tracking Prevention) bloqueia isso agressivamente, mais ainda dentro do contexto standalone de um web app na tela de início.
**Fix:** acessar o app pela própria URL do Render (que já serve o frontend estático) em vez do GitHub Pages — cookie vira first-party, restrição do Safari não se aplica. **Consequência: o link "oficial" do app é a URL do Render, não mais o GitHub Pages.** Parte da migração JWT, commit `a420258`. Detalhado também no `TODO.md`.

## 2026-07-07 — Render hibernava durante o treino, "Finalizar" caía no vazio

**Sintoma:** depois de ~1h com a tela de treino aberta, "Finalizar treino" às vezes falhava.
**Causa:** Render (free tier) hiberna o backend depois de ~15min sem receber requisição — e durante o preenchimento de um treino longo, nenhuma chamada de rede acontecia até finalizar.
**Fix:** heartbeat — ping silencioso pro `/api/auth/status` a cada 4 minutos enquanto a tela de treino está aberta, mantendo o Render e a conexão com o Turso vivos. Commit `47d81c4`. (Complementar ao autosave abaixo — resolvem janelas de falha diferentes.)

## 2026-07-07 — `apple-touch-icon` não atualizava no iOS (cache)

**Sintoma:** ícone antigo continuava aparecendo na tela de início mesmo depois de trocar o arquivo.
**Causa:** iOS mantém cache próprio do ícone, por URL exata — não refaz o fetch só porque o arquivo mudou no servidor.
**Fix:** query string de versão (`?v=2`) na URL do ícone, forçando o Safari a tratar como recurso novo. Commit `7f7e165`.

## 2026-07-07 — Favicon/apple-touch-icon apontavam pra caminho inexistente

**Sintoma:** ícone/favicon nunca carregavam em produção (404 silencioso).
**Causa:** `index.html` referenciava `/docs/IMG/...`, mas `docs/` já é a própria raiz do site publicado — o caminho duplicava o prefixo e nunca existia de verdade.
**Fix:** trocado pra `/IMG/...`. Commit `96d3ade`.

## (data exata não registrada, antes de 2026-07-07) — Perda de dados digitados em treinos longos

**Sintoma:** ficar ~1h com a tela de treino aberta (duração típica de um treino) e perder peso/reps já digitados se o app fosse fechado antes de clicar "Finalizar".
**Causa:** nada persistia os dados localmente durante o preenchimento — só a chamada final de "Finalizar" gravava algo.
**Fix:** autosave a cada 30s (`salvarEstadoLocal`) gravando o progresso no `localStorage`, com lógica de retomar (`carregarEstadoLocal`/`restaurarEstado`) ao reabrir o mesmo treino. Introduzido durante/logo após a migração pra Vue, antes do heartbeat (que resolve um problema relacionado mas diferente — ver 07/07 acima).
