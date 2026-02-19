🎮 Pokémon Battle — API
Backend REST para o Pokémon Battle Simulator.
Atua como proxy da PokéAPI e centraliza toda a lógica de batalha.

🚀 Como rodar
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Inicie o servidor
npm start          # produção
npm run dev        # desenvolvimento (hot reload)
O servidor sobe em http://localhost:3000.

📋 Endpoints
GET /api/health
Verifica se a API está online.

Resposta:

{ "status": "ok", "timestamp": "...", "versao": "1.0.0" }
GET /api/pokemon/:nome
Busca um Pokémon pelo nome ou ID.

Exemplo: GET /api/pokemon/pikachu ou GET /api/pokemon/25

Resposta de sucesso (200):

{
  "id": 25,
  "nome": "pikachu",
  "tipos": ["electric"],
  "sprite": "https://raw.githubusercontent.com/.../pikachu.png",
  "sprites": {
    "frente": "...",
    "frenteShiny": "...",
    "artwork": "..."
  },
  "cry": "https://raw.githubusercontent.com/.../25.ogg",
  "stats": {
    "hp": 35,
    "ataque": 55,
    "defesa": 40,
    "ataqueEspecial": 50,
    "defesaEspecial": 50,
    "velocidade": 90,
    "total": 320
  }
}
Erros possíveis:

Código	Mensagem
400	"Informe o nome ou ID do Pokémon."
404	"Pokémon não encontrado."
502	"Erro ao acessar a PokéAPI."
GET /api/pokemon/random
Retorna um Pokémon aleatório (IDs 1–898).

Resposta: Mesmo formato do endpoint acima.

POST /api/batalha
Calcula o resultado da batalha entre dois jogadores.

Body:

{
  "jogador1": [
    { "id": 6, "nome": "charizard", "tipos": ["fire","flying"], "stats": { "total": 534 } },
    { "id": 9, "nome": "blastoise", "tipos": ["water"], "stats": { "total": 530 } }
  ],
  "jogador2": [
    { "id": 3, "nome": "venusaur", "tipos": ["grass","poison"], "stats": { "total": 525 } },
    { "id": 94, "nome": "gengar", "tipos": ["ghost","poison"], "stats": { "total": 500 } }
  ]
}
Resposta (200):

{
  "vencedor": "jogador1",
  "pontos": { "jogador1": 1277, "jogador2": 1025 },
  "statsBrutos": { "jogador1": 1064, "jogador2": 1025 },
  "multiplicadores": { "jogador1": 1.2, "jogador2": 1.0 },
  "detalhes": {
    "jogador1": [...],
    "jogador2": [...]
  }
}
Valores do campo vencedor: "jogador1" | "jogador2" | "empate"

GET /api/tipos/vantagem?atacante=fire&defensor=grass
Consulta o multiplicador de tipo entre dois tipos.

Resposta (200):

{
  "atacante": "fire",
  "defensor": "grass",
  "multiplicador": 2,
  "descricao": "Vantagem! Bônus de 100% aplicado."
}
🧠 Lógica de Batalha
Soma os base stats totais dos 2 Pokémon de cada jogador.
Verifica vantagem de tipo: se algum tipo do time A é super efetivo contra algum tipo do time B, aplica bônus de 10% a 20% nos stats finais.
Compara as pontuações finais e declara o vencedor.
🛠️ Stack
Node.js 18+ (ESModules)
Express 4
CORS
PokéAPI (fonte de dados)

## Contribuição individual (até 400 caracteres)
- **Cael:** _[preencher]_
- **Maxine:** _[preencher]_
- **Samuel:** _[API ]_
- **Jeferson:** _[preencher]_
- **Thayane:** _[preencher]_
- **Eduarda:** _[preencher]_
