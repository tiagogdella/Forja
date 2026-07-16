<template>
    <div class="container">
        <div class="row justify-content-center align-itens-center" style="min-height: 100vh;">
            <div class="col-md-5 fundoDivLogin">

                <img src="/IMG/forja-icon-dark.svg" alt="forja" class="app-icon-tile mb-3" width="64" height="64">
                <h1 class="wordmark text-center mb-1">forja.</h1>
                <p class="text-center mb-4" style="color: var(--muted);">bora somar mais um disco?</p>

                <div class="card p-4">

            <form @submit.prevent="fazerLogin">

                <div class="mb-3">
                    <label class="form-label">Usuário</label>
                    <input
                        type="text"
                        v-model="username"
                        class="form-control"
                        required
                        autocomplete="username"
                        placeholder="seu usuário">
                </div>

                <div class="mb-3">
                    <label class="form-label">Senha</label>
                    <input
                        type="password"
                        v-model="senha"
                        class="form-control"
                        required
                        autocomplete="current-password"
                        placeholder="********">
                </div>

                <button
                    type="submit"
                    class="btn btn-primary w-100"
                    :disabled="carregando">
                    {{ carregando ?  'Entrando...' : 'Entrar' }}
                </button>
            </form>

            <p class="text-center mt-3 pt-3" style="border-top: 1px solid var(--line); color: var(--muted);">
                Ainda não tem conta?
                <router-link to="/registro" style="color: var(--accent); font-weight: 600;">Criar conta</router-link>
            </p>
            </div>
        </div>
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
    name: 'loginView',

    components: {TerminalLog},
    
    setup() {
        const { logs, showSuccess, showError } = useTerminal()
        return { logs, showSuccess, showError }
    },

    data() {
        return {
            username: '',
            senha: '',
            carregando: false, 
        }
    },

    methods: {
        async fazerLogin() {
            this.carregando = true

            try {
                const res = await apiFetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        password: this.senha
                    })
                })

                const dados = await res.json()

                if (!res.ok) {
                    this.showError(dados.erro || 'Erro ao fazer login')
                    return 
                }

                const auth = useAuthStore()
                auth.autenticado = true
                auth.usuario = dados.usuario

                this.showSuccess(`Bem-vindo, ${dados.usuario.username}!`)

                setTimeout(() => this.$router.push('/'),1000)

            } catch (e) {
                this.showError(`Erro de conexão: ` + e.message)
            } finally {
                this.carregando = false
            }
        }
    }
}
</script>