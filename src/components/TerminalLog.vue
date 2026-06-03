<template>
    <div v-if="logs.length > 0" id="terminal-logs">
        <div
            v-for="log in logs"
            :key="log.id"
            :class="['terminal-log-message', log.type]">

            <span class="log-time">[{{ log.time }}]</span>]
            <span class="log-text">&gt; {{ log.message }}</span>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'termianlLog',

        props: {
            logs: {
                type: Array,
                default: () => []
            }
        }
    }
</script>
 