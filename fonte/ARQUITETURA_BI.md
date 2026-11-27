# Arquitetura de BI — Painel de Destacamento (modelo padrão para vários destacamentos)

Proposta de 27/11/2026 (horário de Brasília). Ela pede aprovação do Matheus: nenhuma estrutura de planilha atual foi alterada.

## 1. Princípios
1. **As planilhas são o backend e a única fonte da verdade.** O painel (HTML) só lê e exibe. Não guarda cópia de dado nem número fixo, e não faz cálculo sem rastreio.
2. **Todo número tem origem rastreável:** planilha → aba → coluna → linha (ID). Cada mudança de número vem de uma extração lançada na planilha por uma rotina, com registro no LOG.
3. **A leitura é por cabeçalho, nunca por posição.** Nenhuma regra depende da ordem das linhas; tudo é filtrado e ordenado por data no momento da leitura. O painel já lê por nome de coluna (`tabela()`) e a reordenação da aba REGISTROS às 23h41 de 26/11 não alterou nenhum número.
4. **Parâmetros ficam na aba CONFIG**, nunca no código: IDs, unidade, município, metas, efetivo, horários e limites.
5. **Portão de publicação:** só publica se a conferência automática der OK 100%.
6. **Sem dado pessoal desnecessário no painel público** (CPF nunca).

## 2. Inventário das planilhas atuais e problemas de estrutura
| Planilha (ID) | Uso | Problemas de estrutura |
|---|---|---|
| REDS <MÊS> <ANO> - M0876 - ANÁLISE (`1lK8…`, nov/26) | REDS do mês e análises | Uma planilha por mês. REGISTROS sem ID de linha nem data de lançamento, com a ordem alterada à mão. Abas derivadas (PRODUTIVIDADE, PONTOS QUENTES, RESUMO DO MÊS, METAS) gravadas como valor, não por fórmula. RESUMO DO MÊS mistura resumo com texto livre. BACKUP CRIMES dentro da planilha. Datas em texto dd/mm/aaaa. Municípios sem acento. |
| CONTROLE OPERAÇÕES POG 2026 (`1Ldrl…`) | operações do mês e CONFIG | Uma aba por mês (JANEIRO…DEZEMBRO). Colunas variam entre meses (5 ou 9). A coluna A da aba NOVEMBRO não tem cabeçalho. Abas ocultas (REFERÊNCIA, CONTROLE PREVENTIVA). A CONFIG fica junto da tabela de fatos e só cobre parte dos IDs. |
| CONTROLE - TURNO DE SERVIÇO (respostas) (`1SnbiJ…`) | turnos (formulário) | Respostas do Forms com colunas fixas lidas por letra (B:C, D:G, H:O, R, U, X, Y). O Nº PM digitado não identifica o militar. A aba inteira é protegida. |
| 11 - ESCALA DE NOVEMBRO (`1UzOJ…`) | escala do mês | Formato matriz (militar × dia), não formato longo. Uma planilha por mês, com 23 abas antigas ocultas e versões "RETIFICADA/ATUALIZADA". Legenda e horários dentro da aba. Lida pelo intervalo fixo A1:AG60. |
| ABASTECIMENTO - ÁGUA BOA (`1rurj…`) | abastecimento | Uma aba por mês desde 2024, com número de colunas variável (13 a 27). Lida pelo intervalo fixo A1:J80. Aba TOTAL misturada. |
| FÉRIAS - ÁGUA BOA (`1-aZ2…`) | férias e licenças | Uma aba por ano e abas auxiliares (MESES, CONFLITOS) no mesmo arquivo. |
| LOG DE LANÇAMENTOS (`1n1Go…`) | auditoria das rotinas | Boa estrutura (data, sistema, rotina, o que foi lançado, protocolo, situação, motivo). Falta um ID de execução e o campo "planilha/aba/linha" afetado. |
| CONFIG (aba em CONTROLE OPERAÇÕES) | parâmetros por mês | Cobre só ID ESCALA, abas de abastecimento, ID OPERAÇÕES, ID REDS, ABA METAS e OBSERVAÇÃO. Outros IDs estão fixos no Code.gs. |

## 3. Modelo-alvo (por destacamento)
Um arquivo **BASE <UNIDADE>** (por exemplo BASE M0876) com tabelas em formato longo. Cada tabela tem ID único na coluna A e cabeçalho na linha 1, sem células mescladas. Datas são valores de data, não texto. Há validação por lista e o arquivo é ano a ano, nunca mês a mês: o mês é uma coluna.

