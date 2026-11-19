# Fonte editável do Painel Destacamento Água Boa (v4.3.9 oficial)

Pasta no Drive: **Fonte**, dentro de “Painel Destacamento Água Boa – Projeto”.
Cópia local de trabalho: `/workspace/painel/v434-teste/`.

## O que tem aqui

- `base/src.html` — fonte da v4.3.4, ponto de partida do `montar.py`.
- `parts/` — `config_head.js`, `addon.css`, `addon.js` (v4.3.5), `addon_v436.js`, `addon_v436_fix.js` `addon_v437.js` e `addon_v438.js` (entram no teste e no oficial).
- `patch_regras.py` — regras de carga horária, CPR, horários.
- `montar.py` — aplica os patches, injeta CSS/JS/geo e gera `src.html`.
- `build.py` — embute fontes e escudo e minifica, gerando `index.html`.
- `ferramentas/` — `minify.js`, `logotipo.svg`, `escudo.webp`, `r400.woff2`, `r700.woff2`.
- `geo/geo_prural.json` e `dados/opdiarias_2026-11.json` — usados na versão de teste.
- `Code_v435.gs` — servidor anterior (v4.3.5), só histórico.
- `Code_v436.gs` e `IMPLANTACAO_V436.md` — servidor em produção (v4.3.6), implantado em 19/11/2026 como versão 12 da mesma URL `/exec`. O gatilho `instalarGatilho` **não** foi instalado (o Google recusou o escopo `script.scriptapp` por haver várias contas logadas). O aquecimento do cache continua a cargo do GitHub Action a cada 5 min; não alterar `.github/workflows/aquecer-cache.yml` enquanto o gatilho não for instalado.
- `Code_v437.gs` e `IMPLANTACAO_V437.md` — servidor v4.3.7 (card Informações de Militares). `_v` 4.37, cache `pa_v437_`. Lê CREDENCIAMENTO DE VIATURA sem a coluna CNH e junta com o mapa carga. O gatilho `instalarGatilho` continua pendente; não alterar o aquecimento do GitHub.
- `parts/addon_v437.js` — tela Informações de Militares (v4.3.8: card de navegação na home com resumo; tabela completa numa aba própria, com fichas no celular).
- HTML v4.3.9 (19/11/2026, horário de Brasília) — na aba Crimes, os fatos do mês em Água Boa são agrupados pelos títulos do Código Penal e leis especiais (pessoa, patrimônio, dignidade sexual, administração pública, violência doméstica, drogas, armas, trânsito e outros). Cada grupo abre a lista de BOs e um card de análise, sem nomes de envolvidos, CPF, telefone ou endereço completo. Mapeamento em `CRIMES_GRUPOS.md`. O servidor `Code_v438.gs` (v4.3.8, cache `pa_v438_`) é opcional e ainda não foi implantado; acrescenta `reds_bo` (viatura e marcador Maria da Penha). Ver `IMPLANTACAO_V438.md`. A chave de cache do HTML é `pa_v439_` (teste: `pa_v439t_`).
- HTML v4.3.8 (19/11/2026, horário de Brasília) — o card Informações de Militares da home passou a ser clicável, como os outros, e abre a tela própria com a tabela. Em “Previsto e não registrado” (panorama do dia e divergências) aparece só a atividade (nome, código, turno e horário previsto), sem o nome dos militares. A chave de cache do HTML é `pa_v438_` (teste: `pa_v438t_`). O Code.gs permanece o v4.3.7 (`_v` 4.37, cache `pa_v437_`); não republicar o servidor nesta versão. O botão “Ver detalhes” continua desligado.
- `aquecer-cache.yml.depois-da-implantacao` — só aplicar no GitHub depois que o Matheus implantar o Code.gs v4.3.6.

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

Saída: `oficial/src.html` e `oficial/index.html`. A oficial em produção é a v4.3.9 (https://painelaguaboa.github.io/). As pastas `teste-v436`, `teste-v437` e `teste-v438` no GitHub permanecem como cópia histórica; a versão de teste desta linha é `teste-v439`.

Não edite o `index.html` minificado. Altere `base/src.html`, `parts/`, `patch_regras.py` ou o `montar.py` e rode de novo.

## GitHub

O repositório `painelaguaboa/painelaguaboa.github.io` é público. A pasta `/fonte` no GitHub, se existir, traz só a linha de montagem do HTML — **não** o `Code.gs`, porque ele tem IDs de planilhas internas, da pasta 07 e a tabela de nº PM. Esses arquivos do servidor ficam só nesta pasta do Drive e na box.
