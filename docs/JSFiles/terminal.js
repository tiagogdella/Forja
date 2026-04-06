/**
 * Terminal Module - Hackeando seu Treino
 * Funções para efeitos de terminal: typewriter e logs
 */

// Container para logs (criado dinamicamente)
let logsContainer = null;

function initLogsContainer() {
  if (!logsContainer) {
    logsContainer = document.createElement('div');
    logsContainer.id = 'terminal-logs';
    document.body.appendChild(logsContainer);
  }
}

/**
 * Efeito de digitação (typewriter)
 * @param {HTMLElement} element - Elemento onde aplicar o efeito
 * @param {string} text - Texto a ser digitado
 * @param {number} speed - Velocidade em ms por caractere (default: 50ms)
 * @returns {Promise} - Promise que resolve quando a animação termina
 */
function typeWriter(element, text, speed = 50) {
  return new Promise((resolve) => {
    if (!element || !text) {
      resolve();
      return;
    }

    element.textContent = '';
    let i = 0;

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        requestAnimationFrame(() => {
          setTimeout(type, speed);
        });
      } else {
        resolve();
      }
    }

    type();
  });
}

/**
 * Exibe uma mensagem de log estilo terminal
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de log: 'success', 'error', 'info' (default: 'info')
 * @param {number} duration - Duração em ms antes de remover (default: 3000ms)
 */
function showLog(message, type = 'info', duration = 3000) {
  initLogsContainer();

  const logElement = document.createElement('div');
  logElement.className = `terminal-log-message ${type}`;

  const now = new Date();
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  logElement.innerHTML = `
    <span class="log-time">[${time}]</span>
    <span class="log-text">> ${message}</span>
  `;

  logsContainer.appendChild(logElement);

  setTimeout(() => {
    logElement.style.opacity = '0';
    setTimeout(() => {
      if (logElement.parentNode) {
        logElement.parentNode.removeChild(logElement);
      }
    }, 300);
  }, duration);
}

function showSuccess(message) {
  showLog(message, 'success', 3000);
}

function showError(message) {
  showLog(message, 'error', 4000);
}

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogsContainer);
} else {
  initLogsContainer();
}

// Exportar funções para uso global (window)
window.Terminal = {
  typeWriter,
  showLog,
  showSuccess,
  showError,
};
