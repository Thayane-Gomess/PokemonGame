import { slotManager } from "./slotManager.js";

// viewHandlers: callbacks fornecidos pelo controller
let viewHandlers = {};
// slotComponents: instâncias gerenciadas de cada slot (criarSlot)
const slotComponents = {};

// visualizador da arena
// responsabilidade: renderizar dom e delegar eventos para cada slot
function init(callbacks) {
  viewHandlers = callbacks || {};

  ["player1", "player2", "player3", "player4"].forEach((s) => {
    slotComponents[s] = slotManager.criarSlot(s);
    slotComponents[s]
      .on('onBuscar', viewHandlers.onBuscarPokemon || null)
      .on('onTrocar', viewHandlers.onTrocarPokemon || null)
      .on('onTentarNovamente', viewHandlers.onTentarNovamente || null);
  });

  document.querySelector('#btn-batalhar')?.addEventListener('click', () => {
    viewHandlers.onBatalhar?.();
  });

  // delegação para os botões "Pronto pra batalha" criados em renderShell
  const root = document.querySelector('#arena-root');
  if (root) {
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.trainer-ready-btn');
      if (!btn) return;
      const trainer = btn.dataset.trainer;
      viewHandlers.onToggleReady?.({ trainer });
    });
  }
}

function renderShell() {
  const root = document.querySelector('#arena-root');
  if (!root) return;

  root.innerHTML = `
    <section class="zona-batalha" aria-label="treinador 1">
      <h2 class="zona-batalha__titulo">treinador 1</h2>
      <div class="zona-batalha__cards">
        <div class="slot-wrapper" data-slot-container="player1"></div>
        <div class="slot-wrapper" data-slot-container="player2"></div>
      </div>
      <div class="zona-batalha__actions">
        <button class="btn-ui btn-ui--ok trainer-ready-btn" data-trainer="trainer1" type="button">Pronto pra batalha</button>
      </div>
    </section>

    <section class="zona-batalha" aria-label="treinador 2">
      <h2 class="zona-batalha__titulo zona-batalha__titulo--dois">treinador 2</h2>
      <div class="zona-batalha__cards">
        <div class="slot-wrapper" data-slot-container="player3"></div>
        <div class="slot-wrapper" data-slot-container="player4"></div>
      </div>
      <div class="zona-batalha__actions">
        <button class="btn-ui btn-ui--ok trainer-ready-btn" data-trainer="trainer2" type="button">Pronto pra batalha</button>
      </div>
    </section>
  `;
}

function render(estado) {
  ["player1", "player2", "player3", "player4"].forEach((s) => {
    slotComponents[s].renderizar(estado);
  });

  // atualizar botões de pronto por treinador
  const btn1 = document.querySelector('.trainer-ready-btn[data-trainer="trainer1"]');
  const btn2 = document.querySelector('.trainer-ready-btn[data-trainer="trainer2"]');
  if (btn1) {
    const ready = !!estado.trainers?.ready?.trainer1;
    const active = estado.trainers?.active === 'trainer1';
    btn1.disabled = ready || !active;
    btn1.textContent = ready ? 'PRONTO' : active ? 'Tudo pronto para a batalha' : 'Aguardando';
  }
  if (btn2) {
    const ready = !!estado.trainers?.ready?.trainer2;
    const active = estado.trainers?.active === 'trainer2';
    btn2.disabled = ready || !active;
    btn2.textContent = ready ? 'PRONTO' : active ? 'Tudo pronto para a batalha' : 'Aguardando';
  }
}

function renderBotaoBatalhar(ativo) {
  const btn = document.querySelector('#btn-batalhar');
  const hint = document.querySelector('#hint-batalha');
  if (!btn || !hint) return;

  btn.disabled = !ativo;
  btn.classList.toggle('is-visivel', ativo);
  hint.textContent = ativo
    ? 'Pront@s! Clique em BATALHAR para começar.'
    : 'Cada jogador deve preencher seus slots para liberar a batalha.';
}

// alerta global (toast) para mostrar mensagens de erro/aviso
function alerta({ mensagem, tipo }) {
  const el = document.querySelector('#toast');
  if (!el) return;

  el.classList.add('is-open');
  el.classList.toggle('toast--erro', tipo === 'erro');
  el.textContent = mensagem;

  clearTimeout(el.__t);
  el.__t = setTimeout(() => {
    el.classList.remove('is-open');
    el.classList.remove('toast--erro');
    el.textContent = '';
  }, 3000);
}

export const arenaView = { init, renderShell, render, renderBotaoBatalhar, alerta };
