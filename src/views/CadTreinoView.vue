<template>
    <nav class="navbar">
        <div class="container d-flex justify-content-between align-items-center">
           <a class="navbar-brand fw-bold" href="#" @click.prevent="$router.push('/')">&lt; Voltar</a>
           <span class="wordmark-group">
                <img src="/IMG/forja-mark.svg" alt="" class="wordmark-icon">
                <span class="wordmark">forja.</span>
           </span>
           <button @click="fazerLogout" class="btn btn-sm btn-outline-danger">
                Sair
           </button>
        </div>
    </nav>

    <div class="container my-5">
        <h2 class="text-center mb-4">Novo treino</h2>

        <div class="mb-3">
            <label class="form-label">Nome do treino</label>
            <input type="text" v-model="nomeTreino" class="form-control">
        </div>

        <div
            v-for="(ex, i) in exerciciosAdicionados"
            :key="i"
            class="alert alert-success">
            {{ ex.nome }} ({{ ex.tipo === 'isometrico' ? '⏱️ Isométrico' : '🏋️ Normal' }})
        </div>

        <div v-if="adicionando" class="card p-3 mb-3">
            <div class="mb-2">
                <label class="form-label">Nome do exercício</label>
                <input type="text" v-model="novoExercicio.nome" class="form-control" placeholder="Nome do exercício">
            </div>

            <div class="mb-3">
                <label class="form-label fw-semibold">Tipo</label><br>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" v-model="novoExercicio.tipo" value="normal">
                    <label class="form-check-label">Normal (reps)</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" v-model="novoExercicio.tipo" value="isometrico">
                    <label class="form-check-label">Isométrico (seg)</label>
                </div>
            </div>

            <button @click="confirmarExercicio" class="btn btn-primary btn-sm">
                Confirmar exercício
            </button>
        </div>

        <button
            v-if="!adicionando"
            @click="adicionando = true"
            class="btn btn-outline-secondary my-4">
            Adicionar exercício
        </button>

        <div v-if="exerciciosAdicionados.length > 0" class="text-center mt-3">
            <button
                @click="salvarTreino"
                :disabled="salvando"
                class="btn btn-primary btn-lg">
                {{ salvando ?  'Salvando...' : 'Salvar treino' }}
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
                this.showError('Digite o nome do exercício!')
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
                this.showError('Digite o nome do treino!')
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
