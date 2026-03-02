import { arenaView } from "./ui/arenaView.js";
import { modalView } from "./ui/modalView.js";
import { battleView } from "./ui/battleView.js";
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

// render base
arenaView.renderShell();
arenaView.renderBotaoBatalhar(false);

battleController.init({
  onAtualizarUI: arenaView.render,
  onAtualizarBotao: arenaView.renderBotaoBatalhar,
  onAlerta: arenaView.alerta,

  onAbrirModal: (resultado) => {
    modalView.open(resultado);
  },
});