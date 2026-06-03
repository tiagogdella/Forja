# 🗺️ Roadmap — Migração para Vue.js

**Projeto:** Hackeando seu Treino  
**Stack atual:** HTML/CSS/JS vanilla + Bootstrap 5 + Node.js/Express  
**Stack alvo:** Vue 3 + Vite + Vue Router + Pinia (estado global)

---

## Por que Vue.js?

| Problema atual | Solução Vue |
|---|---|
| `document.getElementById` em todo lugar | `v-model` vincula dados ao HTML automaticamente |
| `innerHTML +=` para renderizar listas | `v-for` renderiza listas reativas |
| Variáveis globais soltas (`let treino = null`) | `data()` centraliza o estado do componente |
| Múltiplos arquivos HTML separados | Vue Router: uma SPA com rotas |
| `btnFinalizar.disabled = true` manualmente | `:disabled="salvando"` reativo |

---

## Fase 0 — Preparação do ambiente ⚙️

> Objetivo: ter o projeto Vue rodando localmente sem quebrar o backend.

- [ ] Instalar dependências de desenvolvimento
  ```bash
  npm install -D vite @vitejs/plugin-vue
  npm install vue vue-router pinia
  ```
- [ ] Criar `vite.config.js` na raiz do projeto
  - Configurar `build.outDir: 'docs'` (mantém GitHub Pages funcionando)
  - Configurar proxy para `/api` apontar para backend local
- [ ] Adicionar scripts no `package.json`
  ```json
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
  ```
- [ ] Criar `index.html` na raiz (entry point do Vite)
- [ ] Criar ponto de entrada `src/main.js`

---

## Fase 1 — Infraestrutura Vue 🏗️

> Objetivo: migrar os utilitários globais para o padrão Vue.

### 1.1 — Serviço de API (`src/services/api.js`)
Substitui: `docs/JSFiles/config.js`

```js
// src/services/api.js
const API_URL = "https://hackeando-seu-treino.onrender.com"

export async function apiFetch(endpoint, options = {}) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers }
  })
}
```

### 1.2 — Store de autenticação (`src/stores/auth.js`)
Substitui: `docs/JSFiles/auth.js`  
Usa **Pinia** (gerenciador de estado oficial do Vue 3)

```js
// src/stores/auth.js
import { defineStore } from 'pinia'
import { apiFetch } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({ usuario: null, autenticado: false }),
  actions: {
    async verificar() { /* ... */ },
    async logout() { /* ... */ }
  }
})
```

### 1.3 — Composable Terminal (`src/composables/useTerminal.js`)
Substitui: `docs/JSFiles/terminal.js`

```js
// src/composables/useTerminal.js
export function useTerminal() {
  function showLog(message, type = 'info') { /* ... */ }
  function showSuccess(message) { showLog(message, 'success') }
  function showError(message) { showLog(message, 'error') }
  return { showLog, showSuccess, showError }
}
```

---

## Fase 2 — Roteamento 🛣️

> Objetivo: substituir os múltiplos arquivos HTML por uma SPA com rotas.

Substitui: navegação via `href="treino.html"`, `location.href = 'index.html'`

```
docs/login.html     →  /login      →  src/views/LoginView.vue
docs/index.html     →  /           →  src/views/HomeView.vue
docs/treino.html    →  /treino     →  src/views/TreinoView.vue
docs/cadTreino.html →  /cadastro   →  src/views/CadTreinoView.vue
docs/evolucao.html  →  /evolucao   →  src/views/EvolucaoView.vue
```

**Guard de rota** (substitui `verificarAutenticacao()` em cada página):
```js
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    await auth.verificar()
    if (!auth.autenticado) return '/login'
  }
})
```

---

## Fase 3 — Views (páginas) 📄

> Migrar cada HTML para um componente `.vue` com `<template>`, `<script>` e `<style>`.

