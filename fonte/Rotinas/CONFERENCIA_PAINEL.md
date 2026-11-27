# Conferência automática do painel (portão de publicação)

Criada em 27/11/2026 (horário de Brasília), a pedido do Matheus: "Esse dashboard tem que ser o mais confiável possível".

## Regras
1. **As planilhas são a única fonte da verdade.** O painel só lê e exibe. Não há dado embutido no HTML nem número calculado fora das tabelas sem rastreio.
2. **Portão de publicação.** Uma versão nova só vai para o site oficial se `conferir_painel.py` terminar com **OK 100%**, ou seja, código de saída 0. Isso vale contra a versão de teste e, depois da publicação, contra o oficial.
3. Uma divergência não se corrige no HTML. Corrija na planilha, com lançamento pela rotina e registro no LOG, ou corrija a extração.

## O que confere
| Área | Comparação |
|---|---|
| REDS | aba REGISTROS (planilha) × `reds_reg` (servidor): total, nº a nº e contagem por dia |
| Conferência | última DATA CONFERIDA da aba CONFERÊNCIA × servidor × faixa do site; conferência até ontem depois das 9h |
| R2 | todo dia até a data conferida que tem previsão no Controle de Operações Diárias precisa ter linhas na aba CARTÃO PROGRAMA x REDS |
| Cartão programa | por dia, previstas/com REDS: planilha × servidor × calendário do site |
| Operações | linhas da aba do mês: planilha × servidor × site |
| METAS | META e REALIZADO: planilha × servidor × site |
| CV (rol taxativo) | CV de Água Boa recalculado com REGISTROS × D_NATUREZAS_CV × linha CV_CRIMES da aba METAS (total e lista de REDS); CATEGORIA "crime violento" fora do rol; natureza do rol sem código na dimensão; visita A20001 indicada para crime fora do rol |
| Site | sem erro de JavaScript, sem cópia de dados embutida, total de REDS, REDS de Água Boa, faixa REDS visível com a data certa |

## Rotina diária (8h45, depois da R1)
1. Ler, com o conector Google Sheets (conta igreen) e `write_to_file: true`:
   - planilha REDS do mês (ID na CONFIG, coluna ID REDS):
     - `CARTÃO PROGRAMA x REDS!A1:K1000`
     - `CONFERÊNCIA!A1:D400`
     - `METAS!A1:M30`
     - `REGISTROS!A1:G1000`
     - `D_NATUREZAS_CV!A1:G200`
   - planilha de operações (ID OPERAÇÕES da CONFIG): aba do mês `A1:D1000`.
2. Gravar os CSVs. Os nomes vão na mesma ordem dos intervalos lidos:
   ```
   cd /workspace/painel/v443/ferramentas
   python3 salvar_csv.py <arquivo_REDS> /workspace/painel/conferencia/planilhas CARTAO CONFERENCIA METAS REGISTROS D_NATUREZAS_CV
   python3 salvar_csv.py <arquivo_OPS> /workspace/painel/conferencia/planilhas OPERACOES
   ```
3. Rodar em segundo plano. A leitura nova do servidor leva de 30 a 60 s.
   ```
   python3 conferir_painel.py --planilhas /workspace/painel/conferencia/planilhas --atualizar --site https://painelaguaboa.github.io/
   ```
4. Se o código de saída for 0 (OK 100%), não avisar ninguém; só registrar no LOG ("Conferência do painel — OK 100%").
5. Se for 1 (divergência) ou 2 (erro), mandar ao Matheus só a tabela de divergências do relatório `/workspace/painel/conferencia/AAAA-MM-DD_HHMMSS.md` e registrar no LOG. Se a causa for a R1 ou a R2, que é o caso comum (por exemplo "R2 pendente"), a rotina executa a etapa que faltou e roda a conferência de novo.

## Arquivos
- `ferramentas/conferir_painel.py`: a conferência.
- `ferramentas/salvar_csv.py`: converte a leitura do conector em CSV.

Estão no box em `/workspace/painel/v443/ferramentas/` e no Drive em Fonte/ferramentas. O relatório não leva dados pessoais.
