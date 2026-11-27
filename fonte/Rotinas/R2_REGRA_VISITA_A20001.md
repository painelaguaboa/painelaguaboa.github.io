# R2: regra da visita tranquilizadora A20001 e dos crimes violentos (CV)

Regra do Matheus de 27/11/2026 (horário de Brasília). Vale para toda execução da R2 (abas derivadas da planilha REDS do mês).

## 1. Crime violento (indicador)
- **Rol taxativo** da DIAO/GDO (Instrução 8007.2/2023-CG, GDO 5ª ed.; SEJUSP dados.mg.gov.br/dataset/crimes-violentos):
  - homicídio, roubo, estupro, estupro de vulnerável, extorsão e sequestro e cárcere privado, tentados ou consumados;
  - extorsão mediante sequestro consumada.
- Fonte: aba `D_NATUREZAS_CV`, coluna `E_CV`. **A coluna CATEGORIA não decide CV.** Nenhuma outra natureza recebe CATEGORIA "crime violento".
- Contagem: aba `R_CV_CLASSIFICACAO`, só fórmulas, e a linha `CV_CRIMES` da aba METAS.

## 2. Visita A20001 devida (coluna "VISITA INDICADA (CÓDIGO)" da aba CRIMES E VISITAS TRANQUILIZADORAS)
Um REDS de crime em Água Boa gera A20001 quando atende a qualquer um destes critérios:
1. CV do rol (`E_CV` = SIM);
2. violência doméstica:
   - coluna VIOLÊNCIA DOMÉSTICA (S/N) = S em REGISTROS, ou
   - código U33004, ou
   - CATEGORIA "violência doméstica/Maria da Penha".
   Nesses casos, A20001 **soma-se** à A20002/U33004, que continua devida;
3. natureza com `GERA_VISITA` = SIM na aba `D_NATUREZAS_CV`, procurada pelo código ou pelo nome nas linhas sem código:
   - lesão corporal;
   - importunação sexual;
   - ameaça;
   - perseguição;
   - vias de fato;
   - violação de domicílio;
   - porte ilegal de arma;
   - disparo de arma de fogo.

Ficam fora:
- atividades e operações (códigos A, Y e Q);
- posse ilegal de arma sem violência doméstica.

Só vale a natureza principal. As naturezas secundárias citadas no histórico não entram até que a extração traga essa coluna.

## 3. Meta CV da aba METAS (visita)
- **META** = número de REDS com visita A20001 devida (`R_CV_CLASSIFICACAO!K7`).
- **REALIZADO** = **qualquer** A20001 de Água Boa registrada no mês (`R_CV_CLASSIFICACAO!K9`).
- A linha nova vai sempre no fim. O painel lê a última linha de cada sigla. Não se apaga a linha antiga.

## 4. Conferência
`ferramentas/conferir_painel.py` confere três coisas e bloqueia a publicação se houver divergência:
- a lista de visitas devidas calculada pela dimensão contra a indicação da aba CRIMES;
- a META e o REALIZADO da última linha CV da aba METAS;
- o CV pela dimensão contra a linha CV_CRIMES.
