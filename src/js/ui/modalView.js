let onJogarNovamente = null;

function init(cb) {
  onJogarNovamente = cb?.onJogarNovamente || null;
}

function open(resultado) {
  const root = document.querySelector("#modal-root");
  if (!root) return;

  const vencedor = resultado?.vencedor;
  const pontos = resultado?.pontos;

  let titulo = "JOGADOR 2 VENCEU";
  if (vencedor === "empate") titulo = "EMPATE";
  if (vencedor === "jogador1") titulo = "JOGADOR 1 VENCEU";

  root.classList.add("is-open");
  root.setAttribute("aria-hidden", "false");
  // trava o scroll do fundo enquanto o modal estiver aberto
  document.body.style.overflow = "hidden";
  root.innerHTML = `
    <section class="modal-box" role="dialog" aria-modal="true" aria-label="Resultado da batalha">
      <h2 class="win-title">${titulo}</h2>
      <div class="win-score">${(pontos?.jogador1 ?? 0)} x ${(pontos?.jogador2 ?? 0)}</div>

      <div class="modal-actions">
        <button id="btn-fechar-modal" class="btn-ghost" type="button">Fechar</button>
        <button id="btn-jogar-novamente" class="btn-commander is-visible" type="button">Jogar novamente</button>
      </div>
    </section>
  `;

  const fechar = () => {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
    // restaura scroll do body
    document.body.style.overflow = "";
  };

  root.addEventListener(
    "click",
    (e) => {
      if (e.target === root) fechar();
    },
    { once: true }
  );

  root.querySelector("#btn-fechar-modal")?.addEventListener("click", fechar);

  root.querySelector("#btn-jogar-novamente")?.addEventListener("click", () => {
    fechar();
    onJogarNovamente?.();
  });
}

export const modalView = { init, open };
