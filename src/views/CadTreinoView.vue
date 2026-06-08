<template>
    <nav class="navbar navbar-dark">
        <div class="container d-flex justify-content-between align-items-center">
           <a class="navbar-brand fw-bold" href="#" @click.prevent="$router.push('/')">&lt; voltar</a>
           <span class="fw-bold terminal-command">&lt;/&gt; Hackeando seu Treino</span>
           <button @click="fazerLogout" class="btn btn-sm btn-outline-danger terminal-command">
                logout
           </button>   
        </div>
    </nav>

    <div class="container my-5">
        <h2 class="text-center mb-4 terminal-command">novo_treino</h2>

        <div class="mb-3">
            <label class="form-label terminal-prompt">Nome do treino</label>
            <input type="text" v-model="nomeTreino" class="form-control">
        </div>

        <div
            v-for="(ex, i) in exerciciosAdicionados"
            :key="i"
            class="alert alert-success">
            ✅ {{ ex.nome }} ({{ ex.tipo === 'isometrico' ? '⏱️ Isométrico' : '🏋️ Normal' }})
        </div>

        <div v-if="adicionando" class="card p-3 mb-3">
            <div class="mb-2">
                <label class="form-label terminal-prompt">Nome do exercício</label>
                <input type="text" v-model="novoExercicio.nome" class="form-control" placeholder="Nome do exercício">
            </div>

            <div class="mb-3">
                <label class="form-label fw-semibold terminal-prompt">Tipo</label><br>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" v-model="novoExercicio.tipo" value="normal">
                    <label class="form-check-label">Normal (reps)</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" v-model="novoExercicio.tipo" value="isometrico">
                    <label class="form-check-label">Isométrico (seg)</label>
                </div>
            </div>

            <button @click="confirmarExercicio" class="btn btn-success btn-sm terminal-command">
                confirmar_exercicio
            </button>
        </div>

        <button 
            v-if="!adicionando"
            @click="adicionando = true"
            class="btn btn-primary my-4 terminal-command">
            adicionar_exercicio
        </button>

        <div v-if="exerciciosAdicionados.length > 0" class="text-center mt-3">
            <button
                @click="salvarTreino"
                :disabled="salvando"
                class="btn btn-success btn-lg terminal-command">
                {{ salvando ?  '$ salvando...' : 'salvar_treino' }}
            </button>
        </div>
    </div>

    <TerminalLog :logs="logs" />
</template>

<script>
import { apiFetch } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useTerminal } from '@/composables/useTerminal'
import TerminalLog from '@/components/TerminalLog.vue'

export default {
    name: 'CadTreinoView',
    components: { TerminalLog },

    setup() {
        const { logs, showSuccess, showError } = useTerminal()
        return { logs, showSuccess, showError }
    },

    data() {
        return {
            nomeTreino: '',
            exerciciosAdicionados: [],
            adicionando: false,
            novoExercicio: { nome: '', tipo: 'normal' },
            salvando: false
        }
    },

    methods: {
        confirmarExercicio() {
            if (!this.novoExercicio.nome.trim()) {
                this.showError('DIgite o nome do exercicio!')
                return
            }

            this.exerciciosAdicionados.push({
                nome: this.novoExercicio.nome.trim(),
                tipo: this.novoExercicio.tipo
            })

            this.novoExercicio = { nome: '', tipo: 'normal' }
            this.adicionando = false
        },

        async salvarTreino(){
            if(!this.nomeTreino.trim()) {
                this.showError('DIgite o nome do treino!')
                return 
            }

            this.salvando = true

            try {
                const res = await apiFetch('/api/treinos' , {
                    method: 'POST',
                    body: JSON.stringify({
                       nome: this.nomeTreino.trim(),
                       exercicios: this.exerciciosAdicionados
                    })
                })

                if(!res.ok) throw new Error('Erro ao salvar treino')

                this.showSuccess(`Treino "${this.nomeTreino}" criado com sucesso!`)
                setTimeout(() => this.$router.push('/'), 1500)
            } catch (e) {
                this.showError('Erro ao salvar treino: ' + e.message)
                this.salvando = false
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