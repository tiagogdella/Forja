<template>
  <nav class="navbar navbar-dark">
    <div class="container position-relative">
      <button
        @click="fazerLogout"
        class="btn btn-sm btn-outline-danger terminal-command position-absolute end-0 top-50 translate-middle-y"
        style="z-index: 10; min-height: 44px;">
        logout
      </button>
      <div class="w-100 text-center">
        <pre class="ascii-logo mb-2">╦ ╦┌─┐┌─┐┬┌─┌─┐┌─┐┌┐┌┌┬┐┌─┐  ┌─┐┌─┐┬ ┬  ╔╦╗┬─┐┌─┐┬┌┐┌┌─┐
╠═╣├─┤│  ├┴┐├┤ ├─┤│││ │││ │  └─┐├┤ │ │   ║ ├┬┘├┤ │││││ │
╩ ╩┴ ┴└─┘┴ ┴└─┘┴ ┴┘└┘─┴┘└─┘  └─┘└─┘└─┘   ╩ ┴└─└─┘┴┘└┘└─┘</pre>
        <a class="navbar-brand fw-bold d-block" href="#">&lt;/&gt; Hackeando seu Treino</a>
      </div>
    </div>
  </nav>

  <div class="container my-4 px-3">
    <h2 class="text-center mb-4 terminal-command" style="font-size: clamp(1rem, 5vw, 1.5rem);">
      Dashboard de Evolução
    </h2>

    <!-- Cards de estatísticas -->
    <div class="row g-2 mb-4">
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value">{{ dados ? dados.streak_atual ?? 0 : '--' }}</div>
          <div class="stat-label">dias seguidos</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value">{{ dados ? dados.total_treinos ?? 0 : '--' }}</div>
          <div class="stat-label">treinos feitos</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value">{{ progressaoMedia }}</div>
          <div class="stat-label">prog. média</div>
        </div>
      </div>
    </div>

    <!-- Calendário -->
    <div class="mb-5">
      <h5 class="terminal-command mb-3" style="font-size: clamp(0.85rem, 4vw, 1.1rem);">
        Calendário de Treinos
      </h5>
      <div class="d-flex align-items-center justify-content-between mb-3 gap-2">
        <button @click="mesAnterior" class="btn btn-outline-success terminal-command btn-nav-mes">
          &lt; prev
        </button>
        <span class="terminal-prompt fw-bold text-center" style="font-size: clamp(0.85rem, 4vw, 1rem);">
          {{ labelMes }}
        </span>
        <button @click="proximoMes" class="btn btn-outline-success terminal-command btn-nav-mes">
          next &gt;
        </button>
      </div>

      <!-- Cabeçalho dos dias da semana -->
      <div class="calendario-grid mb-1">
        <div class="cal-header" v-for="dia in ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']" :key="dia">
          {{ dia }}
        </div>
      </div>

      <!-- Dias do mês -->
      <div class="calendario-grid">
        <div v-for="(cell, i) in celulasCalendario" :key="i"
          :class="['cal-dia', cell.treinado ? 'dia-treinado' : '', cell.hoje ? 'dia-hoje' : '']">
          {{ cell.dia || '' }}
        </div>
      </div>

      <p class="text-end mt-2 mb-0" style="font-size: 0.8rem; color: #00ff4199;">
        Treinado: <span class="text-success fw-bold">{{ diasTreinadosNoMes }}</span> dias
      </p>
    </div>

    <!-- Gráfico de volume -->
    <div class="mb-5">
      <h5 class="terminal-command mb-1" style="font-size: clamp(0.85rem, 4vw, 1.1rem);">
        Volume Total Acumulado
      </h5>
      <p style="font-size: 0.75rem; color: #00ff4199;" class="mb-3">últimos 90 dias</p>

      <div v-if="dados && dados.volume_historico && dados.volume_historico.length > 0"
        id="grafico-container"
        v-html="svgGrafico">
      </div>
      <p v-else class="text-center mt-3" style="color: #00ff4199; font-size: 0.85rem;">
        Nenhum treino finalizado nos últimos 90 dias.
      </p>
    </div>

    <div class="text-center mb-5">
      <a href="#" @click.prevent="$router.push('/')"
        class="btn btn-outline-secondary terminal-command"
        style="min-height: 44px; display: inline-flex; align-items: center;">
        &lt; voltar_para_treinos
      </a>
    </div>
  </div>

  <TerminalLog :logs="logs" />
</template>

