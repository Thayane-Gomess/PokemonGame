Pokémon Card Battle

Um jogo web inspirado nos duelos de cartas colecionáveis dos anos 2000, onde cada jogador seleciona cartas Pokémon e disputa uma batalha baseada em atributos extraídos da PokéAPI.

O objetivo do projeto é demonstrar integração com API externa, arquitetura modular em JavaScript e organização de frontend em camadas, simulando a estrutura utilizada em aplicações profissionais.

O sistema consome dados reais da API Pokémon, transforma esses dados em atributos de batalha e executa um motor de comparação para determinar o vencedor.

Demonstração

Fluxo do jogo:

O usuário seleciona dois Pokémon

Cada Pokémon representa uma carta de batalha

Os atributos são carregados da API

O motor de batalha compara os valores

O sistema determina o vencedor da rodada

A lógica foi pensada para reproduzir a sensação dos duelos de cartas clássicos, onde cada carta possui atributos que determinam o resultado da disputa.

Objetivos do Projeto

Este projeto foi desenvolvido com foco em:

Consumo de API REST externa

Separação de responsabilidades no frontend

Organização de código em camadas

Estrutura escalável para aplicações JavaScript

Simulação de uma lógica de regra de negócio

Experiência interativa baseada em dados dinâmicos

Também foi pensado como um exercício de arquitetura frontend profissional, separando claramente:

interface

lógica de controle

serviços externos

Tecnologias Utilizadas
Linguagens

JavaScript

HTML5

CSS3

API

PokéAPI
https://pokeapi.co

Ferramentas

Node.js (servidor local)

Fetch API

Modularização ES Modules

Arquitetura do Projeto

O projeto segue uma arquitetura modular inspirada em padrões utilizados em aplicações modernas.

src
│
├── js
│   ├── controllers
│   │   └── battleController.js
│   │
│   ├── services
│   │   ├── pokeService.js
│   │   ├── typeService.js
│   │   ├── battleService.js
│   │   └── battleEngine.js
│   │
│   ├── ui
│   │   ├── arenaView.js
│   │   ├── battleView.js
│   │   ├── modalView.js
│   │   └── slotManager.js
│   │
│   └── main.js
│
└── css
    ├── base.css
    ├── components.css
    ├── battle.css
    ├── layout.css
    └── responsive.css
Camadas da Aplicação
UI Layer

Responsável pela interface e interação com o usuário.

Arquivos:

arenaView.js

battleView.js

modalView.js

slotManager.js

Responsabilidades:

renderizar componentes

atualizar DOM

mostrar resultados da batalha

gerenciar modais e slots de cartas

Controller Layer

Responsável por coordenar o fluxo da aplicação.

Arquivo:

battleController.js

Funções:

iniciar batalhas

coletar cartas selecionadas

chamar o motor de batalha

enviar resultado para a interface

Service Layer

Responsável pela lógica e comunicação com APIs externas.

Arquivos:

pokeService.js
typeService.js
battleService.js
battleEngine.js

Funções:

pokeService

Comunicação com a PokéAPI

buscar dados de Pokémon

transformar resposta da API em estrutura utilizável

typeService

Gerencia interações entre tipos de Pokémon.

Exemplo:

fogo > planta

água > fogo

Permite adicionar regras de vantagem estratégica.

battleEngine

Motor principal da batalha.

Responsável por:

calcular atributos

comparar cartas

determinar vencedor

battleService

Orquestra o fluxo da batalha entre:

dados da API

motor de batalha

controller

Fluxo de Execução

Fluxo simplificado da aplicação:

Usuário seleciona Pokémon
        ↓
slotManager registra seleção
        ↓
battleController inicia batalha
        ↓
pokeService busca dados da API
        ↓
battleEngine calcula resultado
        ↓
battleView exibe vencedor
Estrutura Visual

A interface foi pensada para remeter aos jogos de cartas clássicos.

Componentes principais:

área de seleção de cartas

arena de batalha

resultado da rodada

modais de seleção de Pokémon

O layout foi construído para ser responsivo e modular, permitindo expansão futura.

Como Executar o Projeto
1. Clonar o repositório
git clone https://github.com/seu-usuario/pokemon-card-battle.git
2. Entrar na pasta
cd pokemon-card-battle
3. Instalar dependências (se houver)
npm install
4. Executar servidor local

Caso esteja usando Node:

node server.js

Ou com extensão Live Server no VSCode.

5. Abrir no navegador
http://localhost:3000
Melhorias Futuras

Possíveis evoluções do projeto:

sistema de pontos por rodada

múltiplas batalhas em sequência

ranking de jogadores

animações de batalha

sistema de decks

persistência de partidas

modo multiplayer

Aprendizados Técnicos

Durante o desenvolvimento deste projeto foram praticados conceitos importantes como:

consumo de APIs REST

modularização em JavaScript

organização de código em camadas

separação de responsabilidades

estruturação de lógica de negócio

manipulação dinâmica do DOM