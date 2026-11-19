# Fonte editável do Painel Destacamento Água Boa (v4.4.2 oficial)

Pasta no Drive: **Fonte**, dentro de “Painel Destacamento Água Boa – Projeto”.
Cópia local de trabalho: `/workspace/painel/v434-teste/`.

## O que tem aqui

- `base/src.html` — fonte da v4.3.4, ponto de partida do `montar.py`.
- `parts/` — `config_head.js`, `addon.css`, `addon.js` (v4.3.5), `addon_v436.js`, `addon_v436_fix.js` `addon_v437.js`, `addon_v438.js`, `addon_v440.js`, `addon_v441.js` e `addon_v442.js` (entram no teste e no oficial).
- `patch_regras.py` — regras de carga horária, CPR, horários.
- `montar.py` — aplica os patches, injeta CSS/JS/geo e gera `src.html`.
- `build.py` — embute fontes e escudo e minifica, gerando `index.html`.
- `ferramentas/` — `minify.js`, `logotipo.svg`, `escudo.webp`, `r400.woff2`, `r700.woff2`.
- `geo/geo_prural.json` e `dados/opdiarias_2026-11.json` — usados na versão de teste.
- `Code_v435.gs` — servidor anterior (v4.3.5), só histórico.
- `Code_v436.gs` e `IMPLANTACAO_V436.md` — servidor em produção (v4.3.6), implantado em 19/11/2026 como versão 12 da mesma URL `/exec`. O gatilho `instalarGatilho` **não** foi instalado (o Google recusou o escopo `script.scriptapp` por haver várias contas logadas). O aquecimento do cache continua a cargo do GitHub Action a cada 5 min; não alterar `.github/workflows/aquecer-cache.yml` enquanto o gatilho não for instalado.
- `Code_v437.gs` e `IMPLANTACAO_V437.md` — servidor v4.3.7 (card Informações de Militares). `_v` 4.37, cache `pa_v437_`. Lê CREDENCIAMENTO DE VIATURA sem a coluna CNH e junta com o mapa carga. O gatilho `instalarGatilho` continua pendente; não alterar o aquecimento do GitHub.
- `parts/addon_v437.js` — tela Informações de Militares (v4.3.8: card de navegação na home com resumo; tabela completa numa aba própria, com fichas no celular).

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

Saída: `oficial/src.html` e `oficial/index.html`. A oficial em produção é a v4.4.0 (https://painelaguaboa.github.io/). As pastas `teste-v436` a `teste-v439` no GitHub permanecem como cópia histórica; a versão de teste desta linha é `teste-v440`.

Não edite o `index.html` minificado. Altere `base/src.html`, `parts/`, `patch_regras.py` ou o `montar.py` e rode de novo.

## GitHub

O repositório `painelaguaboa/painelaguaboa.github.io` é público. A pasta `/fonte` no GitHub, se existir, traz só a linha de montagem do HTML — **não** o `Code.gs`, porque ele tem IDs de planilhas internas, da pasta 07 e a tabela de nº PM. Esses arquivos do servidor ficam só nesta pasta do Drive e na box.