<script>
import { apiFetch } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useTerminal } from '@/composables/useTerminal'
import TerminalLog from '@/components/TerminalLog.vue'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default {
  name: 'EvolucaoView',
  components: { TerminalLog },

  setup() {
    const { logs, showError } = useTerminal()
    return { logs, showError }
  },

  data() {
    return {
      dados: null,
      anoAtual: new Date().getFullYear(),
      mesAtual: new Date().getMonth()
    }
  },

  computed: {
    // Computed são valores calculados automaticamente quando o estado muda
    progressaoMedia() {
      if (!this.dados) return '--'
      const p = this.dados.progressao_media
      if (p == null) return '--'
      return `${p >= 0 ? '+' : ''}${p}%`
    },

    labelMes() {
      return `${MESES[this.mesAtual]} ${this.anoAtual}`
    },

    celulasCalendario() {
      if (!this.dados) return []
      const hoje = new Date().toISOString().split('T')[0]
      const prefixo = `${this.anoAtual}-${String(this.mesAtual + 1).padStart(2, '0')}`

      const diasTreinados = {}
      if (Array.isArray(this.dados.dias_treinados)) {
        this.dados.dias_treinados.forEach(d => {
          if (d?.dia?.startsWith(prefixo)) {
            diasTreinados[parseInt(d.dia.split('-')[2])] = true
          }
        })
      }

      const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay()
      const offset = primeiroDia === 0 ? 6 : primeiroDia - 1
      const diasNoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate()

      const celulas = []
      for (let i = 0; i < offset; i++) celulas.push({ dia: null })
      for (let d = 1; d <= diasNoMes; d++) {
        const dataStr = `${this.anoAtual}-${String(this.mesAtual + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        celulas.push({ dia: d, treinado: !!diasTreinados[d], hoje: dataStr === hoje })
      }
      return celulas
    },

    diasTreinadosNoMes() {
      return this.celulasCalendario.filter(c => c.treinado).length
    },

    svgGrafico() {
      const data = this.dados?.volume_historico
      if (!data || data.length === 0) return ''

      const W = 320, H = 240
      const PAD = { top: 12, right: 14, bottom: 52, left: 60 }
      const cW = W - PAD.left - PAD.right
      const cH = H - PAD.top - PAD.bottom
      const n = data.length
      const values = data.map(d => d.volume_dia)
      const maxV = Math.max(...values)
      const scale = maxV > 0 ? maxV * 1.1 : 1

      const pts = data.map((d, i) => ({
        x: PAD.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW),
        y: PAD.top + cH - (d.volume_dia / scale) * cH,
        label: d.dia.slice(5).replace('-', '/'),
        value: d.volume_dia
      }))

      const baseY = PAD.top + cH
      const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      const fillPath = linePath + ` L${pts[pts.length-1].x.toFixed(1)},${baseY} L${PAD.left},${baseY} Z`
      const yTicks = [0,1,2,3,4].map(i => ({ y: PAD.top + cH - (i/4)*cH, v: Math.round(scale*(i/4)) }))
      const maxX = Math.min(n, 5)
      const xIdxs = new Set(Array.from({ length: maxX }, (_, i) => Math.round(i*(n-1)/(maxX>1?maxX-1:1))))

      return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;display:block">
        <defs><linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00ff41" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#00ff41" stop-opacity="0.01"/>
        </linearGradient></defs>
        ${yTicks.map(t => `<line x1="${PAD.left}" y1="${t.y.toFixed(1)}" x2="${W-PAD.right}" y2="${t.y.toFixed(1)}" stroke="#00ff4118" stroke-width="1"/>`).join('')}
        <path d="${fillPath}" fill="url(#vGrad)"/>
        <path d="${linePath}" fill="none" stroke="#00ff41" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#00ff41" stroke="#0d0d0d" stroke-width="1.5"><title>${p.label}: ${Math.round(p.value).toLocaleString('pt-BR')} kg</title></circle>`).join('')}
        ${yTicks.map(t => `<text x="${PAD.left-6}" y="${(t.y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="#00ff4199" font-family="monospace">${t.v.toLocaleString('pt-BR')}</text>`).join('')}
        ${pts.filter((_,i) => xIdxs.has(i)).map(p => `<text x="${p.x.toFixed(1)}" y="${(baseY+14).toFixed(1)}" text-anchor="end" font-size="10" fill="#00ff4199" font-family="monospace" transform="rotate(-40,${p.x.toFixed(1)},${(baseY+14).toFixed(1)})">${p.label}</text>`).join('')}
        <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${baseY}" stroke="#00ff4140" stroke-width="1"/>
        <line x1="${PAD.left}" y1="${baseY}" x2="${W-PAD.right}" y2="${baseY}" stroke="#00ff4140" stroke-width="1"/>
      </svg>`
    }
  },

  async mounted() {
    try {
      const res = await apiFetch('/api/evolucao/dashboard')
      this.dados = await res.json()
    } catch (e) {
      this.showError('Erro ao carregar dados: ' + e.message)
    }
  },

  methods: {
    mesAnterior() {
      if (this.mesAtual === 0) { this.mesAtual = 11; this.anoAtual-- }
      else this.mesAtual--
    },
    proximoMes() {
      if (this.mesAtual === 11) { this.mesAtual = 0; this.anoAtual++ }
      else this.mesAtual++
    },
    async fazerLogout() {
      const auth = useAuthStore()
      await auth.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.stat-card {
  border: 1px solid #00ff4133;
  background-color: #0a0a0a;
  border-radius: 8px;
  padding: 0.9rem 0.5rem;
  text-align: center;
}
.stat-value {
  font-size: clamp(1.2rem, 5.5vw, 2rem);
  font-weight: bold;
  color: #00ff41;
  font-family: monospace;
}
.stat-label {
  font-size: clamp(0.6rem, 2.5vw, 0.75rem);
  color: #00ff4199;
  font-family: monospace;
  margin-top: 4px;
}
.calendario-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  font-family: monospace;
}
.cal-header {
  text-align: center;
  font-size: clamp(0.6rem, 2.8vw, 0.75rem);
  color: #00ff4199;
  padding: 4px 0;
  font-weight: bold;
}
.cal-dia {
  text-align: center;
  font-size: clamp(0.75rem, 3.5vw, 0.9rem);
  border-radius: 6px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dia-treinado {
  background-color: rgba(0, 255, 65, 0.2);
  border: 1px solid #00ff41;
  color: #00ff41;
  font-weight: bold;
}
.dia-hoje { border: 1px solid rgba(255,255,255,0.35); }
.dia-treinado.dia-hoje { border: 2px solid #00ff41; background-color: rgba(0,255,65,0.3); }
.btn-nav-mes { min-height: 44px; min-width: 80px; font-size: 0.85rem; }
#grafico-container { position: relative; height: 240px; }
</style>
