# Registro on-chain — Trayon

Este arquivo lista **somente** o que foi conferido direto na blockchain.
Cada linha tem endereço ou hash que qualquer pessoa pode abrir no Polygonscan.

- **Rede:** Polygon PoS mainnet (chain id 137)
- **Conferido em:** 13/11/2026, bloco ~97.263.000
- **Como conferir de novo:** leitura pública via RPC (`totalSupply`, `balanceOf`, `owner`, `eth_getCode`, `eth_getTransactionByHash`)

> Se algum documento disser algo diferente deste registro, vale o que está na blockchain.

---

## Carteiras

| Papel | Endereço | Observação |
|---|---|---|
| Carteira de deploy (dona de tudo abaixo) | [`0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f`](https://polygonscan.com/address/0x9efFA566D5d2FF1bD1D3AC0902f19D72Fc2F0f0f) | É `owner` do TRAY v1, dos vaults e da BridgeL1. Saldo de TRAY v1: 0. **A chave dessa carteira esteve em texto puro em arquivos do projeto — trocar.** |
| Dona do token antigo (TRAYON 21M) | [`0xd0c5ed74b306b504fa2a62ff62284ccbe6232ade`](https://polygonscan.com/address/0xd0c5ed74b306b504fa2a62ff62284ccbe6232ade) | Carteira do fundador. Recebeu a posse do token depois do hack da carteira original. |
| ⛔ Carteira original (comprometida) | [`0x99e519c1Dff179011541907Ea3d81232d397aaF1`](https://polygonscan.com/address/0x99e519c1Dff179011541907Ea3d81232d397aaF1) | Criou o token de 21M e fez os deploys na Amoy. **Hackeada — nunca enviar nada para ela.** |

## Tokens

| Token | Endereço | Supply hoje | Situação |
|---|---|---|---|
| **TRAYON (TRAY) — OFICIAL** | [`0x6b62514E925099643abA13B322A62ff6298f8E8A`](https://polygonscan.com/token/0x6b62514E925099643abA13B322A62ff6298f8E8A) | 21.000.000 | **Token oficial do projeto** desde 13/11/2026 (teto fixo de 21M). Detalhes na seção abaixo. |
| TRAY v1 (1B) | [`0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b`](https://polygonscan.com/token/0x424524F4012f32a8815f0cF37Eb8A3FCbF89260b) | 1.000.000.000 | **Não oficial / descontinuado.** Distribuído nos 6 vaults abaixo; não deve ser vendido nem listado. |
| TRAY v2 (duplicado) | [`0xA9308dfaDCCccbf744c08109b5949CAB5E5d6125`](https://polygonscan.com/token/0xA9308dfaDCCccbf744c08109b5949CAB5E5d6125) | 150.000.000 | **Descartado.** 850M queimados; os 150M restantes estão presos no TokenomicsManager abaixo. Não usar. |

## Token oficial TRAYON (21M)

- **Contrato:** `TRAYONToken`, código verificado no Polygonscan em 09/05/2025. ERC-20 simples, não atualizável, sem taxa, pausa ou lista negra.
- **Deploy:** 10/05/2025, bloco 71.325.777. Os 21.000.000 foram criados de uma vez para a carteira original `0x99e5…aaF1`.
- **Hack (23/08/2026):** a carteira original foi comprometida. O invasor levou 1.896.870,64 TRAY e todo saldo que chegava nela.
- **Resposta (25/08/2026):** a posse do token foi passada para `0xd0c5…2ade` e os tokens em poder do invasor foram queimados com `burnFrom`.
- **Resgate (13/11/2026):** a posse dos contratos que guardavam tokens foi retirada da carteira comprometida e passada para `0xd0c5…2ade` ([tx](https://polygonscan.com/tx/0x29554531d0686468979eb6eec83ea58a48880f03cc8d766089917120ef177cc1)).
- **Reposição (13/11/2026):** os 1.896.870,64 TRAY queimados foram recriados na tesouraria ([tx](https://polygonscan.com/tx/0xc756957c5e8e1d12bf72fae9b583db000deac7c7acd2c616beb3da0cd6a2de85)). O supply voltou a 21.000.000.

| Parâmetro (lido na blockchain) | Valor | O que significa |
|---|---|---|
| `MAX_SUPPLY` | 21.000.000 | Teto fixo no código. Nunca pode passar disso. |
| `totalSupply` | 21.000.000 | Supply completo |
| `owner` | `0xd0c5…2ade` | Carteira do fundador |
| `isFinalized` | `false` | `finalize()` desativaria o `mint` para sempre. |
| `burnFrom` | só o dono, **sem autorização do holder** | O dono pode queimar o saldo de qualquer endereço. Foi o que permitiu recuperar o controle no hack, mas exchanges e ferramentas de risco classificam isso como risco alto. Some com `renounceOwnership()`. |

### Contratos que guardam TRAYON

| Contrato | Endereço | Saldo | Dono hoje |
|---|---|---|---|
| Tesouraria (carteira) | `0xd0C5ED74b306b504Fa2A62Ff62284cCBE6232aDe` | 5.877.478,19 | — |
| Staking | `0xCae7c27EfeA755f7671945Cd89A3bFC91d882ac5` | 3.507.000 | `0xd0c5` |
| Liquidez | `0xd6f040cc6795E62fF75eD2dC9e4Da7a30016D18e` | 3.003.000 | `0xd0c5` |
| Timelock | `0xb202530e63a66b46625d5f96396Db09C2001707B` | 3.003.000 | `0xd0c5` |
| Vesting | `0x2F972CA3e5dE50d9232bb6Ddab6365dfbd9E4AEd` | 2.940.000 | `0xd0c5` |
| Distribuidor | `0x85985ecfd13492bfb75d85Aa07015371e8d1Af44` | 2.457.000 | `0xd0c5` |
| Indicação (referral) | `0x603091127e4c790917de64b5aaa260bdd3c2c0f9` | 0 | ⛔ carteira comprometida. Os 1.491.000 que estavam travados aqui (o contrato não tem função para movê-los) foram queimados e recriados na tesouraria em 14/11/2026 ([queima](https://polygonscan.com/tx/0xccda6d3091545210607e5426c04f7008996b7b9c9254c564dba21640cb3a1452), [reposição](https://polygonscan.com/tx/0x797aef5c5c3bc9a23784394c6cb86595740dfef4cd05b4f97ed314dc13d77e7b)). |
| Pool QuickSwap TRAY/USDT | `0x3e030feffd9f9a549f73b41c9530587735096348` | ~12 | — (liquidez quase nula) |

Em circulação com holders: ~212.522 TRAY (1,01%) em ~65 endereços.

### Contratos antigos — NÃO USAR

| Contrato | Endereço | Situação |
|---|---|---|
| Pré-venda | `0x0c9C7433B3e6E9823F0c09A1531c25EAcf1f8ed3` | Vazia. O dono continua sendo a carteira comprometida (o contrato não permite trocar). **Nunca enviar tokens para ela.** |
| Venda de tokens (mais antiga) | `0xc75ed5c54e7c57e51cb470487481f1889cca53ea` | Vazia. Dono: carteira comprometida. **Nunca enviar tokens para ela.** |

**Decisões em aberto:** finalizar o `mint`, passar a posse para um multisig e criar uma pré-venda nova.

## Contratos com fundos (TRAY v1)

| Contrato | Endereço | Saldo TRAY v1 |
|---|---|---|
| InitialLaunchVault | [`0x32A24A3e4cEe7Dd26FE6Fe0dEa74418F4fD8db4B`](https://polygonscan.com/address/0x32A24A3e4cEe7Dd26FE6Fe0dEa74418F4fD8db4B) | 249.999.987,47 |
| DAOTreasuryVault | [`0xCb38e83295E1AB4FC3eE05D6E03DF88F9F07B750`](https://polygonscan.com/address/0xCb38e83295E1AB4FC3eE05D6E03DF88F9F07B750) | 249.999.987,47 |
| ValidatorsStakingPool | [`0x02CA03257054B13DADc1886088662377DFF1d86d`](https://polygonscan.com/address/0x02CA03257054B13DADc1886088662377DFF1d86d) | 199.999.989,98 |
| DevelopmentVesting | [`0x118F37A9568891A4Af341b5333C4E02646afBa49`](https://polygonscan.com/address/0x118F37A9568891A4Af341b5333C4E02646afBa49) | 149.999.992,48 |
| PartnershipsTreasury | [`0x92aC56F6175320A36F2cb1E06f39702530b44366`](https://polygonscan.com/address/0x92aC56F6175320A36F2cb1E06f39702530b44366) | 99.999.994,99 |
| StrategicReserve | [`0xdC5b3935D6ABd4c8BF80A25D300970a27A66c5Bd`](https://polygonscan.com/address/0xdC5b3935D6ABd4c8BF80A25D300970a27A66c5Bd) | 49.999.997,50 |
| BridgeL1 | [`0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9`](https://polygonscan.com/address/0x6ACdf6bfA39B38441AbEBD4c1461A1a9aD8070C9) | 0,10 (depósito de teste) |
| TokenomicsManager (do TRAY v2) | [`0x2b4b6817E53958C9aCE79DB4552a2cdC3f848768`](https://polygonscan.com/address/0x2b4b6817E53958C9aCE79DB4552a2cdC3f848768) | 150.000.000 de TRAY **v2** (presos) |

Soma nos vaults + bridge: ~999.999.950 TRAY v1 (cerca de 50 TRAY de diferença para 1B, provavelmente arredondamento nas transferências).

**Não existe BridgeL2 em nenhuma rede real. Não existe chain Trayon própria.**

## Vaults vazios (não usar)

Um segundo deploy dos 6 vaults foi feito sem transferir tokens. Os contratos existem, mas estão vazios.
Atenção: é este conjunto que aparece em `contracts/broadcast/Transfer6VaultsFlexible.s.sol/137/run-latest.json`.

| Contrato | Endereço vazio |
|---|---|
| InitialLaunchVault | `0x141fcc645e6dbf1e0ade244385df93310497969d` |
| DAOTreasuryVault | `0xd48491c9d6ef56ccac0bc1cf255c810b8a9f8526` |
| ValidatorsStakingPool | `0x00f90c09994902e38b5d704f72b8881a063f5fe3` |
| DevelopmentVesting | `0x79d8c2e12721218b75a4d7ef98f87e7ca5c241fb` |
| PartnershipsTreasury | `0xc99d4e6f4840395695f42ccd1ee8fbb4bd076a23` |
| StrategicReserve | `0x627be30be82f0369286ec195ad8111e4b387134e` |

## Transações citadas em documentos antigos

| Hash | Dizia ser | Resultado da verificação |
|---|---|---|
| [`0xcb4c77e0…bf75603`](https://polygonscan.com/tx/0xcb4c77e0fd8953bebbb4de53ed10f03c90d6336d573c3874ad4514a3ebf75603) | Queima de 850M de TRAY v2 | ✅ Existe (bloco 92.619.240) |
| `0x00eb699ddb680b7f8f4454a640f5bcbf1e49dd366df346a906c87d8a7a2bb95c` | "Distribuição exata" | ❌ **Não existe** em nenhum dos 3 RPCs testados |
| `0x1990a5ad297124531c8c388298a74598b244064a6f82127feb75a8986c8d22d9` | "Transferência de 150M" | ❌ **Não existe** em nenhum dos 3 RPCs testados |

## Testnet (Polygon Amoy, chain 80002) — só pelos arquivos de broadcast, não reconferido

| Contrato | Endereço |
|---|---|
| TRAY | `0x60c872232Ef71BAf3237087b7BdD5b1a43896F3A` |
| BridgeL1 | `0xd9e51fa118c8f32070ff65bf1ce31212decdd8cb` |
