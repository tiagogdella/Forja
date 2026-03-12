/* =========================
   Dashboard de Evolução
========================= */

let dadosDashboard = null;
let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth(); // 0-indexed
let graficoInstance = null;

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

async function carregarDashboard() {
  try {
    const data = await apiFetch('/api/evolucao/dashboard');
    dadosDashboard = data;

    // Stats
    document.getElementById('stat-streak').textContent = data.streak_atual;
    document.getElementById('stat-total').textContent = data.total_treinos;
    document.getElementById('stat-volume').textContent =
      data.volume_total_geral ? Math.round(data.volume_total_geral).toLocaleString('pt-BR') : '0';

    // Calendário
    renderizarCalendario(anoAtual, mesAtual);

    // Gráfico
    renderizarGrafico(data.volume_historico);
  } catch (err) {
    showError('Erro ao carregar dados de evolução: ' + err.message);
  }
}

function renderizarCalendario(ano, mes) {
  document.getElementById('label-mes').textContent = `${MESES[mes]} ${ano}`;

  const cal = document.getElementById('calendario');
  cal.innerHTML = '';

  const hoje = new Date().toISOString().split('T')[0];

  // Mapa de dias treinados neste mês
  const prefixo = `${String(ano).padStart(4,'0')}-${String(mes + 1).padStart(2,'0')}`;
  const diasTreinados = {};
  if (dadosDashboard) {
    dadosDashboard.dias_treinados.forEach(d => {
      if (d.dia.startsWith(prefixo)) {
        const dia = parseInt(d.dia.split('-')[2], 10);
        diasTreinados[dia] = d.treinos;
      }
    });
  }

  // Primeiro dia da semana (0=Dom ... 6=Sáb). Ajustar para Seg=0
  const primeiroDia = new Date(ano, mes, 1).getDay(); // 0=Dom
  const offsetSeg = (primeiroDia === 0) ? 6 : primeiroDia - 1; // Seg=0, Dom=6

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  // Células vazias antes do dia 1
  for (let i = 0; i < offsetSeg; i++) {
    const vazio = document.createElement('div');
    vazio.className = 'cal-dia cal-dia-vazio';
    cal.appendChild(vazio);
  }

  // Dias do mês
  for (let d = 1; d <= diasNoMes; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-dia';
    cell.textContent = d;

    const dataStr = `${String(ano).padStart(4,'0')}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    if (diasTreinados[d]) {
      cell.classList.add('dia-treinado');
      cell.title = diasTreinados[d];
    }
    if (dataStr === hoje) {
      cell.classList.add('dia-hoje');
    }

    cal.appendChild(cell);
  }

  // Contagem de dias treinados no mês
  document.getElementById('dias-no-mes').textContent = Object.keys(diasTreinados).length;
}

function renderizarGrafico(volumeHistorico) {
  const ctx = document.getElementById('grafico-volume').getContext('2d');

  if (!volumeHistorico || volumeHistorico.length === 0) {
    document.getElementById('grafico-container').style.display = 'none';
    document.getElementById('grafico-vazio').style.display = 'block';
    return;
  }

  if (graficoInstance) {
    graficoInstance.destroy();
  }

  const labels = volumeHistorico.map(d => {
    const partes = d.dia.split('-');
    return `${partes[2]}/${partes[1]}`;
  });
  const valores = volumeHistorico.map(d => d.volume_dia);

  graficoInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Volume (kg)',
        data: valores,
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0, 255, 65, 0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#00ff41',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#00ff41', font: { family: 'monospace' } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${Math.round(ctx.raw).toLocaleString('pt-BR')} kg`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#00ff4199', font: { family: 'monospace', size: 11 }, maxRotation: 45 },
          grid: { color: 'rgba(0, 255, 65, 0.08)' }
        },
        y: {
          ticks: {
            color: '#00ff4199',
            font: { family: 'monospace', size: 11 },
            callback: v => Math.round(v).toLocaleString('pt-BR')
          },
          grid: { color: 'rgba(0, 255, 65, 0.08)' }
        }
      }
    }
  });
}

// Navegação de meses
document.getElementById('btn-prev').addEventListener('click', () => {
  mesAtual--;
  if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
  renderizarCalendario(anoAtual, mesAtual);
});

document.getElementById('btn-next').addEventListener('click', () => {
  mesAtual++;
  if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
  renderizarCalendario(anoAtual, mesAtual);
});

// Inicia após autenticação
verificarAutenticacao().then(() => carregarDashboard());
