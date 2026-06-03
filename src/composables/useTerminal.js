import { ref } from 'vue'

export function useTerminal() {
    const logs = ref ([])

    function showLog(message, type = 'info', duration = 3000){
        const now = new Date()
        const time = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        })

        const id = Date.now() + Math.random()
        logs.value.push({id, message, type, time})

        setTimeout(()=> {
            logs.value = logs.value.filter(l => l.id !== id)
        }, duration)
    }

    function showSuccess(message) {showLog(message, 'success', 3000)}
    function showError(message) {showLog(message, 'error', 4000)}

    return {logs, showLog, showSuccess, showError}
}