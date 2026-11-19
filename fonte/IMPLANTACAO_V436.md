# Implantação do Code.gs v4.3.6

**Situação em 19/11/2026 (horário de Brasília):** o Code.gs v4.3.6 já está implantado como **versão 12**, na mesma URL `/exec`. Conferido: `?api=ping` devolve `_v` 4.36 e `versao` 4.3.6; `?api=dados&atualizar=1` devolve `_tempos` (total ~31 s).

O gatilho `instalarGatilho` **NÃO** foi instalado: o Google recusou autorizar o escopo `script.scriptapp` por haver várias contas logadas. Por isso **não** se deve alterar `.github/workflows/aquecer-cache.yml`. O agendamento de 5 min do GitHub Action continua sendo o que aquece o cache. Só retirar o `schedule` depois que o gatilho for instalado com sucesso.

O HTML oficial do painel (https://painelaguaboa.github.io/) passou à v4.3.6 na mesma data. Cópia de segurança do index anterior (v4.3.5): `/workspace/painel/backup_oficial/index_v435_antes_v436.html` e `backup/index_v435_antes_v436.html` no repositório. A pasta `teste-v436` permanece no GitHub.

---

Preparada em 19/11/2026. Implantação do Code.gs concluída (versão 12). Não reinstalar nem trocar a URL `/exec`.

Arquivo: `Code_v436.gs` (cópia também na pasta Fonte do Drive).

## O que muda no servidor

- `_v` passa a 4.36 (`getDados` e `?api=ping`; o ping também traz `versao: "4.3.6"`).
- Campo `_tempos`: milissegundos por bloco (`fontes`, `escala`, `turnos`, `abast`, `ops`, `reds`, `carga`, `ferias`, `abast_meses`, `escala_prox`, `comparativo`, `eventos`, `prural`, `carta`, `opdiarias`, `total`).
- Cache `pa_v435_` com validade de 6 h (21.600 s, máximo do CacheService). A chave antiga `pa_v434_` deixa de ser lida — a primeira abertura após implantar pode levar ~40 s.
- Previsão do mês seguinte (`escala_prox`): cache próprio, no máximo 1 vez por hora.
- `instalarGatilho()` apaga gatilhos antigos de `aquecerCache_` e cria um a cada 15 min. Fora das 6h–23h (horário de Brasília) a função sai sem ler. Só aquece o mês atual.

## Passos (conta matheus.igreen.energy@gmail.com)

1. Abrir o projeto [Controle Destacamento Água Boa](https://script.google.com/home/projects/1gzBOJ-A7YXJQlQg5Zn92ry0onadPtXb7C75giJPOfzhb69yhGdfHElFK/edit).
2. Substituir o Code.gs pelo conteúdo de `Code_v436.gs` e salvar.
3. Implantar → Gerenciar implantações → editar a implantação atual → **Nova versão** (mantém a mesma URL `/exec`). Autorizar se o editor pedir.
4. Rodar **uma vez** no editor a função `instalarGatilho` (Executar) e autorizar o gatilho se pedir.
5. Conferir:
   - `/exec?api=ping` → `"_v": 4.36` e `"versao": "4.3.6"`.
   - `/exec?api=dados&atualizar=1` → `"_v": 4.36` e o objeto `_tempos` (soma em `total`, em ms). A primeira leitura pode passar de 30 s.

## Depois que o gatilho `instalarGatilho` for instalado

Somente então retirar o agendamento do GitHub Action, deixando só o disparo manual. Enquanto o gatilho estiver pendente, manter o `schedule` de 5 min. Arquivo: `.github/workflows/aquecer-cache.yml` no repositório `painelaguaboa/painelaguaboa.github.io`.

Trocar o `on:` por:

```yaml
on:
  workflow_dispatch:
```

(apagar o bloco `schedule` com `cron: '*/5 * * * *'`). O conteúdo do `jobs:` permanece. Há uma cópia pronta em `aquecer-cache.yml.depois-da-implantacao` na pasta Fonte e em `/workspace/painel/v434-teste/`.

Não aplicar essa alteração no GitHub antes da implantação do Code.gs v4.3.6.
