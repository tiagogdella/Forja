import { defineStore } from "pinia";
import { apiFetch } from "../services/api"; 

export const useAuthStore = defineStore('auth', {

    state: () => ({
        usuario: null,
        autenticado: false
    }),

    actions: {
        async verificar() {
            try {
                const res = await apiFetch('/api/auth/status')
                const dados = await res.json()
                this.autenticado = dados.autenticado
                this.usuario = dados.usuario || null   
            } catch (e) {
                this.autenticado = false
                this.usuario = null
            }
        },

        async logout() {
            try {
                await apiFetch('/api/auth/logout', {method: 'post'})
            } catch (e) {/*Ignoring the net error*/}
            this.autenticado = false
            this.usuario = null
        }
    }
})