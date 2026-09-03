# Histórias da Noite — gerador de histórias para adormecer

Node.js/Express + SQLite no backend, React (Vite) no frontend. Node/React foi
escolhido para variar em relação ao stack Python + Vue que já usas noutro
container do Raspberry Pi.

## Estrutura

```
bedtime-story-app/
  server/     API Express + base de dados SQLite
    schema.sql   esquema das tabelas characters/scenarios
    db.js        liga à base de dados (cria o esquema se não existir)
    seed.js       npm run seed   -> apaga e semeia dados de exemplo em PT
    reset.js      npm run reset  -> apaga TODAS as tabelas e recria vazias
                  npm run reset -- --seed  -> apaga, recria e semeia de seguida
    server.js     API REST (personagens, cenários, geração de histórias)
  client/     interface React
    src/components/StoryMode.jsx        modo "criança": escolher personagens, ver a história
    src/components/AdminCharacters.jsx  CRUD de personagens
    src/components/AdminScenarios.jsx   CRUD de cenários/templates
```

## Como correr

Precisas de Node 18+ instalado. Isto foi só gerado como código — os
`node_modules` não estão incluídos, por isso corre `npm install` em cada
pasta primeiro.

```bash
# 1. backend
cd server
npm install
npm run seed        # popula a BD com personagens e cenários de exemplo
npm start            # corre em http://localhost:4000

# 2. frontend, noutro terminal
cd client
npm install
npm run dev           # corre em http://localhost:5173 e faz proxy para a API
```

Abre http://localhost:5173. O separador "Contar história" é o que a criança
usa; "Personagens" e "Cenários" são os ecrãs de administração para tu
construíres a base de dados.

## Modelo de dados

- **characters** — nome, espécie, personalidade, descrição (usada como
  contexto quando pedires a um LLM para escrever novos cenários), cor e
  emoji para o avatar.
- **scenarios** — templates de texto com placeholders `{char1}`, `{char2}`,
  `{char3}`, mais `mood` (aventura/calma/engraçada/amizade) e
  `num_characters` (quantas personagens o template espera).

Quando a criança escolhe N personagens, a API escolhe ao acaso um cenário
com `num_characters = N` e substitui os placeholders pelos nomes, pela
ordem em que foram escolhidas.

## Gerar novos cenários com um LLM

O `seed.js` já inclui 8 cenários de exemplo escritos à mão. Para expandir o
banco de histórias: gera novos templates offline com um LLM (dás-lhe as
descrições das personagens como contexto), e insere-os através do ecrã
"Cenários" na app, ou adiciona-os diretamente ao array `scenarios` em
`seed.js` e corre `npm run reset -- --seed`.

## Scripts úteis

| comando (dentro de `server/`) | o que faz |
|---|---|
| `npm run seed` | limpa e volta a semear personagens + cenários |
| `npm run reset` | apaga todas as tabelas e recria vazias |
| `npm run reset -- --seed` | apaga, recria e semeia de seguida |
| `npm start` | arranca a API em produção |
| `npm run dev` | arranca a API com reload automático |
