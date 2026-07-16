import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/login',
        component: () => import('@/views/LoginView.vue')
    },
        {
        path: '/registro',
        component: () => import('@/views/RegisterView.vue')
    },
    {
        path: '/',
        component: () => import('@/views/HomeView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/treino',
        component: () => import('@/views/TreinoView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/cadastro',
        component: () => import('@/views/CadTreinoView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/evolucao',
        component: () => import('@/views/EvolucaoView.vue'),
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*',redirect: '/'}
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
        const auth = useAuthStore()
        await auth.verificar()
        if (!auth.autenticado) return '/login'
    }
})

export default router