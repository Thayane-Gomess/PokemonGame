/**
 * battleEngine.js
 * Engine de batalha por turnos 2v2 (dois Pokémons por time)
 * Responsabilidade: calcular dano, HP, turnos, trocas e resultado final.
 */

// =======================
// TABELA DE TIPOS
// =======================
const TYPE_CHART = {
  fire:    { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
  water:   { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass:   { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric:{ water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  ice:     { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting:{ normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, bug: 0.5, psychic: 0.5, flying: 0.5, fairy: 0.5, ghost: 0 },
  poison:  { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground:  { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying:  { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:     { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock:    { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost:   { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  dragon:  { dragon: 2, steel: 0.5, fairy: 0 },
  dark:    { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel:   { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy:   { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
  normal:  {},
};

// =======================
// UTILIDADES
// =======================

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function calcTypeMultiplier(attackerTypes, defenderTypes) {
  let multiplier = 1;
  for (const atkType of attackerTypes) {
    const chart = TYPE_CHART[atkType] || {};
    for (const defType of defenderTypes) {
      if (chart[defType] !== undefined) {
        multiplier *= chart[defType];
      }
    }
  }
  return multiplier;
}

function calcMaxHP(totalStats) {
  return Math.floor(totalStats * 0.6) + 50;
}

function calcDamage(attacker, defender) {
  const poder = Math.floor(attacker.stats.total * 0.15) + 10;
  const atkStat = attacker.stats.total;
  const defStat = defender.stats.total;
  const ratio = atkStat / (defStat + atkStat);

  const typeMulti = calcTypeMultiplier(attacker.types, defender.types);
  const random = 0.85 + Math.random() * 0.15;

  const dano = Math.max(
    1,
    Math.floor(poder * ratio * typeMulti * random)
  );

  return { dano, typeMulti };
}

function typeEffectivenessMessage(multiplier) {
  if (multiplier === 0) return "Não teve efeito!";
  if (multiplier >= 4) return "É super efetivo!! (x4)";
  if (multiplier >= 2) return "É super efetivo!";
  if (multiplier <= 0.25) return "Não é muito efetivo... (x0.25)";
  if (multiplier <= 0.5) return "Não é muito efetivo...";
  return null;
}

// =======================
// INIT 2v2
// =======================

function escolherPrimeiro(p1, p2) {
  return p1.stats.speed >= p2.stats.speed ? 1 : 2;
}

function initBattle2v2(time1, time2) {
  const preparar = (poke) => {
    const hp = calcMaxHP(poke.stats.total);
    return { ...poke, hp, maxHp: hp };
  };

  const t1 = time1.map(preparar);
  const t2 = time2.map(preparar);

  return {
    time1: t1,
    time2: t2,
    ativos: { 1: 0, 2: 0 },
    turno: 1,
    atacante: escolherPrimeiro(t1[0], t2[0]),
    log: [],
    finalizado: false,
    vencedor: null,
  };
}

// =======================
// TURNO 2v2
// =======================

function executarTurno2v2(estado) {
  if (estado.finalizado) return estado;

  const novo = {
    ...estado,
    time1: estado.time1.map(p => ({ ...p })),
    time2: estado.time2.map(p => ({ ...p })),
    ativos: { ...estado.ativos },
    log: [...estado.log],
  };

  const ladoAtk = novo.atacante;
  const ladoDef = ladoAtk === 1 ? 2 : 1;

  const atkTeam = ladoAtk === 1 ? novo.time1 : novo.time2;
  const defTeam = ladoDef === 1 ? novo.time1 : novo.time2;

  const atkIndex = novo.ativos[ladoAtk];
  const defIndex = novo.ativos[ladoDef];

  const atk = atkTeam[atkIndex];
  const def = defTeam[defIndex];

  const { dano, typeMulti } = calcDamage(atk, def);

  const hpAntes = def.hp;
  def.hp = Math.max(0, def.hp - dano);

  const nomeAtk = capitalize(atk.name);
  const nomeDef = capitalize(def.name);

  const logEntry = {
    turno: novo.turno,
    atacante: ladoAtk,
    texto: `${nomeAtk} atacou ${nomeDef} causando ${dano} de dano!`,
    dano,
    typeMulti,
    hpAntes,
    hpDepois: def.hp,
    alvo: ladoDef,
  };

  const effMsg = typeEffectivenessMessage(typeMulti);
  if (effMsg) logEntry.efetividade = effMsg;

  novo.log.push(logEntry);

  // Se defensor morreu
  if (def.hp <= 0) {
    const proximo = defTeam.findIndex(p => p.hp > 0);

    if (proximo === -1) {
      novo.finalizado = true;
      novo.vencedor = ladoAtk;

      novo.log.push({
        turno: novo.turno,
        texto: `${nomeDef} desmaiou! Time ${ladoAtk} venceu!`,
        tipo: "resultado",
      });

      return novo;
    } else {
      novo.ativos[ladoDef] = proximo;

      novo.log.push({
        turno: novo.turno,
        texto: `${nomeDef} desmaiou! ${capitalize(defTeam[proximo].name)} entrou na batalha!`,
        tipo: "troca",
      });
    }
  }

  novo.atacante = ladoDef;
  novo.turno += 1;

  return novo;
}

// =======================
// SIMULAÇÃO COMPLETA
// =======================

function simularBatalha2v2(time1, time2) {
  let estado = initBattle2v2(time1, time2);
  const estados = [estado];

  let maxTurnos = 200;

  while (!estado.finalizado && maxTurnos-- > 0) {
    estado = executarTurno2v2(estado);
    estados.push(estado);
  }

  if (!estado.finalizado) {
    estado = { ...estado, finalizado: true, vencedor: 0 };
    estados.push(estado);
  }

  return estados;
}

// =======================
// EXPORT
// =======================

export const battleEngine = {
  initBattle2v2,
  executarTurno2v2,
  simularBatalha2v2,
  calcMaxHP,
  calcTypeMultiplier,
};