### Estrutura de um componente `.vue`:
```vue
<template>
  <!-- HTML da página -->
</template>

<script>
export default {
  data() { return { /* estado */ } },
  methods: { /* funções */ },
  mounted() { /* equivalente ao "iniciarTreino()" */ }
}
</script>

<style scoped>
/* CSS específico do componente (opcional) */
</style>
```

### 3.1 `LoginView.vue`
- Form com `v-model` para username e senha
- Estado `carregando` controla o botão
- Redireciona via `router.push('/')`

### 3.2 `HomeView.vue`
- Lista de treinos com `v-for`
- Busca da API no `mounted()`
- Navegação para treino via `router.push('/treino')`

### 3.3 `TreinoView.vue` ⭐ (mais complexo)
- Estado reativo: `treino`, `execucaoId`, `salvando`
- `v-for` nos exercícios e nas séries
- `v-model` nos inputs de peso e reps
- Auto-save via `watch` (substitui `setInterval`)
- Sem mais `getElementById` na coleta dos dados

### 3.4 `CadTreinoView.vue`
- Form dinâmico para adicionar exercícios
- Lista reativa com add/remove

### 3.5 `EvolucaoView.vue`
- Exibição de gráficos/histórico

---

## Fase 4 — Componentes reutilizáveis 🧩

> Extrair partes repetidas em componentes próprios.

```
src/components/
├── NavBar.vue          # navbar com nome do treino + botão logout
├── ExercicioCard.vue   # card de um exercício com suas séries
├── SerieInput.vue      # linha de input peso + reps de uma série
└── TerminalLog.vue     # mensagens estilo terminal
```

**Exemplo — ExercicioCard.vue recebe props:**
```vue
<ExercicioCard
  v-for="(ex, i) in treino.exercicios"
  :key="ex.id"
  :exercicio="ex"
  :dadosUltimo="ultimoTreino[ex.id]"
  @update="salvarEstadoLocal"
/>
```

---

## Fase 5 — Deploy 🚀

> Manter GitHub Pages + backend Render funcionando.

- [ ] Confirmar `vite.config.js` com `base: './'` para GitHub Pages
- [ ] Adicionar `404.html` ou configurar SPA redirect no GitHub Pages
- [ ] Atualizar CORS no backend se necessário
- [ ] Testar build: `npm run build` → verificar pasta `docs/`
- [ ] Fazer push e verificar no GitHub Pages

---

## Estrutura de pastas final

```
TheBook/
├── backend/              # ← não muda
│   ├── server.js
│   └── routes/
├── docs/                 # ← gerado pelo: npm run build
├── src/                  # ← código Vue (novo)
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   └── auth.js
│   ├── services/
│   │   └── api.js
│   ├── composables/
│   │   └── useTerminal.js
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── HomeView.vue
│   │   ├── TreinoView.vue
│   │   ├── CadTreinoView.vue
│   │   └── EvolucaoView.vue
│   └── components/
│       ├── NavBar.vue
│       ├── ExercicioCard.vue
│       ├── SerieInput.vue
│       └── TerminalLog.vue
├── index.html            # entry point do Vite (raiz)
├── vite.config.js        # config do Vite
├── package.json
└── ROADMAP.md
```

---

## Conceitos Vue que você vai aprender em cada fase

| Fase | Conceitos |
|---|---|
| Fase 0 | Vite, estrutura de projeto |
| Fase 1 | `defineStore` (Pinia), composables, `export` |
| Fase 2 | `<router-view>`, `router.push()`, navigation guards |
| Fase 3 | `data()`, `methods`, `mounted()`, `v-model`, `v-for`, `v-if`, `:bind`, `@events` |
| Fase 4 | `props`, `emits`, componentes filhos |
| Fase 5 | Build, deploy, variáveis de ambiente (`.env`) |

---

## Por onde começar?

👉 **Fase 0** — rode os comandos de instalação e confirme que `npm run dev` abre o projeto no browser.  
Só avance para a Fase 1 quando isso estiver funcionando.
