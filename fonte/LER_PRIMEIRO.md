# Fonte editável do Painel Destacamento Água Boa (v4.4.4 oficial)

## REGRAS DE CONFIABILIDADE (Matheus, 27/11/2026 — valem acima de tudo)
1. **As planilhas são o backend e a única fonte da verdade.** O painel só lê e exibe. É proibido dado embutido ou cópia no HTML e proibido número calculado fora das tabelas sem rastreio. Todo número do painel vem de uma extração lançada nas planilhas pelas rotinas, com registro no LOG.
2. **A leitura é por cabeçalho e ordenada por data**, nunca pela posição ou ordem das linhas.
3. **Parâmetros ficam na aba CONFIG**, não no código. O inventário está em `AUDITORIA_HARDCODE_v445.md`.
4. **Portão de publicação:** só publica no oficial se `ferramentas/conferir_painel.py` (planilhas × /exec × site) der **OK 100%**. O procedimento está em `Rotinas/CONFERENCIA_PAINEL.md`.
5. A padronização para vários destacamentos está em `ARQUITETURA_BI.md`. Não se altera a estrutura das planilhas sem aprovação.

- HTML **v4.4.5 (TESTE, 27/11/2026)** em https://painelaguaboa.github.io/teste-v445/ — não publicado no oficial.
  - Calendário de operações: a previsão vem do Controle de Operações Diárias (`opdiarias`) nos dias que a R2 ainda não analisou, com o estado "Aguardando REDS" e sem cálculo no navegador; o cumprimento vem só da aba CARTÃO PROGRAMA x REDS; a data de hoje é a de Brasília (antes era UTC).
  - METAS: realizado e projeção vêm da aba METAS. Antes, o navegador recalculava, e a CV dava 1 contra 0 na planilha.
  - Sem dado embutido: saíram `PA_REDS_CONF_TESTE` e `PA_OPD_TESTE` do teste e a tabela fixa `PA_MIL_NPM`, porque o servidor envia `mil_npm`.
  - Cache `pa_v445_` (teste `pa_v445t_`).

Pasta no Drive: **Fonte**, dentro de “Painel Destacamento Água Boa – Projeto”.
Cópia local de trabalho: `/workspace/painel/v434-teste/`.

## O que tem aqui

- `base/src.html` — fonte da v4.3.4, ponto de partida do `montar.py`.
- `parts/` — `config_head.js`, `addon.css`, `addon.js` (v4.3.5), `addon_v436.js`, `addon_v436_fix.js` `addon_v437.js`, `addon_v438.js`, `addon_v440.js`, `addon_v441.js`, `addon_v442.js` e `addon_v443.js` (entram no teste e no oficial; o `addon_v441.js` fica só como histórico, pois o v442 já contém o conteúdo dele).
- `patch_regras.py` — regras de carga horária, CPR, horários.
- `montar.py` — aplica os patches, injeta CSS/JS/geo e gera `src.html`.
- `build.py` — embute fontes e escudo e minifica, gerando `index.html`.
- `ferramentas/` — `minify.js`, `logotipo.svg`, `escudo.webp`, `r400.woff2`, `r700.woff2`.
- `geo/geo_prural.json` e `dados/opdiarias_2026-11.json` — usados na versão de teste.
- `Code_v439.gs` e `IMPLANTACAO_V439.md` — servidor v4.3.9 (aba CONFERÊNCIA do REDS em `reds_conf` e escala `A1:AG60`). **Pronto, mas NÃO implantado**; em produção continua o v4.3.8.
- `Code_v435.gs` — servidor anterior (v4.3.5), só histórico.
- `Code_v436.gs` e `IMPLANTACAO_V436.md` — servidor em produção (v4.3.6), implantado em 19/11/2026 como versão 12 da mesma URL `/exec`. O gatilho `instalarGatilho` **não** foi instalado (o Google recusou o escopo `script.scriptapp` por haver várias contas logadas). O aquecimento do cache continua a cargo do GitHub Action a cada 5 min; não alterar `.github/workflows/aquecer-cache.yml` enquanto o gatilho não for instalado.
- `Code_v437.gs` e `IMPLANTACAO_V437.md` — servidor v4.3.7 (card Informações de Militares). `_v` 4.37, cache `pa_v437_`. Lê CREDENCIAMENTO DE VIATURA sem a coluna CNH e junta com o mapa carga. O gatilho `instalarGatilho` continua pendente; não alterar o aquecimento do GitHub.
- `parts/addon_v437.js` — tela Informações de Militares (v4.3.8: card de navegação na home com resumo; tabela completa numa aba própria, com fichas no celular).

