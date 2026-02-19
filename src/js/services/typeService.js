/**
 * Tabela completa de efetividade de tipos (geração 6+).
 * Chave: tipo atacante → objeto com tipo defensor → multiplicador
 *
 * 2.0  = super efetivo
 * 0.5  = pouco efetivo
 * 0.0  = imune
 * 1.0  = neutro (omitido para economia de espaço)
 */
const TABELA_TIPOS = {
  normal: {
    rock: 0.5, ghost: 0, steel: 0.5,
  },
  fire: {
    fire: 0.5, water: 0.5, grass: 2, ice: 2,
    bug: 2, rock: 0.5, dragon: 0.5, steel: 2,
  },
  water: {
    fire: 2, water: 0.5, grass: 0.5, ground: 2,
    rock: 2, dragon: 0.5,
  },
  electric: {
    water: 2, electric: 0.5, grass: 0.5, ground: 0,
    flying: 2, dragon: 0.5,
  },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5,
    ground: 2, flying: 0.5, bug: 0.5, rock: 2,
    dragon: 0.5, steel: 0.5,
  },
  ice: {
    fire: 0.5, water: 0.5, grass: 2, ice: 0.5,
    ground: 2, flying: 2, dragon: 2, steel: 0.5,
  },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, flying: 0.5,
    psychic: 0.5, bug: 0.5, rock: 2, ghost: 0,
    dark: 2, steel: 2, fairy: 0.5,
  },
  poison: {
    grass: 2, poison: 0.5, ground: 0.5, rock: 0.5,
    ghost: 0.5, steel: 0, fairy: 2,
  },
  ground: {
    fire: 2, electric: 2, grass: 0.5, poison: 2,
    flying: 0, bug: 0.5, rock: 2, steel: 2,
  },
  flying: {
    electric: 0.5, grass: 2, fighting: 2, bug: 2,
    rock: 0.5, steel: 0.5,
  },
  psychic: {
    fighting: 2, poison: 2, psychic: 0.5,
    dark: 0, steel: 0.5,
  },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5,
    psychic: 2, ghost: 0.5, dark: 2, steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2, ice: 2, fighting: 0.5, ground: 0.5,
    flying: 2, bug: 2, steel: 0.5,
  },
  ghost: {
    normal: 0, psychic: 2, ghost: 2, dark: 0.5,
  },
  dragon: {
    dragon: 2, steel: 0.5, fairy: 0,
  },
  dark: {
    fighting: 0.5, psychic: 2, ghost: 2,
    dark: 0.5, fairy: 0.5,
  },
  steel: {
    fire: 0.5, water: 0.5, electric: 0.5, ice: 2,
    rock: 2, steel: 0.5, fairy: 2,
  },
  fairy: {
    fire: 0.5, fighting: 2, poison: 0.5,
    dragon: 2, dark: 2, steel: 0.5,
  },
};

/**
 * Retorna o multiplicador de vantagem de tipo.
 * @param {string} atacante - Tipo do Pokémon atacante
 * @param {string} defensor  - Tipo do Pokémon defensor
 * @returns {number} - 0, 0.5, 1 ou 2
 */
function calcularVantagem(atacante, defensor) {
  const a = String(atacante || "").toLowerCase();
  const d = String(defensor || "").toLowerCase();
  return TABELA_TIPOS[a]?.[d] ?? 1;
}

/**
 * Calcula o multiplicador total de um time (2 Pokémon) contra o time inimigo.
 * Leva em conta todos os tipos de cada Pokémon.
 *
 * Regra: se QUALQUER tipo do time A tem vantagem sobre QUALQUER tipo do time B,
 * aplica o melhor multiplicador (máximo) como bônus.
 *
 * @param {Array} timeAtacante - Array com 2 objetos Pokémon normalizados
 * @param {Array} timeDefensor - Array com 2 objetos Pokémon normalizados
 * @returns {number} - Multiplicador final (1.0, 1.1 ou 1.2)
 */
function calcularMultiplicadorTime(timeAtacante, timeDefensor) {
  let melhorMult = 1;

  for (const poke of timeAtacante) {
    const tiposAtacante = Array.isArray(poke?.tipos) ? poke.tipos : [];

    for (const pDefensor of timeDefensor) {
      const tiposDefensor = Array.isArray(pDefensor?.tipos) ? pDefensor.tipos : [];

      for (const ta of tiposAtacante) {
        for (const td of tiposDefensor) {
          const mult = calcularVantagem(ta, td);
          if (mult > melhorMult) melhorMult = mult;
        }
      }
    }
  }

  // Converte vantagem de tipo (2x) para bônus moderado de 10–20%
  if (melhorMult >= 2) return 1.2;
  if (melhorMult > 1) return 1.1;
  return 1.0;
}

export { calcularVantagem, calcularMultiplicadorTime };