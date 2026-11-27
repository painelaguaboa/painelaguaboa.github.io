# Implantação do Code.gs v4.3.9 (HTML do painel: v4.4.3)

**Ainda NÃO implantado.** Este arquivo é só para quando o Matheus aprovar e implantar o `Code_v439.gs` pelo navegador, como nas versões anteriores. O servidor em produção continua o v4.3.8 (`_v` 4.38, cache `pa_v438_`).

O HTML v4.4.3 funciona com o servidor atual: sem a chave `reds_conf`, o painel volta a usar a data do último REDS lançado (“REDS atualizado até dd/mm”).

O que o servidor novo acrescenta:

- chave `reds_conf`: lê a aba **CONFERÊNCIA** da planilha REDS do mês, faixa `'CONFERÊNCIA'!A1:D400` (DATA CONFERIDA · DATA/HORA DA CONSULTA · QTD REGISTROS · OBSERVAÇÃO). Com ela o painel mostra “REDS conferido até dd/mm — sem novos registros desde dd/mm” nos dias em que a consulta deu zero. Se a aba não existir no mês, a chave vai vazia (sem erro);
- faixa da escala ampliada de `A1:AG40` para `A1:AG60` (mês atual e previsão do mês seguinte), para a legenda maior (ex.: DSP na linha 33) não ser cortada;
- `_v` 4.39 e cache `pa_v439_`. O `?api=ping` passa a responder versão 4.3.9.

Passos (os mesmos da v4.3.8):

1. Abrir o projeto Apps Script “Controle Destacamento Água Boa”.
2. Fazer uma cópia de segurança do `Code.gs` atual (v4.3.8).
3. Substituir o conteúdo do `Code.gs` pelo `Code_v439.gs` desta pasta Fonte.
4. Implantar → Gerenciar implantações → editar a implantação já existente da URL `/exec` → **Nova versão** (não criar outra URL).
5. Não rodar `instalarGatilho` (continua pendente). Não alterar o aquecimento do GitHub Action.
6. Conferir: `…/exec?api=ping` deve responder `"versao":"4.3.9"`, e `…/exec?api=dados` deve trazer `reds_conf` com as linhas da aba CONFERÊNCIA.

Atenção para dezembro: a aba CONFERÊNCIA precisa existir também na planilha REDS de dezembro (a rotina R1 cria/usa a aba do mês).
