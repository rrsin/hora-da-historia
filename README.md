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

## Docker

Each side has its own `Dockerfile`; `docker-compose.yml` wires them together
(nginx in the client container proxies `/api/*` to the server container over
Docker's internal network, so there's no hardcoded hostname).

```bash
docker compose up --build
# app on http://localhost:8080, API on http://localhost:4000
docker compose exec server npm run seed   # first run only
```

The SQLite file lives on a named volume (`stories-data`), not inside the
image, so `docker compose down` (without `-v`) keeps your data.

### Getting it onto the Raspberry Pi

Two options:

1. **Build directly on the Pi** — clone the repo, run `docker compose up
   --build` as above. Simplest, but compiling `better-sqlite3`'s native
   addon on a Pi is slow (a few minutes).
2. **Pull prebuilt images from CI** (recommended) — the GitHub Actions
   pipeline below builds `linux/arm64` images and pushes them to GHCR.
   On the Pi, edit `docker-compose.pi.yml` to put in your GitHub
   owner/repo, then:
   ```bash
   docker compose -f docker-compose.pi.yml pull
   docker compose -f docker-compose.pi.yml up -d
   docker compose -f docker-compose.pi.yml exec server npm run seed
   ```

## CI/CD (`.github/workflows/ci.yml`)

- **Every push/PR**: installs deps, builds the client, sanity-checks the
  server files, boots the server against a throwaway SQLite file and hits
  `/api/characters` to confirm it actually responds.
- **On push to `main`**: additionally builds multi-arch (`amd64` + `arm64`)
  Docker images via QEMU/buildx and pushes them to
  `ghcr.io/<owner>/<repo>-server` and `ghcr.io/<owner>/<repo>-client`.
  Uses the built-in `GITHUB_TOKEN`, so no extra secrets to configure — just
  make sure the repo's Actions settings allow package writes (Settings →
  Actions → General → Workflow permissions → "Read and write").
  By default GHCR packages are private; either make them public or run
  `docker login ghcr.io` on the Pi with a personal access token that has
  `read:packages`.

## Scripts úteis

| comando (dentro de `server/`) | o que faz |
|---|---|
| `npm run seed` | limpa e volta a semear personagens + cenários |
| `npm run reset` | apaga todas as tabelas e recria vazias |
| `npm run reset -- --seed` | apaga, recria e semeia de seguida |
| `npm start` | arranca a API em produção |
| `npm run dev` | arranca a API com reload automático |
