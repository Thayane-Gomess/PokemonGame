import { calcularMultiplicadorTime } from "./typeService.js";

/**
 * Calcula o resultado da batalha entre dois times de 2 Pokémon cada.
 *
 * @param {Array} jogador1 - [pokemon1, pokemon2] do jogador 1
 * @param {Array} jogador2 - [pokemon1, pokemon2] do jogador 2
 * @returns {ResultadoBatalha}
 */
function calcularResultado(jogador1, jogador2) {
  // Soma de base stats bruta de cada time
  const statsBrutos = {
    jogador1: somarStats(jogador1),
    jogador2: somarStats(jogador2),
  };

  // Multiplicadores de vantagem de tipo (bônus 10–20%)
  const multiplicadores = {
    jogador1: calcularMultiplicadorTime(jogador1, jogador2),
    jogador2: calcularMultiplicadorTime(jogador2, jogador1),
  };

  // Pontuação final com bônus aplicado
  const pontos = {
    jogador1: Math.round(statsBrutos.jogador1 * multiplicadores.jogador1),
    jogador2: Math.round(statsBrutos.jogador2 * multiplicadores.jogador2),
  };

  // Determina vencedor
  let vencedor;
  if (pontos.jogador1 === pontos.jogador2) {
    vencedor = "empate";
  } else if (pontos.jogador1 > pontos.jogador2) {
    vencedor = "jogador1";
  } else {
    vencedor = "jogador2";
  }

  return {
    vencedor,
    pontos,
    statsBrutos,
    multiplicadores,
    detalhes: {
      jogador1: detalharTime(jogador1),
      jogador2: detalharTime(jogador2),
    },
  };
}

/**
 * Soma o total de base stats de um time (2 Pokémon).
 * @param {Array} time
 * @returns {number}
 */
function somarStats(time) {
  return time.reduce((acc, poke) => {
    const total = poke?.stats?.total ?? 0;
    return acc + total;
  }, 0);
}

/**
 * Cria um resumo detalhado do time para exibição no modal.
 * @param {Array} time
 * @returns {Array}
 */
function detalharTime(time) {
  return time.map((p) => ({
    id: p?.id,
    nome: p?.nome || p?.name,
    tipos: p?.tipos || p?.types || [],
    statsTotal: p?.stats?.total ?? 0,
  }));
}

export { calcularResultado };