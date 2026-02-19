const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const TOTAL_POKEMON = 898; // geração 1 a 8

/**
 * Busca e normaliza um Pokémon da PokeAPI.
 * @param {string|number} consulta - Nome ou ID do Pokémon
 * @returns {Promise<Pokemon>}
 */
async function getPokemon(consulta) {
  const termo = String(consulta || "").trim().toLowerCase();
  if (!termo) {
    const err = new Error("Digite o nome ou o ID do Pokémon.");
    err.status = 400;
    throw err;
  }

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(termo)}`);

  if (res.status === 404) {
    const err = new Error("Pokémon não encontrado. Verifique o nome ou ID.");
    err.status = 404;
    throw err;
  }

  if (!res.ok) {
    const err = new Error("Erro ao acessar a PokéAPI. Tente novamente.");
    err.status = 502;
    throw err;
  }

  const dados = await res.json();
  return normalizar(dados);
}

/**
 * Sorteia e retorna um Pokémon aleatório.
 * @returns {Promise<Pokemon>}
 */
async function getRandomPokemon() {
  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  return getPokemon(id);
}

/**
 * Normaliza os dados brutos da PokéAPI para o formato do simulador.
 * @param {object} dados - Resposta bruta da PokéAPI
 * @returns {Pokemon}
 */
function normalizar(dados) {
  // Stats individuais
  const statsMap = {};
  const statsRaw = Array.isArray(dados?.stats) ? dados.stats : [];

  for (const s of statsRaw) {
    const nomeStat = s?.stat?.name;
    if (nomeStat) {
      statsMap[nomeStat] = s?.base_stat ?? 0;
    }
  }

  const total = Object.values(statsMap).reduce((acc, v) => acc + v, 0);

  // Types
  const tipos = Array.isArray(dados?.types)
    ? dados.types.map((t) => t?.type?.name).filter(Boolean)
    : [];

  // Sprites
  const sprites = {
    frente: dados?.sprites?.front_default ?? null,
    frenteShiny: dados?.sprites?.front_shiny ?? null,
    artwork:
      dados?.sprites?.other?.["official-artwork"]?.front_default ?? null,
  };

  // Cry (som)
  const cry = dados?.cries?.latest ?? dados?.cries?.legacy ?? null;

  return {
    id: dados?.id ?? 0,
    nome: dados?.name ?? "desconhecido",
    tipos,
    sprite: sprites.frente,
    sprites,
    cry,
    stats: {
      hp: statsMap["hp"] ?? 0,
      ataque: statsMap["attack"] ?? 0,
      defesa: statsMap["defense"] ?? 0,
      ataqueEspecial: statsMap["special-attack"] ?? 0,
      defesaEspecial: statsMap["special-defense"] ?? 0,
      velocidade: statsMap["speed"] ?? 0,
      total,
    },
  };
}

export { getPokemon, getRandomPokemon };