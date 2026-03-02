let onJogarNovamente = null;

function init(cb) {
  onJogarNovamente = cb?.onJogarNovamente || null;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function open(resultado) {
  const root = document.querySelector("#modal-root");
  if (!root) return;

  const vencedor = resultado?.vencedor;
  const pokemon1 = resultado?.pokemon1;
  const pokemon2 = resultado?.pokemon2;

  let titulo = "JOGADOR 2 VENCEU!";
  let subtitulo = pokemon2 ? `${capitalize(pokemon2.name)} foi o campeão!` : '';
  let corTitulo = '#dc2626';
  let icone = '🏆';

  if (vencedor === "empate") {
    titulo = "EMPATE!";
    subtitulo = "Ambos os Pokémons lutaram com tudo!";
    corTitulo = '#d97706';
    icone = '🤝';
  } else if (vencedor === "jogador1") {
    titulo = "JOGADOR 1 VENCEU!";
    subtitulo = pokemon1 ? `${capitalize(pokemon1.name)} foi o campeão!` : '';
    corTitulo = '#2563eb';
    icone = '🏆';
  }

  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const sprite1 = pokemon1?.sprite || '';
  const sprite2 = pokemon2?.sprite || '';
  const nome1 = capitalize(pokemon1?.name || 'Pokémon 1');
  const nome2 = capitalize(pokemon2?.name || 'Pokémon 2');
  const hp1 = pokemon1?.hp ?? 0;
  const maxHp1 = pokemon1?.maxHp ?? 1;
  const hp2 = pokemon2?.hp ?? 0;
  const maxHp2 = pokemon2?.maxHp ?? 1;
  const pct1 = Math.max(0, Math.round((hp1 / maxHp1) * 100));
  const pct2 = Math.max(0, Math.round((hp2 / maxHp2) * 100));

  root.innerHTML = `
    <section class="modal-box resultado-modal" role="dialog" aria-modal="true" aria-label="Resultado da batalha">
      <div class="resultado-icone">${icone}</div>
      <h2 class="win-title" style="color:${corTitulo}">${titulo}</h2>
      <p class="resultado-subtitulo">${subtitulo}</p>

      <div class="resultado-pokemons">
        <div class="resultado-pokemon resultado-pokemon--p1 ${vencedor === 'jogador1' ? 'resultado-pokemon--winner' : ''}">
          <img src="${sprite1}" alt="${nome1}" class="resultado-sprite" />
          <span class="resultado-nome">${nome1}</span>
          <div class="resultado-hp-bar">
            <div class="resultado-hp-fill" style="width:${pct1}%; background:${hpBarColor(pct1)}"></div>
          </div>
          <span class="resultado-hp-text">${hp1}/${maxHp1} HP</span>
          ${vencedor === 'jogador1' ? '<span class="resultado-badge-winner">VENCEDOR</span>' : ''}
        </div>

        <div class="resultado-vs">VS</div>

        <div class="resultado-pokemon resultado-pokemon--p2 ${vencedor === 'jogador2' ? 'resultado-pokemon--winner' : ''}">
          <img src="${sprite2}" alt="${nome2}" class="resultado-sprite" />
          <span class="resultado-nome">${nome2}</span>
          <div class="resultado-hp-bar">
            <div class="resultado-hp-fill" style="width:${pct2}%; background:${hpBarColor(pct2)}"></div>
          </div>
          <span class="resultado-hp-text">${hp2}/${maxHp2} HP</span>
          ${vencedor === 'jogador2' ? '<span class="resultado-badge-winner">VENCEDOR</span>' : ''}
        </div>
      </div>

      <div class="modal-actions">
        <button id="btn-fechar-modal" class="btn-ghost" type="button">Fechar</button>
        <button id="btn-jogar-novamente" class="btn-commander is-visivel" type="button">Jogar novamente</button>
      </div>
    </section>
  `;

  const fechar = () => {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    document.body.style.overflow = "";
    location.reload()
  };

  root.addEventListener(
    "click",
    (e) => { if (e.target === root) fechar(); },
    { once: true }
  );

  root.querySelector("#btn-fechar-modal")?.addEventListener("click", fechar);
  root.querySelector("#btn-jogar-novamente")?.addEventListener("click", () => {
    fechar();
    onJogarNovamente?.();
  });
}

function hpBarColor(percent) {
  if (percent > 50) return '#4ade80';
  if (percent > 25) return '#facc15';
  return '#f87171';
}

export const modalView = { init, open };
