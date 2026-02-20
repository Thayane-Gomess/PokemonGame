import { pokeService } from "../services/pokeService.js";

/**
 * Controller responsável por orquestrar ações da UI e chamadas a serviços.
 * Mantém um estado simples em memória para evitar a dependência do módulo
 * `state/duelState.js` (abordagem intencionalmente amadora/compacta).
 */
let ui = {};

// constantes de status e slots do jogo
const STATUS = Object.freeze({ IDLE: "idle", PRONTO: "pronto", BATALHA: "batalha", FINALIZADO: "finalizado" });
const SLOT_KEYS = ["player1", "player2", "player3", "player4"];

// cria o estado inicial com as chaves necessárias
function initialState() {
  const build = (v) => SLOT_KEYS.reduce((acc, key) => ((acc[key] = v), acc), {});
  return {
    players: build(null),
    carregando: build(false),
    erros: build(null),
    consultas: build("") ,
    status: STATUS.IDLE,
    // trainers: controla qual treinador está ativo e quem já marcou pronto
    trainers: {
      active: "trainer1",
      ready: { trainer1: false, trainer2: false },
    },
    resultado: null,
  };
}

let state = initialState();

// retorna uma cópia serializada do estado para evitar mutações diretas
function getState() {
  return JSON.parse(JSON.stringify(state));
}

// helpers de mutação do estado (nomes descritivos)
function setStatus(newStatus) { state.status = newStatus; }
function setLoading(slot, value) { state.carregando[slot] = Boolean(value); }
function setError(slot, message) { state.erros[slot] = message || null; }
function setPlayerPokemon(slot, pokemon) { state.players[slot] = pokemon; state.erros[slot] = null; }
function clearSlot(slot) { state.players[slot] = null; state.erros[slot] = null; state.carregando[slot] = false; }
function setQuery(slot, value) { state.consultas[slot] = String(value || ""); }
function canBattle() { return SLOT_KEYS.every((k) => Boolean(state.players[k])); }
function resetState() { state = initialState(); }

function init(deps) {
  ui = deps;
  syncUI();
}

/**
 * handleBuscarPokemon
 * - valida turno do treinador
 * - salva a consulta (input) para preservação
 * - busca via `pokeService` e previne duplicatas (pré e pós-fetch)
 */
async function handleBuscarPokemon({ slot, consulta }) {
  const termo = String(consulta || "").trim().toLowerCase();

  // salva a consulta para preservar o valor no input
  setQuery(slot, consulta);

  // bloqueia ação se não for o treinador ativo ou se o treinador já estiver marcado como pronto
  const trainer = slot === "player1" || slot === "player2" ? "trainer1" : "trainer2";
  const currentState = getState();
  if (currentState.trainers.ready[trainer]) {
    ui.onAlerta?.({ mensagem: "Treinador já está pronto — não pode alterar.", tipo: "erro" });
    syncUI();
    return;
  }
  if (currentState.trainers.active !== trainer) {
    ui.onAlerta?.({ mensagem: "Aguarde sua vez — é a vez do outro treinador.", tipo: "erro" });
    syncUI();
    return;
  }

  // valida duplicata antes do fetch
  const alreadySelected = Object.values(currentState.players).some((p) => {
    if (!p) return false;
    const num = Number(termo);
    if (!Number.isNaN(num) && Number.isFinite(num)) return p.id === num;
    return (p.name || "").toLowerCase() === termo;
  });

  if (alreadySelected) {
    ui.onAlerta?.({ mensagem: "Esse pokémon já foi escolhido. Escolha outro.", tipo: "erro" });
    syncUI();
    return;
  }

  setLoading(slot, true);
  // limpa resultado anterior
  state.resultado = null;
  syncUI();

  try {
    const pokemon = await pokeService.getPokemon(consulta);

    // checa duplicata após o fetch (evita corrida entre slots)
    const afterState = getState();
    const conflict = Object.values(afterState.players).some((p) => p && p.id === pokemon.id);
    if (conflict) {
      ui.onAlerta?.({ mensagem: "Esse pokémon já foi escolhido por outro slot. Escolha outro.", tipo: "erro" });
      setLoading(slot, false);
      syncUI();
      return;
    }

    setPlayerPokemon(slot, pokemon);
  } catch (err) {
    const msg = err?.message || "Erro inesperado.";
    setPlayerPokemon(slot, null);
    ui.onAlerta?.({ mensagem: msg, tipo: "erro" });
  } finally {
    setLoading(slot, false);
    setStatus(canBattle() ? STATUS.PRONTO : STATUS.IDLE);
    syncUI();
  }
}

/**
 * handleTrocarPokemon
 * - limpa apenas o slot solicitado, respeitando turno e status de ready
 */
function handleTrocarPokemon({ slot }) {
  const trainer = slot === "player1" || slot === "player2" ? "trainer1" : "trainer2";
  const currentState = getState();
  if (currentState.trainers.ready[trainer]) {
    ui.onAlerta?.({ mensagem: "Treinador pronto — não é possível trocar.", tipo: "erro" });
    return;
  }
  if (currentState.trainers.active !== trainer) {
    ui.onAlerta?.({ mensagem: "Aguarde sua vez para trocar.", tipo: "erro" });
    return;
  }
  clearSlot(slot);
  setStatus(STATUS.IDLE);
  syncUI();
}

/**
 * handleTentarNovamente
 * - limpa erro e slot para permitir nova tentativa
 */
function handleTentarNovamente({ slot }) {
  setError(slot, null);
  clearSlot(slot);
  syncUI();
}

/**
 * handleBatalhar
 * - apenas sinaliza início de batalha (engine não implementada aqui)
 */
function handleBatalhar() {
  if (!canBattle()) return;
  setStatus(STATUS.BATALHA);
  syncUI();
}

function handleResetarDuelo() {
  resetState();
  syncUI();
}

/**
 * Marca treinador como pronto e passa a vez para o outro treinador.
 * Quando ambos estiverem prontos, altera status para PRONTO.
 */
function handleToggleReady({ trainer }) {
  // antes de marcar pronto, validar se o treinador preencheu seus 2 slots
  const trainerSlots = trainer === "trainer1" ? ["player1", "player2"] : ["player3", "player4"];
  const missing = trainerSlots.some((s) => !state.players[s]);
  if (missing) {
    ui.onAlerta?.({ mensagem: "Preencha os 2 slots antes de marcar pronto.", tipo: "erro" });
    syncUI();
    return;
  }

  const other = trainer === "trainer1" ? "trainer2" : "trainer1";
  state.trainers.ready[trainer] = true;
  if (!state.trainers.ready[other]) {
    state.trainers.active = other;
  } else {
    state.trainers.active = null;
    setStatus(canBattle() ? STATUS.PRONTO : STATUS.IDLE);
  }
  syncUI();
}

// sincroniza o estado com a UI (callback fornecido em init)
function syncUI() {
  const copy = getState();
  ui.onAtualizarUI?.(copy);
  ui.onAtualizarBotao?.(canBattle());
}

export const battleController = {
  init,
  handleBuscarPokemon,
  handleTrocarPokemon,
  handleTentarNovamente,
  handleToggleReady,
  handleBatalhar,
  handleResetarDuelo,
};
