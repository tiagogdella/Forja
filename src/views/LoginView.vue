<template>
    <div class="container">
        <div class="row justify-content-center align-itens-center" style="min-height: 100vh;">
            <div class="col-md-5 fundoDivLogin">
                <img src="/docs/IMG/apple-touch-icon.png" alt="Hackeando seu Treino" class="app-icon-header">
                <div class="card p-4 shadow-lg">

                    <pre class="ascii-logo text-center mb-3">╦ ╦┌─┐┌─┐┬┌─┌─┐┌─┐┌┐┌┌┬┐┌─┐  ┌─┐┌─┐┬ ┬  ╔╦╗┬─┐┌─┐┬┌┐┌┌─┐
╠═╣├─┤│  ├┴┐├┤ ├─┤│││ │││ │  └─┐├┤ │ │   ║ ├┬┘├┤ │││││ │
╩ ╩┴ ┴└─┘┴ ┴└─┘┴ ┴┘└┘─┴┘└─┘  └─┘└─┘└─┘   ╩ ┴└─└─┘┴┘└┘└─┘</pre>
                    
            <h3 class="text-center mb-4 terminal-command">$ login</h3>
                
            <form @submit.prevent="fazerLogin">

                <div class="mb-3">
                    <label class="form-label terminal-prompt">Username</label>
                    <input 
                        type="text"
                        v-model="username"
                        class="form-control"
                        required
                        autocomplete="username"
                        placeholder="seu_usuario">
                </div>

                <div class="mb-3">
                    <label class="form-label terminal-prompt">Senha</label>
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
                    class="btn btn-primary w-100 terminal-command"
                    :disabled="carregando">
                    {{ carregando ?  '$ autenticando...' : 'entrar' }}
                </button>
            </form>
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