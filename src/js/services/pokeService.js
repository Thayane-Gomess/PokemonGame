const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const TOTAL_POKEMON = 898;

/**
 * Busca e normaliza um Pokémon da PokéAPI.
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

  const data = await res.json();
  return mapPokemon(data);
}

/**
 * Sorteia e retorna um Pokémon aleatório.
 * @returns {Promise<Pokemon>}
 */
async function getRandomPokemon() {
  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  return getPokemon(id);
}


function mapPokemon(data) {
  const id = Number(data?.id ?? 0);
  const name = String(data?.name ?? "unknown");

  const types = Array.isArray(data?.types)
    ? data.types.map((t) => t?.type?.name).filter(Boolean)
    : [];

  const sprite =
    data?.sprites?.front_default ??
    data?.sprites?.other?.["official-artwork"]?.front_default ??
    null;

  const statsRaw = Array.isArray(data?.stats) ? data.stats : [];
  const total = statsRaw.reduce((acc, s) => acc + (s?.base_stat ?? 0), 0);

  const normalized = {
    id,
    name,
    sprite,
    types,
    stats: { total },

    
    nome: name,
    tipos: types,
  };

  return normalized;
}

export const pokeService = {
  getPokemon,
  getRandomPokemon,
};