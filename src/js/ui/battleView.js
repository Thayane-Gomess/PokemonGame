/**
 * battleView.js (2v2 PRO)
 * UI profissional + suporte a times 2x2
 */

let onBatalhaFinalizada = null;

const TYPE_COLORS = {
  fire: "#FF6B35",
  water: "#4A90D9",
  grass: "#48A14D",
  electric: "#F7D02C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
  normal: "#A8A878",
};

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const hpBarColor = (p) => (p > 50 ? "#4ade80" : p > 25 ? "#facc15" : "#f87171");

function renderTypesBadges(types) {
  return (types || [])
    .map((t) => {
      const c = TYPE_COLORS[t] || "#A8A878";
      return `<span class="battle-type-badge" style="background:${c}">${t}</span>`;
    })
    .join("");
}

const getAtivos = (estado) => ({
  p1: estado.time1[estado.ativos[1]],
  p2: estado.time2[estado.ativos[2]],
});

function open(estados, onFinalizada) {
  onBatalhaFinalizada = onFinalizada || null;

  const root = document.querySelector("#modal-root");
  if (!root) return;

  const { p1, p2 } = getAtivos(estados[0]);

  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  root.innerHTML = `
  <section class="battle-screen">

    <div class="battle-header">
      <h2 class="battle-title">⚔️ BATALHA!</h2>
    </div>

    <div class="battle-field">

      <!-- P1 -->
      <div class="battle-combatant battle-combatant--p1" id="combatant-p1">
        <div class="battle-combatant__info">
          <div class="battle-combatant__name-row">
            <span class="battle-combatant__name">${capitalize(p1.name)}</span>
            <span class="battle-combatant__level">Nv.50</span>
          </div>
          <div class="battle-combatant__types">${renderTypesBadges(p1.types)}</div>

          <div class="battle-hp-bar-container">
            <div class="battle-hp-label">
              <span>HP</span>
              <span id="hp-text-p1">${p1.hp}/${p1.maxHp}</span>
            </div>
            <div class="battle-hp-track">
              <div id="hp-fill-p1" class="battle-hp-fill"></div>
            </div>
          </div>
        </div>

        <div class="battle-combatant__sprite-wrapper">
          <img id="sprite-p1" class="battle-sprite battle-sprite--p1" src="${p1.sprite}">
        </div>
      </div>

      <!-- VS -->
      <div class="battle-vs">
        <span class="battle-vs__text">VS</span>
        <div class="battle-turn-indicator">
          <span id="turn-text">Turno 1</span>
        </div>
      </div>

      <!-- P2 -->
      <div class="battle-combatant battle-combatant--p2" id="combatant-p2">
        <div class="battle-combatant__info">
          <div class="battle-combatant__name-row">
            <span class="battle-combatant__name">${capitalize(p2.name)}</span>
            <span class="battle-combatant__level">Nv.50</span>
          </div>
          <div class="battle-combatant__types">${renderTypesBadges(p2.types)}</div>

          <div class="battle-hp-bar-container">
            <div class="battle-hp-label">
              <span>HP</span>
              <span id="hp-text-p2">${p2.hp}/${p2.maxHp}</span>
            </div>
            <div class="battle-hp-track">
              <div id="hp-fill-p2" class="battle-hp-fill"></div>
            </div>
          </div>
        </div>

        <div class="battle-combatant__sprite-wrapper">
          <img id="sprite-p2" class="battle-sprite battle-sprite--p2" src="${p2.sprite}">
        </div>
      </div>

    </div>

    <div class="battle-log-container">
      <div id="battle-log" class="battle-log">
        <p class="battle-log__entry battle-log__entry--system">A batalha começou!</p>
      </div>
    </div>

    <div class="battle-controls">
      <button id="btn-next" class="btn-battle btn-battle--attack">▶ Próximo</button>
      <button id="btn-auto" class="btn-battle btn-battle--auto">⚡ Auto</button>
      <button id="btn-close" class="btn-battle btn-battle--close" style="display:none">✓ Resultado</button>
    </div>

  </section>
  `;

  initBattleLogic(estados, root);
}

