# Trayon

**Trayon** é um protocolo para auditoria e veracidade de dados on-chain, combinando blockchain e inteligência artificial.

**Objetivo:** TRAY como moeda nativa de uma chain própria (Polygon CDK), com um oráculo de dados validado por IA.

> **Estado atual:** o token TRAY existe como ERC-20 na Polygon PoS, distribuído em 6 vaults. A chain própria ainda não foi iniciada.
> Detalhes e provas em **[STATUS.md](STATUS.md)** e **[REGISTRO_ONCHAIN.md](REGISTRO_ONCHAIN.md)**.

---

## Comece aqui

| Para | Leia |
|---|---|
| Saber o que está pronto de verdade | [STATUS.md](STATUS.md) |
| Endereços e transações na blockchain | [REGISTRO_ONCHAIN.md](REGISTRO_ONCHAIN.md) |
| Entender a visão do projeto | [docs/visao/](docs/visao/) (whitepaper, arquitetura, tokenomics, roadmap) |
| Parcerias | [docs/negocios/](docs/negocios/) |
| Rodar o projeto localmente | [LOCAL_SETUP.md](LOCAL_SETUP.md) |
| Rodar testes | [TESTING_GUIDE.md](TESTING_GUIDE.md) |
| Publicar o site na Vercel | [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) |
| Segurança de chaves | [docs/SECURITY.md](docs/SECURITY.md) |

---

## Estrutura do repositório

```
trayon.org/
├── web/                 Site, docs e dashboard (Next.js) — publicado na Vercel
├── contracts/           Contratos Solidity (Foundry)
│   ├── src/             Código dos contratos
│   ├── test/            Testes
│   ├── script/          Scripts de deploy (inclui os usados na mainnet)
│   └── flattened/       TRAY achatado, para verificação no Polygonscan
├── backend/             API (Express + TypeScript) — protótipo
├── relayer/             Relayer da bridge L1↔L2 — protótipo
├── validator/           Nó validador — esqueleto
├── services/ai-engine/  Motor de IA (FastAPI + Celery) — protótipo
├── docs/
│   ├── visao/           Whitepaper e roadmaps (plano, não status)
│   └── negocios/        Materiais de parceria
├── STATUS.md            Estado real, com provas
└── REGISTRO_ONCHAIN.md  Endereços e transações conferidos na blockchain
```

---

## Links

- Site: https://trayon.org
- Docs: https://docs.trayon.org
- App: https://app.trayon.org
- Contato: partnerships@trayon.org