- HTML v4.4.4 (26/11/2026, horário de Brasília) — **oficial** desde 26/11/2026 às 23h51 (aprovado pelo Matheus); teste em https://painelaguaboa.github.io/teste-v444/; cópia de segurança do anterior em backup/index_v443_antes_v444.html. Mudanças sobre a v4.4.3: (1) a faixa “REDS conferido até dd/mm” (`#aviso-reds-ate`) fica **sempre visível** no topo, verde com ✓ quando em dia (conferência de ontem, ou de anteontem até as 8h) e vermelha com ⚠ e “conferência atrasada” quando passa disso; a linha REDS saiu de “Hoje e alertas”; (2) DSP sem horas definidas e sem registro no CONTROLE aparece como “DSP” na grade e não gera a divergência “turno da escala sem registro no controle”; (3) códigos sem horário de término (CPR e DSP com carga) só ficam “Sem registro” depois que o dia termina (00h de Brasília do dia seguinte). Cache do HTML `pa_v444_` (teste `pa_v444t_`). Servidor: Code v4.3.9 implantado (implantação v15).
- HTML v4.4.3 (26/11/2026, horário de Brasília) — **oficial** desde 26/11/2026 (aprovado pelo Matheus); teste em https://painelaguaboa.github.io/teste-v443/; cópia de segurança do anterior em backup/index_v442_antes_v443.html. Só no teste: cópia da aba CONFERÊNCIA em `dados/reds_conf_2026-11.json` (`window.PA_REDS_CONF_TESTE`), usada enquanto o servidor não envia `reds_conf`; o build OFICIAL não a inclui. Correções: (N1) no card Registros, tocar em RAT/BO/BOS/TCO abre a lista; (N2/N3) na tela Crimes, tocar num grupo abre a seção “Lista de BOs” já com os BOs do grupo e rola até ela, e o botão Lista de BOs redesenha a lista ao abrir; (N4) “Só divergentes” saiu da tabela do Cartão programa que já só mostra divergências (fica só em “todos”); (N5) “Mostrar tratadas” fica oculto até existir tratamento na planilha; (N6) grupo sem crime (ex.: Armas) abre a lista com o aviso “Nenhum crime…”; (N7) Viaturas e KM e Abastecimento continuam abrindo a mesma tela de propósito (carta situacional no topo). Novo: ordem por data em todas as tabelas com data (fora da escala, conferência do abastecimento, km, operações, resultados, apreensões, cartão programa, calendário, divergências de operações), padrão **mais recentes primeiro**, com botão para inverter guardado no aparelho (`localStorage` `pa_ordem_v1`). DSP (Diligência de Segurança Pública) tratada como **serviço**: aparece em “Serviço de hoje” e conta no efetivo, não é afastamento e não reduz o limite; a carga diária vem de `window.PA_DSP_HORAS_DIA` em `config_head.js` (hoje `null` = carga a definir: previsto 0 h, contam só as horas registradas; com valor, segue a regra geral de +30 min de pré-turno). “Outras situações” aparece no card Escala da home quando houver. REDS: a data vem da aba CONFERÊNCIA (Code_v439) com volta para a data do último REDS; aviso único — em dia, uma linha em “Hoje e alertas”; faixa só com atraso maior que 1 dia. Cache do HTML `pa_v443_` (teste `pa_v443t_`). O Code.gs em produção continua v4.3.8.
- HTML v4.4.2 (19/11/2026, horário de Brasília) — a janela do detalhe do REDS passa a ter altura máxima de cerca de 85vh (com dvh/svh e fallback para vh), cabeçalho com X Fechar sempre visível, só o corpo rola, Fechar também no rodapé, e a rolagem da página fica travada enquanto a janela está aberta; fecha com X, toque fora, Esc ou voltar do celular, e a lista volta à posição anterior. No card **Registros**, o TCO é um subconjunto: entram os REDS cujo campo TIPO DE PRISÃO contém TCO (ex.: TCO/FLAGRANTE DE INFRAÇÃO DE MENOR POTENCIAL OFENSIVO); o mesmo REDS continua no BO e não soma em dobro no total (neste recorte, TCO = 2, ambos BO policial: 2026-051565389-001 e 2026-053179169-001). Na tela Crimes, “Crimes por natureza” e “Crimes por bairro” viram subcards ao lado dos grupos: ao tocar, abre o gráfico numa tela própria e o Voltar retorna para Crimes; os gráficos não ficam mais soltos na rolagem junto da lista de BOs. Os gráficos não contam atendimentos U33004 nem nenhum código U*; os rótulos usam o nome curto da natureza, com o texto acima da barra no celular, sem corte à esquerda; há padding com `env(safe-area-inset-bottom)` para não ficar atrás da barra do Safari. A lista de BOs fica numa seção própria no fim da tela, recolhível. A chave de cache do HTML é `pa_v442_` (teste: `pa_v442t_` e pasta `teste-v442/`). O Code.gs permanece o v4.3.8 (`_v` 4.38, cache `pa_v438_`); não é necessário republicar o servidor nesta versão.

