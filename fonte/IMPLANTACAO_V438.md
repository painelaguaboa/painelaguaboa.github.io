# Implantação do Code.gs v4.3.8 (HTML do painel: v4.3.9)

O HTML v4.3.9 já está no ar com os grupos de crimes do Código Penal e o card de análise do BO. Ele funciona com o servidor atual (v4.3.7). Este arquivo é só para quando o Matheus for implantar o `Code_v438.gs` **pelo navegador**, como nas versões anteriores.

O que o servidor novo acrescenta:

- bloco `reds_bo` (viatura, fração da guarnição, tipo de prisão, materiais apreendidos, veículo/medida CTB e o marcador Violência doméstica S/N);
- **não** envia endereço do fato, qualificadores RG/CPF nem a lista de demais militares;
- `_v` 4.38 e cache `pa_v438_`. O `?api=ping` passa a responder versão 4.3.8.

Passos (os mesmos da v4.3.7):

1. Abrir o projeto Apps Script “Controle Destacamento Água Boa”.
2. Substituir o conteúdo do `Code.gs` pelo `Code_v438.gs` desta pasta Fonte.
3. Implantar **Nova versão** na implantação já existente da URL `/exec` (não criar outra URL).
4. Não é preciso rodar `instalarGatilho` (continua pendente, como nas versões anteriores). Não alterar o aquecimento do GitHub Action.

Depois da implantação, o card do BO passa a mostrar a viatura e o marcador de Maria da Penha vindo da aba REGISTROS.