function initBattleLogic(estados, root) {
  let turnoAtual = 0;
  let auto = false;
  let interval = null;

  const btnNext = root.querySelector("#btn-next");
  const btnAuto = root.querySelector("#btn-auto");
  const btnClose = root.querySelector("#btn-close");

  function atualizarUI(estado, prev) {
    const { p1, p2 } = getAtivos(estado);

    const pct1 = (p1.hp / p1.maxHp) * 100;
    const pct2 = (p2.hp / p2.maxHp) * 100;

    const hp1 = root.querySelector("#hp-fill-p1");
    const hp2 = root.querySelector("#hp-fill-p2");

    hp1.style.width = pct1 + "%";
    hp2.style.width = pct2 + "%";

    hp1.style.background = hpBarColor(pct1);
    hp2.style.background = hpBarColor(pct2);

    root.querySelector("#hp-text-p1").textContent = `${p1.hp}/${p1.maxHp}`;
    root.querySelector("#hp-text-p2").textContent = `${p2.hp}/${p2.maxHp}`;

    // troca pokemon
    if (prev) {
      const prevA = getAtivos(prev);

      if (prevA.p1.name !== p1.name) {
        const s = root.querySelector("#sprite-p1");
        s.classList.add("battle-sprite--swap");
        setTimeout(() => s.classList.remove("battle-sprite--swap"), 300);
      }
      if (prevA.p2.name !== p2.name) {
        const s = root.querySelector("#sprite-p2");
        s.classList.add("battle-sprite--swap");
        setTimeout(() => s.classList.remove("battle-sprite--swap"), 300);
      }
    }

    root.querySelector("#sprite-p1").src = p1.sprite;
    root.querySelector("#sprite-p2").src = p2.sprite;

    root.querySelector("#combatant-p1 .battle-combatant__name").textContent =
      capitalize(p1.name);
    root.querySelector("#combatant-p2 .battle-combatant__name").textContent =
      capitalize(p2.name);

    const turnText = root.querySelector("#turn-text");
    if (turnText) {
      turnText.textContent = estado.finalizado
        ? "Fim!"
        : `Turno ${estado.turno}`;
    }
  }

  function addLog(entry) {
    const log = root.querySelector("#battle-log");
    const p = document.createElement("p");

    p.className = "battle-log__entry";
    if (entry.atacante === 1) p.classList.add("battle-log__entry--p1");
    else if (entry.atacante === 2) p.classList.add("battle-log__entry--p2");
    else p.classList.add("battle-log__entry--system");

    p.textContent = entry.texto;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function avancar() {
    if (turnoAtual >= estados.length - 1) return;

    const prev = estados[turnoAtual];
    turnoAtual++;
    const estado = estados[turnoAtual];

    const novas = estado.log.slice(prev.log.length);
    novas.forEach(addLog);

    atualizarUI(estado, prev);

    if (estado.finalizado) {
      pararAuto();
      btnNext.style.display = "none";
      btnAuto.style.display = "none";
      btnClose.style.display = "inline-flex";

      setTimeout(() => {
        const win = estado.vencedor === 1 ? "#combatant-p1" : "#combatant-p2";
        root.querySelector(win)?.classList.add("battle-combatant--winner");
      }, 500);
    }
  }

  function pararAuto() {
    if (interval) clearInterval(interval);
    auto = false;
    btnAuto.textContent = "⚡ Auto";
  }

  btnNext.onclick = () => !auto && avancar();

  btnAuto.onclick = () => {
    if (auto) {
      pararAuto();
    } else {
      auto = true;
      btnAuto.textContent = "⏸ Pausar";
      interval = setInterval(() => {
        if (turnoAtual >= estados.length - 1) pararAuto();
        else avancar();
      }, 900);
    }
  };

  btnClose.onclick = () => {
    fechar();
    onBatalhaFinalizada?.(estados.at(-1));
  };

  atualizarUI(estados[0]);
}

function fechar() {
  const root = document.querySelector("#modal-root");
  if (!root) return;
  root.classList.remove("is-open");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = "";
  document.body.style.overflow = "";

}

export const battleView = { open, fechar };
