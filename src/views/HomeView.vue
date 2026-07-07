<template>
    <nav class="navbar">
        <div class="container d-flex justify-content-between align-items-center">
            <span class="wordmark-group">
                <img src="/IMG/forja-mark.svg" alt="" class="wordmark-icon">
                <span class="wordmark">forja.</span>
            </span>
            <button
                @click="fazerLogout"
                class="btn btn-sm btn-outline-danger">
                Sair
            </button>
        </div>
    </nav>

    <div class="container my-5">
        <h2 class="text-center mb-4">Seus treinos</h2>

        <div v-if="treinos.length === 0" class="text-center" style="color: var(--muted);">
            Nenhum treino cadastrado ainda.
        </div>

        <div v-else class="row g-4">
            <div class="col-md-4" v-for="treino in treinosOrdenados" :key="treino.id">
                <div :class="['card p-3 text-center', treino.ativo ? '' : 'card-inativo']">

                  <!-- Toggle no topo do card -->
                  <div class="d-flex align-items-center justify-content-end gap-2 mb-2">
                    <small style="color: var(--muted);">{{ treino.ativo ? 'Ativo' : 'Inativo' }}</small>
                    <div class="toggle-switch" @click="toggleAtivo(treino)">
                      <div :class="['toggle-track', treino.ativo ? 'on' : '']">
                        <div class="toggle-thumb"></div>
                      </div>
                    </div>
                  </div>
                  <h5 class="mb-3">{{  treino.nome }}</h5>

                    <div class="mb-3">
                        <span v-if="treino.total_execucoes === 0" class="chip chip-pendente">
                            Não executado
                        </span>
                        <span v-else class="chip chip-executado">
                            Executado {{ treino.total_execucoes }}×
                        </span>
                    </div>

                    <p v-if="treino.total_execucoes > 1 && treino.progressao !== null"
                        class="mb-2"
                        style="font-size: 0.85rem; font-family: var(--font-mono); font-weight: 600; color: var(--accent);">
                        {{ treino.progressao >= 0 ? '+' : ''}}{{ treino.progressao }}%
                    </p>

                    <div class="d-flex gap-2 justify-content-center">
                        <button
                            @click="abrirTreino(treino.id)"
                            class="btn btn-primary btn-sm flex-grow-1">
                            Treinar
                        </button>
                        <button
                            @click="renomearTreino(treino)"
                            class="btn btn-outline-secondary btn-sm">
                            Editar
                        </button>
                        <button
                            @click="excluirTreino(treino)"
                            class="btn btn-outline-danger btn-sm">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-5 text-center d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/cadastro" class="btn btn-primary">
            Novo treino
        </router-link>
        <router-link to="/evolucao" class="btn btn-outline-secondary">
            Ver evolução
        </router-link>
    </div>

    <TerminalLog :logs="logs" />
</template>

<script>
import { apiFetch } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useTerminal } from '@/composables/useTerminal'
import TerminalLog from '@/components/TerminalLog.vue'

export default {
    name: 'HomeView',

    components : { TerminalLog },

    setup() {
        const { logs, showSuccess, showError } = useTerminal()
        return { logs, showSuccess, showError }
    },

    data() {
        return {
            treinos: [],
        }
    },

    computed: {
        treinosOrdenados() {
            return  [...this.treinos].sort((a, b) => b.ativo - a.ativo)
            }

    },

    async mounted() {
        await this.carregarTreinos()
    },

    methods: {
        async carregarTreinos() {
            try {
                const res = await apiFetch('/api/treinos')
                const lista = await res.json()

                for(const treino of lista) {
                    try {
                        const resP = await apiFetch(`/api/treinos/${treino.id}/progressao`)
                        const progressao = await resP.json()
                        treino.progressao = progressao.progresso_percentual
                    } catch (e) {
                        treino.progressao = null
                    }
                }

                this.treinos = lista
            } catch (e) {
                this.showError('Error ao carregar treinos: ' + e.message)
            }
        },

        abrirTreino(treinoId) {
            localStorage.setItem('treinoSelecionado', treinoId)
            this.$router.push('/treino')
        },

        async renomearTreino(treino){
            const novoNome = prompt(`Novo nome para "${treino.nome}":`, treino.nome)
            if (!novoNome || novoNome.trim() === '' || novoNome.trim() === treino.nome) return

            try{
                const res = await apiFetch(`/api/treinos/${treino.id}`, {
                   method: 'PATCH',
                   body: JSON.stringify({ nome: novoNome.trim() })
                })
                const dados = await res.json()
                if(!res.ok) {
                    this.showError(dados.erro || 'Erro ao renomear')
                    return
                }
                this.showSuccess(`Treino renomeado para "${dados.nome}"`)
                await this.carregarTreinos()
            } catch (e) {
                this.showError('Erro ao renomear: ' + e.message)
            }
        },

        async excluirTreino(treino){
            if(!confirm(`Tem certeza que deseja excluir "${treino.nome}"?\n\nIsso vai apagar TODAS as execuções permanentemente!`)) return

            try {
                const res = await apiFetch(`/api/treinos/${treino.id}` , {method: 'DELETE'})
                const dados = await res.json()
                if(!res.ok){
                    this.showError(dados.erro || 'Erro ao excluir')
                    return
                }
                this.showSuccess(`Treino "${treino.nome}" excluído`)
                await this.carregarTreinos()
            } catch (e) {
                this.showError('Erro ao excluir: ' + e.message)
            }
        },
        async fazerLogout() {
            const auth = useAuthStore()
            await auth.logout()
            this.$router.push('/login')
        },

        async toggleAtivo(treino) {
           treino.ativo = treino.ativo ? 0 : 1
             await apiFetch(`/api/treinos/${treino.id}/ativo`, {
               method: 'PATCH',
               body: JSON.stringify({ ativo: treino.ativo })
             })
        },
    }
}
</script>

<style>
.card-inativo {
    opacity: 0.55;
}

.toggle-switch {
    cursor: pointer;
}

.toggle-track {
    width: 42px;
    height: 24px;
    background-color: var(--line);
    border-radius: 24px;
    position: relative;
    transition: background-color 0.25s;
}
.toggle-track.on {
  background-color: var(--accent);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
}

.toggle-track.on .toggle-thumb {
  transform: translateX(18px);
}

</style>