- HTML v4.4.1 (19/11/2026, horário de Brasília) — a aba CRIMES E VISITAS passa a incluir tráfico (I04*, sem U33010), direção perigosa (E08034), desobediência e comunicação falsa (G01330–G01360), falsidade/clonagem (G01299, G01311) e ambientais (N3*, L30*). Card **Registros** na home, com total e separação RAT / BO / BOS / TCO (TCO = 0 neste recorte; o tipo não aparece na REGISTROS). O detalhe do REDS abre em janela sobreposta (painel que sobe no celular, modal no computador), com Fechar fixo; fecha com X, toque fora ou voltar, e a lista volta à posição anterior com o item destacado. A chave de cache do HTML é `pa_v441_` (teste: `pa_v441t_`). O Code.gs permanece o v4.3.8 (`_v` 4.38, cache `pa_v438_`); não é necessário republicar o servidor nesta versão.

- HTML v4.4.0 (19/11/2026, horário de Brasília) — home padronizada: cards de navegação com o mesmo componente (ícone, título, número principal e uma linha de resumo), em grade uniforme e agrupados por seções (Operacional, Ocorrências, Pessoal, Logística, Agenda e resumo). Cabeçalho das telas internas: o título não quebra no meio da palavra; no celular, linha 1 com Voltar + Início + título e, quando há filtros ativos, linha 2 com o botão compacto “Limpar filtros”. A chave de cache do HTML é `pa_v440_` (teste: `pa_v440t_`). O Code.gs permanece o v4.3.7 (`_v` 4.37, cache `pa_v437_`); o `Code_v438.gs` continua opcional e ainda não implantado. Não alterar o aquecimento do cache nem republicar o servidor nesta versão.
- HTML v4.3.9 (19/11/2026, horário de Brasília) — na aba Crimes, os fatos do mês em Água Boa são agrupados pelos títulos do Código Penal e leis especiais (pessoa, patrimônio, dignidade sexual, administração pública, violência doméstica, drogas, armas, trânsito e outros). Cada grupo abre a lista de BOs e um card de análise, sem nomes de envolvidos, CPF, telefone ou endereço completo. Mapeamento em `CRIMES_GRUPOS.md`. O servidor `Code_v438.gs` (v4.3.8, cache `pa_v438_`) é opcional e ainda não foi implantado; acrescenta `reds_bo` (viatura e marcador Maria da Penha). Ver `IMPLANTACAO_V438.md`. A chave de cache do HTML é `pa_v439_` (teste: `pa_v439t_`).
- HTML v4.3.8 (19/11/2026, horário de Brasília) — o card Informações de Militares da home passou a ser clicável, como os outros, e abre a tela própria com a tabela. Em “Previsto e não registrado” (panorama do dia e divergências) aparece só a atividade (nome, código, turno e horário previsto), sem o nome dos militares. A chave de cache do HTML é `pa_v438_` (teste: `pa_v438t_`). O Code.gs permanece o v4.3.7 (`_v` 4.37, cache `pa_v437_`); não republicar o servidor nesta versão. O botão “Ver detalhes” continua desligado.
- `aquecer-cache.yml.depois-da-implantacao` — só aplicar no GitHub depois que o Matheus implantar o Code.gs v4.3.6.