### 3.1 Tabelas-fato
| Tabela | ID | Colunas principais (tipo) |
|---|---|---|
| F_REDS | NUM_REDS (texto, chave natural) | DATA_FATO (data), HORA_INI/HORA_FIM (hora), TIPO (lista), COD_NATUREZA (→ D_NATUREZAS), MUNICIPIO (lista), LOCAL_ID (→ D_LOCAIS), MAT_RESP (→ D_MILITARES), SITUACAO_REGISTRO (aberto/fechado), FONTE_EXTRACAO (PDF/resumo), EXTRAIDO_EM (data-hora), ROTINA_ID |
| F_REDS_PARTICIPANTES | NUM_REDS+MAT | papel (lista) |
| F_OPERACOES | ID_OP | DATA, COD_DIAO, INDICADOR (lista), NUM_REDS, HORA_INI/FIM, MAT_RESP, CONTA_META (sim/não), MOTIVO_NAO_CONTA |
| F_PREVISTO | ID_PREV | DATA, COD_PREVISTO, EQUIPE/TURNO, LOCAL, HORARIO, FONTE (cronograma/nota da escala), NUM_REDS_CUMPRIU, STATUS (lista: Cumprido/Parcial/Não registrado/Código divergente) |
| F_TURNOS | ID_RESPOSTA | DATA, MAT, VIATURA_ID, HORA_INI/FIM, NA_ESCALA (sim/não), MOTIVO, LANCADO_SIDS |
| F_ESCALA | DATA+MAT | COD_ESCALA (→ D_CODIGOS) |
| F_ABASTECIMENTO | ID_ABAST | DATA, VIATURA_ID, MAT, LITROS, VALOR, ODOMETRO, SIAD_SEQ, LANCADO_SIAD |
| F_AFASTAMENTOS | ID | MAT, TIPO (férias/licença), INICIO, FIM |
| F_CONFERENCIA_REDS | DATA_CONFERIDA | CONSULTA_EM, QTD, OBS |

### 3.2 Dimensões
- **D_MILITARES**: MAT, NOME_GUERRA, POSTO, SITUACAO (ativo/inativo), FRACAO.
- **D_VIATURAS**: ID, PLACA, MODELO, CAPACIDADE_TANQUE, SITUACAO.
- **D_NATUREZAS**: COD, NOME, GRUPO_CRIME, INDICADOR_META, ROTULO_EXIBICAO. Aqui fica o Y15099 = "Atividade rural".
- **D_CODIGOS_ESCALA**: COD, HORA_INI, HORA_FIM, HORAS, PRE_TURNO, TIPO (serviço/afastamento).
- **D_LOCAIS**: ID, NOME_OFICIAL, VARIANTES, ZONA, SETOR, LAT, LON.
- **D_CALENDARIO**: DATA, ANO_MES, DIA_SEMANA, FERIADO.
- **D_METAS**: ANO_MES, SIGLA, META, CODIGOS.

### 3.3 Abas de resumo
Ficam separadas e só por fórmula (QUERY/COUNTIFS) a partir das tabelas-fato: R_METAS, R_PRODUTIVIDADE, R_PONTOS_QUENTES, R_RESUMO_MES. Não se grava valor à mão nelas.

### 3.4 CONFIG (uma linha por parâmetro; chave, valor e descrição)
- UNIDADE_SIDS (M0876), MUNICIPIO, NOME_DESTACAMENTO.
- ID_BASE, ID_FORM_TURNO, ID_ESCALA_<AAAA-MM>, PASTA_OPERACOES, PASTA_REDS.
- EFETIVO_PREVISTO, LIMITE_HORAS_MES (160), PRE_TURNO_H (0,5), DSP_HORAS_DIA.
- PRAZO_VT_DIAS, PONTO_QUENTE_MIN, REGISTROS_TURNO_MIN.
- URL_EXEC, URL_SITE.

