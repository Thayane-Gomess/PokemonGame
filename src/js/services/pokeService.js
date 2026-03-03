const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

async function getPokemon(consulta) {
  const termo = String(consulta || "").trim().toLowerCase();
  if (!termo) throw new Error("Digite o nome ou o ID do Pokémon.");

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(termo)}`);
  if (res.status === 404) throw new Error("Pokémon não encontrado.");
  if (!res.ok) throw new Error("Erro ao buscar Pokémon.");

  return mapPokemon(await res.json());
}

function mapPokemon(dados) {
  const rawStats = Array.isArray(dados?.stats) ? dados.stats : [];
  const total = rawStats.reduce((acc, s) => acc + (s?.base_stat ?? 0), 0);

  // Mapeia cada stat individualmente para uso na batalha
  const statsMap = {};
  rawStats.forEach((s) => {
    const nome = s?.stat?.name;
    if (nome) statsMap[nome] = s.base_stat ?? 0;
  });

  const types = Array.isArray(dados?.types)
    ? dados.types.map((t) => t?.type?.name).filter(Boolean)
    : [];

  return {
    id: dados?.id ?? 0,
    name: dados?.name ?? "desconhecido",
    sprite: dados?.sprites?.front_default ?? null,
    spriteBack: dados?.sprites?.back_default ?? null,
    spriteShiny: dados?.sprites?.front_shiny ?? null,
    types,
    stats: {
      total,
      hp: statsMap["hp"] ?? 0,
      attack: statsMap["attack"] ?? 0,
      defense: statsMap["defense"] ?? 0,
      spAttack: statsMap["special-attack"] ?? 0,
      spDefense: statsMap["special-defense"] ?? 0,
      speed: statsMap["speed"] ?? 0,
    },
  };
}

export const pokeService = { getPokemon };