## Procedimento R1 (extração diária do REDS)

Aprendizado de 19/11/2026 (horário de Brasília), no lançamento do 2026-053852330-001 (L30055, extração mineral sem autorização, fato em 18/11/2026 às 20:39, zona rural de Água Boa, registrado pelo 5 GP/4 PEL/160 CIA PM/6 BPM São José da Safira):

- A busca avançada do REDS **não aceita só o município**; exige bairro ou logradouro.
- A busca pelos 9 bairros de Água Boa **não pega registros rurais** (fazendas, córregos, povoados e demais locais fora desses bairros).
- Portanto, além da busca pela unidade responsável M0876, é preciso tentar também a busca por **unidade de área ou destino** (exemplo: 7ª Delegacia de Polícia Civil/Água Boa), para pegar REDS de outras unidades com fato no município.
- REDS com município do fato em Água Boa entra nos totais da área, mesmo quando a unidade responsável é outra. Não entra na produtividade dos militares do Destacamento de Água Boa.
- Desde 26/11/2026: toda consulta diária grava **uma linha na aba CONFERÊNCIA** da planilha REDS do mês, inclusive quando o resultado for zero. Instrução completa em `Rotinas/R1_CONFERENCIA_REDS.md`.

## Como gerar o index.html

Requisitos: Python 3 e Node.js (o `build.py` chama `node` para minificar).

No computador, baixe esta pasta e, no terminal, entre nela.

Versão de teste (com faixa “versão de teste” e dados estáticos do Controle de Operações Diárias):

```bash
python3 montar.py
```

Saída: `src.html` e `index.html` nesta mesma pasta.

Versão oficial (sem faixa de teste, sem dados estáticos de operações diárias):

```bash
OFICIAL=1 python3 montar.py
```

Saída: `oficial/src.html` e `oficial/index.html`. A oficial em produção é a v4.4.4 (https://painelaguaboa.github.io/). As pastas `teste-v436` a `teste-v442` no GitHub permanecem como cópia histórica; a versão de teste desta linha é `teste-v444` (a `teste-v443` fica como histórico).

Requisito de build: esbuild 0.25 em `/tmp/esb/node_modules/esbuild` (`npm i --prefix /tmp/esb esbuild@0.25`); com ele o build reproduz byte a byte os arquivos publicados.

Não edite o `index.html` minificado. Altere `base/src.html`, `parts/`, `patch_regras.py` ou o `montar.py` e rode de novo.

## GitHub

O repositório `painelaguaboa/painelaguaboa.github.io` é público. A pasta `/fonte` no GitHub, se existir, traz só a linha de montagem do HTML — **não** o `Code.gs`, porque ele tem IDs de planilhas internas, da pasta 07 e a tabela de nº PM. Esses arquivos do servidor ficam só nesta pasta do Drive e na box.
