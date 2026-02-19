import { arenaView } from "./ui/arenaView.js";
import { modalView } from "./ui/modalView.js";
import { battleController } from "./controllers/battleController.js";

arenaView.init({
  onBuscarPokemon: battleController.handleBuscarPokemon,
  onTrocarPokemon: battleController.handleTrocarPokemon,
  onTentarNovamente: battleController.handleTentarNovamente,
  onBatalhar: battleController.handleBatalhar,
  onToggleReady: battleController.handleToggleReady,
});

modalView.init({
  onJogarNovamente: battleController.handleResetarDuelo,
});

// primeiro renderiza a estrutura estática (slots vazios)
arenaView.renderShell();
arenaView.renderBotaoBatalhar(false);

// depois inicializa o controller que vai sincronizar o estado e preencher os slots
battleController.init({
  onAtualizarUI: arenaView.render,
  onAbrirModal: modalView.open,
  onAtualizarBotao: arenaView.renderBotaoBatalhar,
  onAlerta: arenaView.alerta,
});
