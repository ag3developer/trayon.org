# Status do projeto Trayon

**Atualizado em:** 13/11/2026

Regra deste arquivo: só é marcado como ✅ o que tem **prova** (link na blockchain, URL no ar ou teste passando).
Plano e visão ficam em [`docs/visao/`](docs/visao/), não aqui.

---

## Objetivo

TRAY como **moeda nativa** (gas token) de uma **chain própria da Trayon**, construída com Polygon CDK, com oráculo de dados por IA.

**Situação desse objetivo: não iniciado.** Não existe chain Trayon, nem configuração de CDK, nem nó rodando.
O que existe é um token ERC-20 na Polygon PoS (onde o gas é pago em POL).

---

## O que existe e funciona

| Item | Prova |
|---|---|
| ✅ Token TRAY v1 (1B) na Polygon mainnet | [REGISTRO_ONCHAIN.md](REGISTRO_ONCHAIN.md) |
| ✅ 6 vaults com o 1B distribuído | [REGISTRO_ONCHAIN.md](REGISTRO_ONCHAIN.md) |
| ✅ BridgeL1 implantada (só o lado L1) | [REGISTRO_ONCHAIN.md](REGISTRO_ONCHAIN.md) |
| ✅ Site, docs e whitepaper (7 idiomas) | https://trayon.org · https://docs.trayon.org |
| ✅ Conectar MetaMask e ver saldo nativo | https://app.trayon.org |
| ✅ TypeScript do `web/` compila sem erros | `cd web && npx tsc --noEmit` |
| ✅ TypeScript do `relayer/` compila sem erros | `cd relayer && npx tsc --noEmit` |

## O que existe só como código (não funciona de ponta a ponta)

| Componente | Situação real |
|---|---|
| Contratos (`contracts/src`) | 17 contratos escritos, 153 testes em 10 arquivos. **Os 6 vaults (que guardam os fundos) não têm testes.** Bugs conhecidos em PredictionMarket, TokenomicsManager, staking e DevelopmentVesting. Sem auditoria externa. Testes não rodados nesta máquina (Foundry não instalado). |
| Dashboard (`web/`) | Saldo nativo é real. Portfólio, ativos, gráfico e estatísticas são dados de exemplo. Botões Send/Bridge/Swap não fazem nada. Login no backend não roda no primeiro acesso (bug). |
| Backend (`backend/`) | Rotas devolvem valores fixos. Banco não conectado. `tsc` com 47 erros. Docker não builda (sem lockfile). |
| Relayer (`relayer/`) | Listeners e executores existem mas não estão ligados entre si. Multisig é só uma chave. Configurado com `DRY_RUN=true`. |
| Validador (`validator/`) | Consenso é um esqueleto (aceita qualquer bloco, sem estado). Dependências de P2P ausentes — não roda. |
| AI Engine (`services/ai-engine/`) | API e leitura de PDF/Excel reais. "IA" devolve resultado fixo. Sem registro on-chain. API não ligada aos workers. Sem testes. |
| Docker Compose | Os dois arquivos estão quebrados (arquivos e portas faltando). |

## O que não existe

- Chain Trayon (Polygon CDK) e TRAY como gas token
- BridgeL2 em qualquer rede real
- Governança / DAO on-chain
- Oráculo descentralizado com validadores reais
- CI (GitHub Actions), monitoramento, deploy de qualquer serviço de backend
- Auditoria externa de segurança
- Plano de migração do token antigo TRAYON (21M)

---

## Prioridades

1. **Segurança:** trocar a chave da carteira de deploy (esteve em texto puro em 9 arquivos) e passar a posse dos contratos para um multisig (Safe).
2. **Contratos:** instalar Foundry, testar os 6 vaults, corrigir os bugs conhecidos.
3. **Decisão de token:** o que fazer com o TRAYON antigo (21M), com o TRAY v1 (1B) e como chegar a um gas token nativo.
4. **MVP real:** dashboard lendo os contratos da Polygon; backend funcionando de verdade.
5. **Chain própria:** planejar Polygon CDK (ou outra stack) com TRAY como gas token.

---

## Limpeza feita em 13/11/2026

- Removidos ~120 documentos e scripts de status/deploy que se contradiziam ou afirmavam coisas falsas.
  Backup (com a chave privada removida): `Documentos/backup-trayon-limpeza-2026-11-13.zip`, fora do projeto.
- Documentos de visão e roadmap movidos para [`docs/visao/`](docs/visao/); materiais de parceria para [`docs/negocios/`](docs/negocios/).
- Restaurados os 7 scripts de deploy em `contracts/script/` (registro de como a mainnet foi implantada).
- `TRAY-FLATTENED.sol` movido de `contracts/src/` para `contracts/flattened/`.
