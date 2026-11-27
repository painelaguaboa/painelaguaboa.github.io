# Auditoria de valores fixos (hardcode) — Painel Água Boa v4.4.5 (27/11/2026, horário de Brasília)

Regra do Matheus (27/11): planilhas = única fonte da verdade; o painel só lê e exibe; sem dado embutido; parâmetro só pela aba CONFIG.
Legenda da ação: **MIGRADO** (já na v4.4.5 de teste) · **CONFIG** (criar o campo na aba CONFIG; para o servidor usar o campo, precisa do Code v4.4.0, que está proposto e não implantado) · **MANTIDO** (com justificativa).

| # | Onde | Valor fixo | De onde deveria vir | Ação |
|---|---|---|---|---|
| 1 | montar.py (só teste) → `window.PA_REDS_CONF_TESTE` | cópia da aba CONFERÊNCIA (17–25/11) | REDS do mês, aba CONFERÊNCIA (o servidor já envia `reds_conf`) | **MIGRADO**: removido |
| 2 | montar.py (só teste) → `window.PA_OPD_TESTE` | cópia do Controle de Operações Diárias de novembro | Doc da pasta 07 (o servidor já envia `opdiarias`) | **MIGRADO**: removido |
| 3 | parts/config_head.js `PA_MIL_NPM` | tabela nome → Nº PM de 14 militares | servidor `mil_npm`, lido da planilha | **MIGRADO**: tabela fixa removida (`{}`); vale só o servidor |
| 4 | calendário (`dash.calc('calendario')`) | dias sem linha na aba CARTÃO PROGRAMA x REDS = "sem previsão" | Controle de Operações Diárias (`opdiarias`) + aba CARTÃO PROGRAMA x REDS (R2) | **MIGRADO**: previsão do documento; cumprimento só da planilha. Sem análise da R2, o dia fica "Aguardando REDS" e nada é calculado no navegador |
| 5 | calendário, `hoje` | data em UTC (`toISOString`) | relógio no horário de Brasília | **MIGRADO**: data de Brasília |
| 6 | `dash.calc('metas')` | REALIZADO e PROJEÇÃO calculados no navegador a partir dos REDS | aba METAS (colunas REALIZADO e PROJEÇÃO FIM DO MÊS, R2) | **MIGRADO**: usa a aba METAS; o cálculo antigo fica só como reserva quando a coluna estiver vazia, com a origem indicada |
| 7 | src `const METAS` | metas 15/1/1/1/24/4 e listas de códigos | aba METAS (SIGLA/META), que já prevalece | **MANTIDO** como reserva. Proposta: a conferência acusa mês sem aba METAS; depois disso, remover |
| 8 | src `const ALERTAS` | prazo VT 2 dias, ponto quente 2, 80% de registros por turno | aba METAS (PRAZO_VT_DIAS já é lido) / CONFIG | **CONFIG**: PONTO_QUENTE_MIN e REGISTROS_TURNO_MIN |
| 9 | src grade/carga `H`, `HOR`, `FIM` | horas e horários por código (2/3 = 10 h 08–18 etc.) | legenda da aba da escala (já lida em parte) | **CONFIG**: aba LEGENDA_CODIGOS (código, início, fim, horas, pré-turno, tipo) |
| 10 | src carga `160` h e `PA_PRE_TURNO` 0,5 | limite mensal e pré-turno | regra legal (Lei 5.301/69) e regra do Destacamento | **CONFIG**: LIMITE_HORAS_MES e PRE_TURNO_H (hoje são regra estável) |
| 11 | config_head `PA_DSP_HORAS_DIA` | null (carga a definir) | legenda da escala (horário da DSP) ou CONFIG | **CONFIG**: DSP_HORAS_DIA |
| 12 | config_head `PA_MIL_EX` | 2 militares que saíram | dimensão MILITARES (coluna SITUAÇÃO = inativo) | **CONFIG**: aba MILITARES |
| 13 | config_head `PA_ROTULO_Y15099` e normalização Y15099 | rótulo "Atividade rural" | dimensão NATUREZAS/REFERÊNCIA (rótulo de exibição) | **MANTIDO**: decisão do Matheus de 18/11; migrar para a dimensão NATUREZAS |
| 14 | src `METAS.municipio='AGUA BOA'` e textos "Água Boa" | município do Destacamento | CONFIG: MUNICIPIO, UNIDADE (M0876) | **CONFIG** (necessário para outros destacamentos) |
| 15 | src `BAIRRO()` | correções CURUMIN→CURUMIM, IMBURANA→UMBURANA etc. | dimensão LOCAIS (nome oficial + variantes) | **CONFIG** (aba LOCAIS) |
| 16 | montar.py `window.PA_GEO` (34 kB) | comunidades com lat/lon | planilha base geográfica (pasta 07) | **MANTIDO** por enquanto: é geometria estável. Proposta: o servidor lê a base e envia `geo` |
| 17 | Code.gs `PLAN_TURNOS`, `PLAN_ABAST`, `PLAN_CREDENC`, `PLAN_INT_CONF`, `PLAN_EVENTOS`, `PLAN_PRURAL`, `PASTA_OPERACOES`, `PLAN_OPS_2026` | IDs fixos (só ESCALA, OPERAÇÕES, REDS, CARGA e FÉRIAS vêm da CONFIG) | aba CONFIG (ID TURNOS, ID ABAST, ID CREDENC, ID INTENDÊNCIA, ID EVENTOS, ID PRURAL, PASTA OPERAÇÕES) | **CONFIG**: proposto no Code v4.4.0, não implantado (regra: servidor só com o Matheus) |
| 18 | Code.gs intervalos `abast A1:J80`, `escala A1:AG60`, `CONTROLE …3000` | limite de linhas | ler até a última linha (`getLastRow`) | **CONFIG/Code v4.4.0**: hoje cabe (abastecimento NOV 44 linhas; CONTROLE 1.215), mas é um risco silencioso |
| 19 | Code.gs patrulha rural `['2026-08'…'2026-11']`, `denominadoresEm:'2026-11-17'` | meses e data fixos | calendário/CONFIG | **CONFIG/Code v4.4.0** |
| 20 | Code.gs `ano === 2026 ? PLAN_OPS_2026` | ano fixo | CONFIG (ID OPERAÇÕES já existe por mês) | **Code v4.4.0**: só CONFIG |
| 21 | Scripts da R2 (`/workspace/reds-nov2026/analise/montar_abas.py`) | `hoje = datetime(2026, 11, 17)`, `datetime(2026, 11, dia)` | data de execução / mês da CONFIG | **A CORRIGIR** na padronização da extração (ARQUITETURA_BI.md §5). Hoje a R2 é feita pelo conector, mas o script do Drive está desatualizado |
| 22 | aba NOVEMBRO das operações | coluna A sem cabeçalho (só espaços) | cabeçalho "Nº REDS" | **PROPOSTA** (não alterar sem aprovação) |

Nenhum dado pessoal está nesta tabela.
