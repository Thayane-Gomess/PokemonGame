import { pokeService } from "../services/pokeService.js";
import { battleEngine } from "../services/battleEngine.js";
import { battleView } from "../ui/battleView.js";

let ui = {};

// status do jogo
const STATUS = Object.freeze({
  IDLE: "idle",
  PRONTO: "pronto",
  BATALHA: "batalha",
  FINALIZADO: "finalizado",
});

const SLOT_KEYS = ["player1", "player2", "player3", "player4"];

// ---------- STATE ----------

function initialState() {
  const build = (v) => SLOT_KEYS.reduce((acc, key) => ((acc[key] = v), acc), {});
  return {
    players: build(null),
    carregando: build(false),
    erros: build(null),
    consultas: build(""),
    status: STATUS.IDLE,
    trainers: {
      active: "trainer1",
      ready: { trainer1: false, trainer2: false },
    },
    resultado: null,
  };
}

let state = initialState();

function getState() {
  return JSON.parse(JSON.stringify(state));
}

// ---------- MUTATORS ----------

function setStatus(v) { state.status = v; }
function setLoading(slot, v) { state.carregando[slot] = Boolean(v); }
function setError(slot, msg) { state.erros[slot] = msg || null; }
function setPlayerPokemon(slot, pokemon) {
  state.players[slot] = pokemon;
  state.erros[slot] = null;
}
function clearSlot(slot) {
  state.players[slot] = null;
  state.erros[slot] = null;
  state.carregando[slot] = false;
}
function setQuery(slot, v) {
  state.consultas[slot] = String(v || "");
}
function canBattle() {
  return SLOT_KEYS.every((k) => Boolean(state.players[k]));
}
function resetState() {
  state = initialState();
}

// ---------- INIT ----------

function init(deps) {
  ui = deps;
  syncUI();
}

// ---------- BUSCAR ----------

async function handleBuscarPokemon({ slot, consulta }) {
  const termo = String(consulta || "").trim().toLowerCase();
  setQuery(slot, consulta);

  const trainer = slot === "player1" || slot === "player2"
    ? "trainer1"
    : "trainer2";

  const current = getState();

  if (current.trainers.ready[trainer]) {
    ui.onAlerta?.({
      mensagem: "Treinador já está pronto — não pode alterar.",
      tipo: "erro",
    });
    return;
  }

  if (current.trainers.active !== trainer) {
    ui.onAlerta?.({
      mensagem: "Aguarde sua vez — é a vez do outro treinador.",
      tipo: "erro",
    });
    return;
  }

  // evita duplicados
  const already = Object.values(current.players).some((p) => {
    if (!p) return false;
    const num = Number(termo);
    if (!Number.isNaN(num)) return p.id === num;
    return (p.name || "").toLowerCase() === termo;
  });

  if (already) {
    ui.onAlerta?.({
      mensagem: "Esse pokémon já foi escolhido.",
      tipo: "erro",
    });
    return;
  }

  setLoading(slot, true);
  state.resultado = null;
  syncUI();

  try {
    const pokemon = await pokeService.getPokemon(consulta);

    const after = getState();
    const conflict = Object.values(after.players)
      .some((p) => p && p.id === pokemon.id);

    if (conflict) {
      ui.onAlerta?.({
        mensagem: "Pokémon já escolhido por outro slot.",
        tipo: "erro",
      });
      return;
    }

    setPlayerPokemon(slot, pokemon);
  } catch (err) {
    ui.onAlerta?.({
      mensagem: err?.message || "Erro ao buscar Pokémon.",
      tipo: "erro",
    });
    clearSlot(slot);
  } finally {
    setLoading(slot, false);
    setStatus(canBattle() ? STATUS.PRONTO : STATUS.IDLE);
    syncUI();
  }
}

// ---------- TROCAR ----------

function handleTrocarPokemon({ slot }) {
  const trainer = slot === "player1" || slot === "player2"
    ? "trainer1"
    : "trainer2";

  const current = getState();

  if (current.trainers.ready[trainer]) {
    ui.onAlerta?.({
      mensagem: "Treinador pronto — não pode trocar.",
      tipo: "erro",
    });
    return;
  }

  if (current.trainers.active !== trainer) {
    ui.onAlerta?.({
      mensagem: "Aguarde sua vez.",
      tipo: "erro",
    });
    return;
  }

  clearSlot(slot);
  setStatus(STATUS.IDLE);
  syncUI();
}

// ---------- TENTAR NOVAMENTE ----------

function handleTentarNovamente({ slot }) {
  setError(slot, null);
  clearSlot(slot);
  syncUI();
}

// ---------- BATALHAR 2v2 ----------

function handleBatalhar() {
  if (!canBattle()) return;

  setStatus(STATUS.BATALHA);
  syncUI();

  const time1 = [
    state.players.player1,
    state.players.player2,
  ];

  const time2 = [
    state.players.player3,
    state.players.player4,
  ];

  const estados = battleEngine.simularBatalha2v2(time1, time2);

  battleView.open(estados, (estadoFinal) => {
    const vencedor =
      estadoFinal.vencedor === 1
        ? "jogador1"
        : estadoFinal.vencedor === 2
        ? "jogador2"
        : "empate";

    const resultado = {
      vencedor,
      time1: estadoFinal.time1,
      time2: estadoFinal.time2,
    };

    state.resultado = resultado;
    setStatus(STATUS.FINALIZADO);

   const p1 = estadoFinal.time1[estadoFinal.ativos[1]];
const p2 = estadoFinal.time2[estadoFinal.ativos[2]];

ui.onAbrirModal?.({
  vencedor,
  pokemon1: p1,
  pokemon2: p2
});
  });
}

// ---------- RESULTADO 2v2 ----------

function montarResultadoModal2v2(resultado, time1, time2) {
  const pontos = {
    jogador1: resultado.vencedor === "jogador1" ? 1 : 0,
    jogador2: resultado.vencedor === "jogador2" ? 1 : 0,
  };

  return {
    vencedor: resultado.vencedor,
    pontos,
    time1,
    time2,
  };
}

// ---------- RESET ----------

function handleResetarDuelo() {
  resetState();
  syncUI();
}

// ---------- READY ----------

function handleToggleReady({ trainer }) {
  const slots =
    trainer === "trainer1"
      ? ["player1", "player2"]
      : ["player3", "player4"];

  const missing = slots.some((s) => !state.players[s]);

  if (missing) {
    ui.onAlerta?.({
      mensagem: "Preencha os 2 slots antes de marcar pronto.",
      tipo: "erro",
    });
    return;
  }

  const other =
    trainer === "trainer1"
      ? "trainer2"
      : "trainer1";

  state.trainers.ready[trainer] = true;

  if (!state.trainers.ready[other]) {
    state.trainers.active = other;
  } else {
    state.trainers.active = null;
    setStatus(canBattle() ? STATUS.PRONTO : STATUS.IDLE);
  }

  syncUI();
}

// ---------- UI SYNC ----------

function syncUI() {
  const copy = getState();
  ui.onAtualizarUI?.(copy);
  ui.onAtualizarBotao?.(canBattle());
}

// ---------- EXPORT ----------

export const battleController = {
  init,
  handleBuscarPokemon,
  handleTrocarPokemon,
  handleTentarNovamente,
  handleToggleReady,
  handleBatalhar,
  handleResetarDuelo,
};