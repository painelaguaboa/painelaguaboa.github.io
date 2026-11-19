# Implantação do Code.gs v4.3.7

Preparada em 19/11/2026 (horário de Brasília). Nova versão na **mesma URL** `/exec`. Não trocar a implantação; criar só uma **nova versão** da atual.

Arquivo: `Code_v437.gs` (cópia também na pasta Fonte do Drive).

O gatilho `instalarGatilho` **continua sem estar instalado** (recusa de autorização com várias contas logadas). **Não** alterar `.github/workflows/aquecer-cache.yml`. O agendamento de 5 min do GitHub Action segue aquecendo o cache.

## O que muda no servidor

- `_v` passa a 4.37 (`getDados` e `?api=ping`; o ping também traz `versao: "4.3.7"`).
- Cache `pa_v437_` com validade de 6 h (a chave `pa_v435_` deixa de ser lida — a primeira abertura após implantar pode levar ~40 s).
- Campo novo `info_militares`: junta a planilha CREDENCIAMENTO DE VIATURA (aba CREDENCIAMENTO, **sem a coluna CNH**) com PISTOLA, COLETE e MUNIÇÃO do mapa carga, pela chave do nome de guerra.
- O JSON nunca inclui CPF, telefone, endereço nem número da CNH.

## Passos (conta matheus.igreen.energy@gmail.com)

1. Abrir o projeto [Controle Destacamento Água Boa](https://script.google.com/home/projects/1gzBOJ-A7YXJQlQg5Zn92ry0onadPtXb7C75giJPOfzhb69yhGdfHElFK/edit).
2. Substituir o Code.gs pelo conteúdo de `Code_v437.gs` e salvar.
3. Implantar → Gerenciar implantações → editar a implantação atual → **Nova versão** (mantém a mesma URL `/exec`). Autorizar se o editor pedir (a planilha de credenciamento é nova; pode pedir acesso ao Drive).
4. Conferir:
   - `/exec?api=ping` → `"_v": 4.37` e `"versao": "4.3.7"`.
   - `/exec?api=dados&atualizar=1` → `"_v": 4.37` e objeto `info_militares` com 12 militares, sem campo CNH e sem números de 10–11 dígitos de documento.

Não é preciso rodar `instalarGatilho` de novo (e não se deve, enquanto houver várias contas logadas).
