# Crimes por grupo do Código Penal (v4.3.9)

O painel classifica cada fato da aba **CRIMES E VISITAS TRANQUILIZADORAS** (código e natureza DIAO, mais a categoria da planilha e, quando existir, o marcador “Violência doméstica (S/N)” do `reds_bo`).

A função é `PA.classificaCrime(codigo, natureza, categoria, vd)` em `parts/addon_v438.js`. Um fato entra em **um único grupo**. A ordem de prioridade é:

1. **Violência Doméstica** — marcador (Lei Maria da Penha, Lei 11.340/2006). Vale quando a categoria ou a natureza citam violência doméstica / Maria da Penha, quando o código é U33004, ou quando o campo `VIOLÊNCIA DOMÉSTICA (S/N)` do Code.gs v4.3.8 vier “S”.
2. **Contra a Dignidade Sexual** — Título VI do CP (estupro, importunação, assédio, exploração sexual, etc.; faixa DIAO B01310–B01499, se aparecer).
3. **Drogas** — Lei 11.343/2006 (prefixo I04, código U33010, natureza/categoria de tráfico ou drogas).
4. **Armas** — Estatuto do Desarmamento, Lei 10.826/2003 (prefixo E03 e naturezas de arma de fogo / munição).
5. **Trânsito** — CTB (prefixo T, E0803 e naturezas de sinistro / direção perigosa).
6. **Contra a Administração Pública** — desobediência, desacato, resistência, comunicação falsa de crime e correlatos (faixa G01330–G01360).
7. **Contra a Pessoa** — Título I do CP (prefixo B e naturezas de homicídio, lesão, ameaça, perseguição, liberdade).
8. **Contra o Patrimônio** — Título II do CP (prefixo C e furto, roubo, dano, estelionato, receptação, alteração de limites).
9. **Outros** — o que não se encaixar acima (fé pública, ambiental, atendimentos, etc.).

Só entram nos totais os crimes de **Água Boa**. O card do BO mostra número, data/hora, natureza, bairro, situação, quantidades de autor/vítima, prisão, apreensões, guarnição/viatura (quando o servidor enviar `reds_bo`) e um resumo montado com esses campos. **Não** exibe nomes de envolvidos, CPF, telefone nem endereço completo. Tipo de local e meio/instrumento ainda não existem na planilha de análise do REDS; ficam como “não consta” até haver coluna na fonte.

O Code.gs v4.3.8 (`Code_v438.gs`) acrescenta o bloco `reds_bo` com viatura, fração, tipo de prisão, materiais e o marcador de violência doméstica, **sem** endereço, qualificadores RG/CPF ou lista de demais militares. Enquanto essa versão não for implantada na URL `/exec`, o HTML já funciona com os campos da aba de crimes, das apreensões e da base militar.