### 3.5 Dicionário de dados (exemplo F_REDS; as outras tabelas seguem o mesmo padrão)
| Coluna | Tipo | Formato | Obrigatório | Validação |
|---|---|---|---|---|
| NUM_REDS | texto | AAAA-NNNNNNNNN-NNN | sim | regex `^\d{4}-\d{9}-\d{3}$`, único |
| DATA_FATO | data | dd/mm/aaaa | sim | dentro do ano da base |
| TIPO | texto | lista | sim | BO policial, RAT, BOS, BOS Amplo, BO trânsito, BO ambiental, TCO… |
| COD_NATUREZA | texto | X00000 | sim | existe em D_NATUREZAS |
| MUNICIPIO | texto | maiúsculas sem acento | sim | lista do CONFIG |
| MAT_RESP | texto | 7 dígitos | sim | existe em D_MILITARES (ou "outra unidade") |
| SITUACAO_REGISTRO | texto | lista | sim | aberto/fechado/encerrado |
| EXTRAIDO_EM | data-hora | dd/mm/aaaa hh:mm | sim | ≤ agora |

### 3.6 Convenção de nomes
- Arquivo: `BASE <UNIDADE> <ANO>`.
- Abas: `F_*` fatos, `D_*` dimensões, `R_*` resumos, `CONFIG`, `LOG`.
- Colunas: MAIÚSCULAS, sem acento e com `_`.

## 4. Extração padronizada (todas as rotinas)
Toda rotina (R1 REDS, R2 análise, turnos/SIDS, SIAD, escala) grava no **mesmo formato**:
1. Lê a fonte (SIDS/REDS, formulário, SIAD).
2. Gera linhas exatamente com as colunas da tabela-fato.
3. Valida (dicionário de dados).
4. **Só acrescenta.** Uma correção é uma nova linha com o mesmo ID e EXTRAIDO_EM mais recente; a leitura pega a última.
5. Grava no LOG uma linha por execução (ROTINA_ID, tabela, linhas acrescentadas, rejeitadas e motivo).
6. Roda a conferência.

Item fora do padrão não entra: vai para o LOG com o motivo.

## 5. Validações e camada de conferência
- **Na planilha:** validação de dados (listas, datas, regex), proteção das abas de resumo e formatação condicional para ID duplicado.
- **No servidor (Code.gs):** lê por cabeçalho e até a última linha (sem `A1:J80`), devolve `_avisos` por coluna faltando e `_conta` (linhas por tabela).
- **Conferência automática** (`ferramentas/conferir_painel.py`): planilhas × `/exec` × site, dia a dia, com portão OK 100%. Está descrita em Rotinas/CONFERENCIA_PAINEL.md.

## 6. Clonar para um destacamento novo
1. Copiar o arquivo-modelo `BASE MODELO <ANO>` (abas vazias, com validações e fórmulas) para a pasta do destacamento.
2. Preencher a CONFIG: unidade, município, IDs, efetivo, metas e URLs.
3. Preencher as dimensões D_MILITARES, D_VIATURAS, D_LOCAIS e D_CODIGOS_ESCALA. D_NATUREZAS e D_CALENDARIO vêm do modelo.
4. Criar uma cópia do Apps Script (Code.gs padrão, sem ID fixo: só `ID_CONFIG` nas Propriedades do script) e implantá-lo como app da Web.
5. Gerar o HTML com `montar.py --config <arquivo>`, que injeta só a URL do /exec e o nome. Publicar em um repositório/pasta próprio.
6. Ativar as rotinas R1/R2/turno/SIAD apontando para a CONFIG nova e a conferência das 8h45.
7. Rodar a conferência; publicar só com OK 100%.

## 7. Plano de migração (sem apagar dado)
1. Criar `BASE M0876 2026` nova, sem tocar nas planilhas atuais.
2. Script de cópia: ler as planilhas atuais por cabeçalho, converter para formato longo (escala em matriz → F_ESCALA; abas mensais → uma tabela com ANO_MES) e gravar na base nova.
3. **Verificação de contagem:** para cada origem, número de linhas e soma de campos-chave (REDS por dia, litros por mês, turnos por militar) iguais na base nova e na antiga. O relatório vai para o LOG.
4. O painel passa a ler a base nova por uma chave na CONFIG (`FONTE=BASE`), com a conferência rodando nas duas fontes por um mês.
5. As planilhas antigas viram somente leitura e ficam como histórico. Nada é apagado.

## 8. O que já segue este padrão na v4.4.5 (teste)
- Sem dado embutido: cópias da CONFERÊNCIA e do Controle de Operações Diárias e tabela fixa de Nº PM removidas.
- O calendário lê a previsão do documento e o cumprimento só da planilha (R2), sem cálculo no navegador.
- As METAS vêm da aba METAS.
- Os demais itens fixos estão listados em AUDITORIA_HARDCODE_v445.md, com destino na CONFIG (dependem do Code v4.4.0, a ser aprovado e implantado pelo Matheus).
