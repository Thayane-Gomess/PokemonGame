/**
 * Slot manager (um por slot)
 * Responsabilidade única: renderizar um slot, manter seu input local
 * e delegar eventos para o controller.
 * Mantemos o mínimo de lógica de apresentação aqui; todo fluxo e
 * validação ficam no `battleController`.
 */

function criarSlot(slot) {
  return {
    slot,
    callbacks: {
      onBuscar: null,
      onTrocar: null,
      onTentarNovamente: null,
    },

    // registra callback: 'onBuscar' | 'onTrocar' | 'onTentarNovamente'
    on(evento, cb) {
      if (this.callbacks[evento] !== undefined) this.callbacks[evento] = cb;
      return this;
    },

    // Renderiza o slot a partir do estado global recebido do controller.
    // - Se houver carregamento, mostra estado de loading
    // - Se houver um pokémon selecionado, mostra o card
    // - Caso contrário, exibe o formulário de busca
    renderizar(estado) {
      const containerEl = document.querySelector(`[data-slot-container="${this.slot}"]`);
      if (!containerEl) return;

      const carregando = estado?.carregando?.[this.slot];
      const pokemon = estado?.players?.[this.slot];

      // preserva valor do input digitado: prefere o valor do estado
      // (`consultas`) quando disponível; caso contrário, mantém o valor
      // que já exista no DOM para evitar perda durante re-renders.
      let currentQuery = "";
      if (estado?.consultas && estado.consultas[this.slot]) {
        currentQuery = estado.consultas[this.slot];
      } else {
        const existing = containerEl.querySelector('input')?.value;
        currentQuery = existing ?? "";
      }

      // calcula se este slot está habilitado para edição dependendo do treinador
      const trainer = this.slot === 'player1' || this.slot === 'player2' ? 'trainer1' : 'trainer2';
      const trainers = estado?.trainers || { active: null, ready: { trainer1: false, trainer2: false } };
      const trainerReady = trainers.ready?.[trainer];
      const isActiveTrainer = trainers.active === trainer;
      const enabled = !trainerReady && isActiveTrainer;

      // não exibimos erros dentro do card: mostramos um alerta global
      if (carregando) this.renderLoading(containerEl);
      else if (pokemon) this.renderCard(containerEl, pokemon, enabled);
      else this.renderForm(containerEl, currentQuery, enabled);
    },

    renderForm(container, valorInicial = "", enabled = true) {
      // preenche o input com a consulta atual (se houver)
      const safeValue = String(valorInicial || "").replace(/"/g, '&quot;');
      container.innerHTML = `
        <form class="input-group input-group--aguardando" data-slot="${this.slot}">
          <p class="input-group__label">Escolha seu Pokémon</p>
          <input type="text" class="input-group__field" placeholder="pikachu / 25" aria-label="buscar pokémon" value="${safeValue}" ${enabled ? '' : 'disabled'} />
          <button class="btn-ui btn-ui--ok" type="submit" ${enabled ? '' : 'disabled'}>OK</button>
        </form>
      `;

      const form = container.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const consulta = (form.querySelector('input')?.value || '').trim();
        if (!consulta) return;
        this.callbacks.onBuscar?.({ slot: this.slot, consulta });
      });
    },

    renderLoading(container) {
      container.innerHTML = `
        <div class="slot-loading" aria-busy="true" aria-label="carregando pokémon">
          <div class="spinner" aria-hidden="true"></div>
          <p>Procurando...</p>
        </div>
      `;
    },

    renderErro(container, mensagem) {
      container.innerHTML = `
        <div class="slot-erro" role="alert" aria-live="assertive">
          <p class="slot-erro__titulo">Ops!</p>
          <p class="slot-erro__mensagem">${mensagem}</p>
          <button class="btn-ui btn-ui--tentar" type="button">Tentar novamente</button>
        </div>
      `;

      container.querySelector('.btn-ui--tentar')?.addEventListener('click', () => {
        this.callbacks.onTentarNovamente?.({ slot: this.slot });
      });
    },

    renderCard(container, pokemon, enabled = true) {
const name = pokemon?.name || pokemon?.nome || "desconhecido";
const types = pokemon?.types || pokemon?.tipos || [];
const total = pokemon?.stats?.total ?? 0;
const sprite = pokemon?.sprite || "";
      container.innerHTML = `
        <article class="card-pokemon" aria-label="pokémon selecionado: ${name}">
          <div class="card-pokemon__conteudo">
            <div class="card-pokemon__imagem-container">
              <img src="${sprite}" alt="sprite de ${name}" class="card-pokemon__imagem" />
            </div>
            <h3 class="card-pokemon__nome">${name}</h3>
            <div class="card-pokemon__info">
              <p class="card-pokemon__total"><span class="label">força:</span> <strong>${total}</strong></p>
            </div>
          </div>
          <button class="btn-ui btn-ui--trocar" type="button" aria-label="Trocar pokémon" ${enabled ? '' : 'disabled'}>trocar</button>
        </article>
      `;

      container.querySelector('.btn-ui--trocar')?.addEventListener('click', () => {
        this.callbacks.onTrocar?.({ slot: this.slot });
      });
    },
  };
}

export const slotManager = { criarSlot };