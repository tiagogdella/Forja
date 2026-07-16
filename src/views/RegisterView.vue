<template>
    <div class="container">
        <div class="row justify-content-center align-itens-center" style="min-height: 100vh;">
            <div class="col-md-5 fundoDivLogin">

                <img src="/IMG/forja-icon-dark.svg" alt="forja" class="app-icon-tile mb-3" width="64" height="64">
                <h1 class="wordmark text-center mb-1">forja.</h1>
                <p class="text-center mb-4" style="color: var(--muted);">bora criar sua conta?</p>

                <div class="card p-4">

            <form @submit.prevent="fazerRegistro">

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
                    <label class="form-label">Nome completo (opcional)</label>
                    <input
                        type="text"
                        v-model="nomeCompleto"
                        class="form-control"
                        autocomplete="name"
                        placeholder="seu nome">
                </div>

                <div class="mb-3">
                    <label class="form-label">Senha</label>
                    <input
                        type="password"
                        v-model="senha"
                        class="form-control"
                        required
                        autocomplete="new-password"
                        placeholder="********">
                </div>

                <div class="mb-3">
                    <label class="form-label">Confirmar senha</label>
                    <input
                        type="password"
                        v-model="confirmarSenha"
                        class="form-control"
                        required
                        autocomplete="new-password"
                        placeholder="********">
                </div>

                <button
                    type="submit"
                    class="btn btn-primary w-100"
                    :disabled="carregando">
                    {{ carregando ? 'Criando conta...' : 'Criar conta' }}
                </button>
            </form>

            <p class="text-center mt-3 pt-3" style="border-top: 1px solid var(--line); color: var(--muted);">
                Já tem conta?
                <router-link to="/login" style="color: var(--accent); font-weight: 600;">Entrar</router-link>
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
    name: 'registerView',

    components: { TerminalLog },

    setup() {
        const { logs, showSuccess, showError } = useTerminal()
        return { logs, showSuccess, showError }
    },

    data() {
        return {
            username: '',
            nomeCompleto: '',
            senha: '',
            confirmarSenha: '',
            carregando: false
        }
    },

    methods: {
        async fazerRegistro() {
            if (this.username.length < 3) {
                this.showError('Username deve ter no mínimo 3 caracteres')
                return
            }

            if (this.senha.length < 6) {
                this.showError('Senha deve ter no mínimo 6 caracteres')
                return
            }

            if (this.senha !== this.confirmarSenha) {
                this.showError('As senhas não são iguais')
                return
            }

            this.carregando = true

            try {
                const res = await apiFetch('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        password: this.senha,
                        nome_completo: this.nomeCompleto || null
                    })
                })

                const dados = await res.json()

                if (!res.ok) {
                    this.showError(dados.erro || 'Erro ao criar conta')
                    return
                }

                const auth = useAuthStore()
                auth.autenticado = true
                auth.usuario = dados.usuario

                this.showSuccess(`Conta criada, bem-vindo ${dados.usuario.username}!`)

                setTimeout(() => this.$router.push('/'), 1000)

            } catch (e) {
                this.showError('Erro de conexão: ' + e.message)
            } finally {
                this.carregando = false
            }
        }
    }
}
</script>

