/* =========================
   Dashboard de Evolução
========================= */

let dadosDashboard = null;
let anoAtual = new Date().getFullYear();
let mesAtual = new Date().getMonth(); // 0-indexed

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

async function carregarDashboard() {
  try {
    const resposta = await apiFetch('/api/evolucao/dashboard');
    const data = await resposta.json();
    dadosDashboard = data;

    // Stats
    document.getElementById('stat-streak').textContent = data.streak_atual ?? 0;
    document.getElementById('stat-total').textContent = data.total_treinos ?? 0;
    document.getElementById('stat-volume').textContent =
      data.volume_total_geral ? Math.round(data.volume_total_geral).toLocaleString('pt-BR') : '0';

    // Calendário
    renderizarCalendario(anoAtual, mesAtual);

    // Gráfico SVG
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
  const prefixo = `${String(ano).padStart(4, '0')}-${String(mes + 1).padStart(2, '0')}`;
  const diasTreinados = {};
  if (dadosDashboard && Array.isArray(dadosDashboard.dias_treinados)) {
    dadosDashboard.dias_treinados.forEach(d => {
      if (d && d.dia && d.dia.startsWith(prefixo)) {
        const dia = parseInt(d.dia.split('-')[2], 10);
        diasTreinados[dia] = d.treinos;
      }
    });
  }

  // Primeiro dia da semana — ajustar para Seg=0, Dom=6
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const offsetSeg = primeiroDia === 0 ? 6 : primeiroDia - 1;
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

    const dataStr = `${String(ano).padStart(4, '0')}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    if (diasTreinados[d]) {
      cell.classList.add('dia-treinado');
      cell.title = diasTreinados[d];
    }
    if (dataStr === hoje) {
      cell.classList.add('dia-hoje');
    }

    cal.appendChild(cell);
  }

  document.getElementById('dias-no-mes').textContent = Object.keys(diasTreinados).length;
}

function renderizarGrafico(volumeHistorico) {
  const container = document.getElementById('grafico-container');

  if (!volumeHistorico || volumeHistorico.length === 0) {
    container.style.display = 'none';
    document.getElementById('grafico-vazio').style.display = 'block';
    return;
  }

  const W = container.clientWidth || 320;
  const H = container.clientHeight || 240;
  const PAD = { top: 12, right: 14, bottom: 52, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const n = volumeHistorico.length;
  const values = volumeHistorico.map(d => d.volume_dia);
  const maxV = Math.max(...values);
  const scale = maxV > 0 ? maxV * 1.1 : 1;

  // Mapear pontos para coordenadas SVG
  const pts = volumeHistorico.map((d, i) => {
    const x = PAD.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW);
    const y = PAD.top + cH - (d.volume_dia / scale) * cH;
    return { x, y, label: d.dia.slice(5).replace('-', '/'), value: d.volume_dia };
  });

  const baseY = PAD.top + cH;
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPath = linePath
    + ` L${pts[pts.length - 1].x.toFixed(1)},${baseY} L${PAD.left},${baseY} Z`;

  // Eixo Y: 4 divisões
  const yTicks = [0, 1, 2, 3, 4].map(i => ({
    y: PAD.top + cH - (i / 4) * cH,
    v: Math.round(scale * (i / 4))
  }));

  // Eixo X: máximo 5 labels espaçadas
  const maxXLabels = Math.min(n, 5);
  const xIdxs = new Set(
    Array.from({ length: maxXLabels }, (_, i) =>
      Math.round(i * (n - 1) / (maxXLabels > 1 ? maxXLabels - 1 : 1))
    )
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible;display:block">
    <defs>
      <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00ff41" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#00ff41" stop-opacity="0.01"/>
      </linearGradient>
    </defs>

    ${yTicks.map(t =>
      `<line x1="${PAD.left}" y1="${t.y.toFixed(1)}" x2="${W - PAD.right}" y2="${t.y.toFixed(1)}" stroke="#00ff4118" stroke-width="1"/>`
    ).join('')}

    <path d="${fillPath}" fill="url(#vGrad)"/>
    <path d="${linePath}" fill="none" stroke="#00ff41" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>

    ${pts.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#00ff41" stroke="#0d0d0d" stroke-width="1.5">
        <title>${p.label}: ${Math.round(p.value).toLocaleString('pt-BR')} kg</title>
      </circle>`
    ).join('')}

    ${yTicks.map(t =>
      `<text x="${PAD.left - 6}" y="${(t.y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#00ff4199" font-family="monospace">${t.v.toLocaleString('pt-BR')}</text>`
    ).join('')}

    ${pts.filter((_, i) => xIdxs.has(i)).map(p =>
      `<text x="${p.x.toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="end" font-size="10" fill="#00ff4199" font-family="monospace"
        transform="rotate(-40,${p.x.toFixed(1)},${(baseY + 14).toFixed(1)})">${p.label}</text>`
    ).join('')}

    <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${baseY}" stroke="#00ff4140" stroke-width="1"/>
    <line x1="${PAD.left}" y1="${baseY}" x2="${W - PAD.right}" y2="${baseY}" stroke="#00ff4140" stroke-width="1"/>
  </svg>`;

  container.innerHTML = svg;
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
