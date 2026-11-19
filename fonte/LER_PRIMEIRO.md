# Fonte editável do Painel Destacamento Água Boa (v4.3.5 / v4.3.6)

Pasta no Drive: **Fonte**, dentro de “Painel Destacamento Água Boa – Projeto”.
Cópia local de trabalho: `/workspace/painel/v434-teste/`.

## O que tem aqui

- `base/src.html` — fonte da v4.3.4, ponto de partida do `montar.py`.
- `parts/` — `config_head.js`, `addon.css`, `addon.js` (v4.3.5) e `addon_v436.js` (só na versão de teste v4.3.6; o `montar.py` não injeta esse arquivo quando `OFICIAL=1`).
- `patch_regras.py` — regras de carga horária, CPR, horários.
- `montar.py` — aplica os patches, injeta CSS/JS/geo e gera `src.html`.
- `build.py` — embute fontes e escudo e minifica, gerando `index.html`.
- `ferramentas/` — `minify.js`, `logotipo.svg`, `escudo.webp`, `r400.woff2`, `r700.woff2`.
- `geo/geo_prural.json` e `dados/opdiarias_2026-11.json` — usados na versão de teste.
- `Code_v435.gs` — servidor em produção (v4.3.5).
- `Code_v436.gs` e `IMPLANTACAO_V436.md` — preparação da v4.3.6, ainda **não implantada**.
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

Saída: `oficial/src.html` e `oficial/index.html`. A oficial continua v4.3.5 até o Matheus aprovar a versão de teste (https://painelaguaboa.github.io/teste-v436/).

Não edite o `index.html` minificado. Altere `base/src.html`, `parts/`, `patch_regras.py` ou o `montar.py` e rode de novo.

## GitHub

O repositório `painelaguaboa/painelaguaboa.github.io` é público. A pasta `/fonte` no GitHub, se existir, traz só a linha de montagem do HTML — **não** o `Code.gs`, porque ele tem IDs de planilhas internas, da pasta 07 e a tabela de nº PM. Esses arquivos do servidor ficam só nesta pasta do Drive e na box.
