<template>
    <nav class="navbar navbar-dark">
        <div class="container position-relative">
            <button
                @click="fazerLogout"
                class="btn btn-sm btn-outline-danger terminal-command position-absolute end-0 top-50 translate-middle-y"
                style="z-index: 10;">
                logout
            </button>
            <div class="w-100 text-center">
                <pre class="ascii-logo mb-2">╦ ╦┌─┐┌─┐┬┌─┌─┐┌─┐┌┐┌┌┬┐┌─┐  ┌─┐┌─┐┬ ┬  ╔╦╗┬─┐┌─┐┬┌┐┌┌─┐
╠═╣├─┤│  ├┴┐├┤ ├─┤│││ │││ │  └─┐├┤ │ │   ║ ├┬┘├┤ │││││ │
╩ ╩┴ ┴└─┘┴ ┴└─┘┴ ┴┘└┘─┴┘└─┘  └─┘└─┘└─┘   ╩ ┴└─└─┘┴┘└┘└─┘</pre>
            </div>
        </div>
    </nav>

    <div class="container my-5">
        <h2 class="text-center mb-4 terminal-command">Lista de treinos</h2>

        <div v-if="treinos.length === 0" class="text-center" style="color: #00ff4199;">
            Nenhum treino cadastrado ainda.
        </div>

        <div v-else class="row g-4">
            <div class="col-md-4" v-for="treino in treinos" :key="treino.id">
                <div class="card p-3 text-center shadow">
                    <h5 class="mb-3">{{ treino.nome }}</h5>
                    
                    <p v-if="treino.total_execucoes === 0"
                        class="mb-3"
                        style="font-size: 0.82rem; color: var(--terminal-green-dark);">
                        Ainda não executado
                    </p>
                    <p v-else-if="treino.total_execucoes === 1"
                        class="mb-3"
                        style="font-size: 0.85rem; color: var(--terminal-green-dark);">
                        Executado 1x
                    </p>
                    <p v-else-if="treino.progressao !== null"
                        class="mb-2 terminal-command"
                        style="font-size: 0.85rem;">
                        Progressive_overload {{ treino.progressao >= 0 ? '+' : ''}}{{ treino.progressao }}%
                    </p>

                    <div class="d-flex gap-2 justify-content-center">
                        <button
                            @click="abrirTreino(treino.id)"
                            class="btn btn-primary btn-sm terminal-command flex-grow-1">
                            Treinar
                        </button>
                        <button
                            @click="renomearTreino(treino)"
                            class="btn btn-outline-warning btn-sm terminal-command">
                            ~
                        </button>
                        <button
                            @click="excluirTreino(treino)"
                            class="btn btn-danger btn-sm terminal-command">
                            x
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-5 text-center d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/cadastro" class="btn btn-primary terminal-command">
            Novo treino
        </router-link>
        <router-link to="/evolucao" class="btn btn-outline-success terminal-command">
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
            treinos: []
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
                this.showSucccess(`Treino renomeado para "${dados.nome}"`)
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
        }
    }
}
</script>
