import express from "express";
import cors from "cors";
import { getPokemon, getRandomPokemon } from "./src/js/services/pokeService.js";
import { calcularVantagem } from "./src/js/services/typeService.js";
import { calcularResultado } from "./src/js/services/Battleservice.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ─── Logger simples ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rotas ────────────────────────────────────────────────────────────────────

/**
 * GET /api/pokemon/:nome
 * Busca um Pokémon pelo nome ou ID na PokeAPI.
 * Retorna dados normalizados para o simulador.
 *
 * Exemplo: GET /api/pokemon/pikachu
 */
app.get("/api/pokemon/:nome", async (req, res) => {
  const { nome } = req.params;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: "Informe o nome ou ID do Pokémon." });
  }

  try {
    const pokemon = await getPokemon(nome.trim().toLowerCase());
    return res.status(200).json(pokemon);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ erro: err.message });
  }
});

/**
 * GET /api/pokemon/random
 * Sorteia um Pokémon aleatório (das primeiras 898 entradas da PokeAPI).
 *
 * Exemplo: GET /api/pokemon/random
 */
app.get("/api/pokemon/random", async (_req, res) => {
  try {
    const pokemon = await getRandomPokemon();
    return res.status(200).json(pokemon);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

/**
 * POST /api/batalha
 * Calcula o resultado da batalha entre dois jogadores.
 *
 * Body esperado:
 * {
 *   jogador1: [{ id, name, types, stats }, { id, name, types, stats }],
 *   jogador2: [{ id, name, types, stats }, { id, name, types, stats }]
 * }
 *
 * Retorno:
 * {
 *   vencedor: "jogador1" | "jogador2" | "empate",
 *   pontos: { jogador1: number, jogador2: number },
 *   multiplicadores: { jogador1: number, jogador2: number },
 *   detalhes: { ... }
 * }
 */
app.post("/api/batalha", (req, res) => {
  const { jogador1, jogador2 } = req.body || {};

  if (
    !Array.isArray(jogador1) || jogador1.length !== 2 ||
    !Array.isArray(jogador2) || jogador2.length !== 2
  ) {
    return res.status(400).json({
      erro: "Envie exatamente 2 Pokémon para cada jogador (jogador1[] e jogador2[]).",
    });
  }

  try {
    const resultado = calcularResultado(jogador1, jogador2);
    return res.status(200).json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
});

/**
 * GET /api/tipos/vantagem?atacante=fire&defensor=grass
 * Consulta se um tipo tem vantagem sobre outro e retorna o multiplicador.
 */
app.get("/api/tipos/vantagem", (req, res) => {
  const { atacante, defensor } = req.query;

  if (!atacante || !defensor) {
    return res.status(400).json({
      erro: "Informe os parâmetros 'atacante' e 'defensor'.",
    });
  }

  const multiplicador = calcularVantagem(atacante, defensor);
  return res.status(200).json({
    atacante,
    defensor,
    multiplicador,
    descricao: descricaoMultiplicador(multiplicador),
  });
});

/**
 * GET /api/health
 * Verifica se a API está operacional.
 */
app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    versao: "1.0.0",
  });
});

// ─── 404 genérico ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// ─── Error handler global ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERRO GLOBAL]", err);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Pokémon Battle API rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/pokemon/:nome`);
  console.log(`   GET  /api/pokemon/random`);
  console.log(`   POST /api/batalha`);
  console.log(`   GET  /api/tipos/vantagem?atacante=fire&defensor=grass`);
});

// ─── Util ─────────────────────────────────────────────────────────────────────
function descricaoMultiplicador(mult) {
  if (mult > 1) return `Vantagem! Bônus de ${Math.round((mult - 1) * 100)}% aplicado.`;
  if (mult < 1) return `Desvantagem. Penalidade de ${Math.round((1 - mult) * 100)}% aplicada.`;
  return "Neutro. Sem bônus ou penalidade.";
}

export default app;