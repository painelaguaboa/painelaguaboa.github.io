# Crimes por grupo do Código Penal (v4.4.1)

Atualizado em 19/11/2026 (horário de Brasília).

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


# Filtro da aba CRIMES E VISITAS (v4.4.1 — 19/11/2026)

A aba derivada **CRIMES E VISITAS TRANQUILIZADORAS** deixa de aceitar só patrimônio, crime violento, violência doméstica e B01*. Passam a entrar também, pelo código DIAO:

- **I04*** — drogas (Lei 11.343/2006), **exceto U33010** (atendimento/denúncia de infrações envolvendo drogas, que não é crime tipificado)
- **E03*** — armas (Estatuto do Desarmamento)
- **E08034** — direção perigosa (trânsito / CTB)
- **G01330–G01360** — desobediência, desacato, comunicação falsa e correlatos (administração pública)
- **G01299** — falsidade ideológica (fé pública, grupo Outros)
- **G01311** — clonagem / adulteração de sinal de veículo (fé pública, grupo Outros)
- **N3*** — infrações ambientais
- **L30*** — extração mineral e correlatos, quando houver

Continuam **de fora** do rol de crime tipificado: **U33010**, visitas **A20000/A20002** e as contravenções **E08042** e **K99000**.

A classificação por grupo no painel (`PA.classificaCrime`) não mudou. **Violência doméstica continua com prioridade** sobre o título do CP e sobre as leis especiais (ex.: posse ilegal de arma com marcador Maria da Penha entra em Violência Doméstica, não em Armas).

Só entram nos totais os fatos de **Água Boa**. Itambacuri e demais municípios ficam de fora da contagem, com nota no card.

A natureza secundária **não** é coluna da aba REGISTROS nem do `Code.gs` (só a natureza principal é armazenada). Quando a extração local já tinha secundária, o texto foi registrado na coluna OBSERVAÇÃO das linhas novas da aba de crimes; o card do BO exibe esse campo quando existir. Nos registros antigos, e no JSON do servidor, a secundária em geral não está disponível.

