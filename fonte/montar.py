#!/usr/bin/env python3
"""Monta a versão de teste ou a oficial v4.4.6 a partir do fonte v4.3.4 + parts."""
import json, re, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import patch_regras
D = os.path.dirname(os.path.abspath(__file__))
def _achar(*cands):
    for pth in cands:
        if os.path.isfile(pth):
            return pth
    raise SystemExit('Não achei o src.html base (v4.3.4). Procurei: ' + ' | '.join(cands))
BASE_SRC = _achar(
    os.path.join(D, 'base', 'src.html'),
    os.path.join(D, '..', 'v434src', 'src.html'),
    '/workspace/painel/v434src/src.html',
)
s = open(BASE_SRC, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n: raise SystemExit('FALHA (%d) em: %s' % (c, a[:160]))
    s = s.replace(a, b)
def between(a, b):
    i = s.index(a); j = s.index(b, i) + len(b); return i, j

# ---------- cabeçalho, versão, config única do Y15099, dados de teste ----------
rep("<title>Painel de Controle — Destacamento de Água Boa — PMMG</title>", "<title>Painel Água Boa — versão de teste v4.4.6 (27/11/2026)</title>")
rep("<span style='margin:0 8px'>Painel v4.3.4</span>", "<span style='margin:0 8px'>Painel v4.4.6-teste</span>")
# v4.3.5-teste (18/11): pedido do Matheus – remover os cards de visitas tranquilizadoras da Carga horária e do Cartão programa
import re as _re
for _id in ('vis-escala','vis-cartao'):
    _m=_re.search(r"\n  <div class='card mt' id='%s'>.*?\n  </div>(?=\n)"%_id,s,_re.S)
    assert _m, _id
    s=s.replace(_m.group(0),'',1)
geo = open(os.path.join(D, 'geo', 'geo_prural.json'), encoding='utf-8').read()
opd = open(os.path.join(D, 'dados', 'opdiarias_2026-11.json'), encoding='utf-8').read()
cfg = open(os.path.join(D, 'parts', 'config_head.js'), encoding='utf-8').read()
# v4.4.5: regra do Matheus (27/11) — planilhas são a única fonte; nenhum dado de teste embutido (PA_OPD_TESTE e PA_REDS_CONF_TESTE removidos)
rep("<base target=\"_top\">", "<script>\n" + cfg + "\nwindow.PA_GEO=" + geo + ";\n</script>\n<base target=\"_top\">")
css = open(os.path.join(D, 'parts', 'addon.css'), encoding='utf-8').read()
rep("\n</style>\n</head>", "\n" + css + "\n</style>\n</head>")

# ---------- tela inicial reorganizada ----------
i, j = between("<div id='inicio'>\n", "<div id='grupo-topo'")
velho = s[i:j]
def pega(a, b):
    k = velho.index(a); l = velho.index(b, k) + len(b); return velho[k:l]
hero = pega("<section class='hesc' id='home-escala'", "</section>")
menu = pega("<div class='menu' id='menu'>", "</div>\n")
kpis = pega("<div class='kpis' id='kpis'>", "\n</div>\n")
aten = pega("<div class='card mt' id='atencao-dia'>", "</div>\n</div>\n")
comp = pega("<div class='card mt' id='comp-inicio'>", "</div>\n</div>\n")
def mc(trecho):
    m = re.search(r"  <button class='mcard[^']*' data-abrir='%s'>.*?</button>\n" % trecho, menu); return m.group(0)
I = lambda ico: "<span class='mh'><svg class='ico' aria-hidden='true'><use href='#%s'/></svg>" % ico
NL = "\n"
def card(dest, ico, titulo, md, draw, via='abrir'):
    attr = ("data-abrir='%s'" % dest) if via=='abrir' else ("data-ir='%s'" % dest)
    if draw=='m-esc':
        mv = "<span class='mv' data-draw='" + draw + "'>—</span>"
    else:
        mv = "<span class='mv'><b data-draw='" + draw + "'>—</b></span>"
    return ("  <button class='mcard' " + attr + ">" + I(ico) + "<span class='mt1'>" + titulo + "</span></span>"
            + mv + "<span class='md'>" + md + "</span></button>" + NL)
def secao(tit, cards):
    return "<section class='home-sec'>" + NL + "<h2>" + tit + "</h2>" + NL + "<div class='menu home-menu'>" + NL + "".join(cards) + "</div>" + NL + "</section>" + NL
novo_inicio = (
"<div id='inicio' class='home-padrao'>" + NL +
"<div class='banner-teste' role='status'>" + NL + "<p><strong>Versão de teste v4.4.6</strong> — 27/11/2026 (horário de Brasília). Visitas tranquilizadoras: quando o crime pede A20001 e A20002, cada visita aparece em sua linha, com a situação lida da planilha.</p>" + NL + "</div>" + NL +
"<div id='menu'>" + NL +
secao('Operacional', [
    card('operacoes','i-alvo','Operações','Lançadas no mês','m-ops'),
    card('esc','i-cal','Escala','De serviço hoje','m-esc'),
    card('dia','i-relogio','Cartão do dia','Atividades previstas para hoje','m-dia'),
    card('odometro','i-vtr','Viaturas e KM','Na carta situacional','m-vtr','ir'),
    card('patrulha-rural','i-mapa','Patrulha Rural','Cadastro e cobertura do plano','m-prural'),
]) +
secao('Ocorrências', [
    card('produtividade','i-graf','REDS','Indicadores, registros e apreensões','m-prod'),
    card('registros-reds','i-escudo','Registros','RAT, BO, BOS e TCO do período','m-reg'),
    card('crimes','i-lupa','Crimes','Visitas tranquilizadoras pendentes','m-cri'),
]) +
secao('Pessoal', [
    card('carga','i-relogio','Carga horária','Acima do limite neste mês','m-carga'),
    card('ferias','i-cal','Férias','De férias hoje','m-fer','ir'),
    card('info-militares','i-pessoas','Informações de Militares','Carteira, arma, colete e munição','m-im'),
]) +
secao('Logística', [
    card('viaturas','i-vtr','Abastecimento','Combustível no mês','m-log','ir'),
    card('intendencia','i-caixa','Intendência','Pendências na conferência mensal','m-int'),
]) +
secao('Agenda e resumo', [
    card('eventos','i-evento','Eventos','Eventos à frente','m-evt'),
    card('resumo','i-graf','Resumo do mês','Indicadores e comparativo','m-resumo'),
]) +
"</div>" + NL + "</div>" + NL + NL
)
s = s[:i] + novo_inicio + s[j - len("<div id='grupo-topo'"):]
# novas seções (panes)
kpis_card = "<div class='card' id='resumo-card'>\n  <h2>Resumo do mês</h2>\n  <p class='sub'>Selecione o indicador para abrir o detalhe; use ← Voltar para retornar.</p>\n" + kpis.replace("<div class='kpis' id='kpis'>", "<div class='kpis' id='kpis'>") + "</div>\n"
kpis_card = kpis_card.replace("<div class='kl'>Carta situacional das viaturas (óleo, situação e multa)</div>", "<div class='kl'>Óleo e MP das viaturas · km restantes (carta situacional)</div>")
kpis_card = kpis_card.replace("<div class='card' data-ir='divergencias' role='button' tabindex='0'><div class='kv' data-draw='k-div'>—</div><div class='kl'>Abastecimentos que não conferem com os turnos</div></div>", "<div class='card' data-ir='viaturas' role='button' tabindex='0'><div class='kv' data-draw='k-div'>—</div><div class='kl'>Abastecimentos a conferir com os turnos</div></div>")
novas = ("<section id='esc-hoje' data-pane='esc-hoje' hidden>\n" + hero + "\n</section>\n"
"<section id='resumo-mes' data-pane='resumo-mes' hidden>\n" + kpis_card + "</section>\n"
"<section id='resumo-comp' data-pane='resumo-comp' hidden>\n" + comp.replace("<div class='card mt' id='comp-inicio'>", "<div class='card' id='comp-inicio'>") + "</section>\n"
"<section id='dia-acomp' data-pane='dia-acomp' hidden>\n" + aten.replace("<div class='card mt' id='atencao-dia'>", "<div class='card' id='atencao-dia'>") + "</section>\n"
"<section id='dia-cartao' data-pane='dia-cartao' hidden>\n"
"  <div class='card' id='cp-card'>\n    <h2>Cartão programa do dia</h2>\n    <p class='sub'>O que precisa ser lançado no dia: atividade, código, horário, local/subsetor e guarnição.</p>\n    <div data-draw='cp-dia'></div>\n  </div>\n"
"  <div class='card mt' id='opd-card'>\n    <h2>Controle de Operações Diárias</h2>\n    <p class='sub'>Documento do mês na pasta 07 OPERAÇÕES E EVENTOS e operações previstas para hoje.</p>\n    <div data-draw='opd'></div>\n  </div>\n"
"</section>\n\n")

SEC_IM = (
"<section id='info-militares' data-pane='info-militares' hidden>\n"
"  <div class='card' id='info-militares-card'>\n"
"    <h2>Informações de Militares</h2>\n"
"    <p class='sub'>Carteira, validade da CNH, publicação do credenciamento, arma (situação, marca, série e patrimônio), colete e munição .40. O número da CNH, o CPF, o telefone e o endereço não são exibidos.</p>\n"
"    <p class='sub' data-draw='im-resumo'></p>\n"
"    <div data-draw='im-lista'></div>\n"
"  </div>\n"
"</section>\n\n"
)

SEC_RG = (
"<section id='registros-reds' data-pane='registros-reds' hidden>\n"
"  <div class='card' id='rg-card'>\n"
"    <h2>Registros do período</h2>\n"
"    <p class='sub'>Todos os REDS de Água Boa no mês, separados pelo tipo do documento (campo TIPO da aba REGISTROS). BO reúne BO policial, BO de trânsito, BO ambiental e BO de desaparecimento/localização; BOS reúne BOS e BOS Amplo. O TCO é um subconjunto: entram os REDS cujo campo TIPO DE PRISÃO contém TCO (por exemplo, TCO/FLAGRANTE DE INFRAÇÃO DE MENOR POTENCIAL OFENSIVO). O mesmo REDS continua no BO e no total — não soma em dobro. Toque num tipo e, em seguida, num REDS para ver o detalhe.</p>\n"
"    <div data-draw='rg-tipos'></div>\n"
"    <div data-draw='rg-lista'></div>\n"
"  </div>\n"
"</section>\n\n"
)
rep("<section id='turnos' data-pane='turnos' hidden>", novas + SEC_IM + SEC_RG + "<section id='turnos' data-pane='turnos' hidden>")

rep("  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>",
    "  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>\n  <span class='gtitulo' data-g='info-militares' hidden>Informações de Militares</span>\n  <span class='gtitulo' data-g='registros-reds' hidden>Registros</span>\n  <span class='gtitulo' data-g='crimes-natureza' hidden>Crimes por natureza</span>\n  <span class='gtitulo' data-g='crimes-bairro' hidden>Crimes por bairro</span>")
rep("  <button class='tab' role='tab' data-grupo='patrulha-rural' data-tab='patrulha-rural' aria-selected='false'>Cadastramento rural</button>",
    "  <button class='tab' role='tab' data-grupo='patrulha-rural' data-tab='patrulha-rural' aria-selected='false'>Cadastramento rural</button>\n  <button class='tab' role='tab' data-grupo='info-militares' data-tab='info-militares' aria-selected='false'>Informações de Militares</button>\n  <button class='tab' role='tab' data-grupo='registros-reds' data-tab='registros-reds' aria-selected='false'>Registros</button>")

# grupo-topo: voltar, títulos, limpar todos
rep("  <button class='voltar' id='voltar'>Início</button>", "  <button class='voltar ant' id='voltar-ant' type='button' hidden>← Voltar</button>\n  <button class='voltar' id='voltar'>Início</button>")
rep("  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>", "  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>\n  <span class='gtitulo' data-g='resumo' hidden>Resumo do mês</span>\n  <span class='gtitulo' data-g='dia' hidden>Acompanhamento do dia / Cartão programa</span>\n  <button type='button' class='limpar' id='limpar-todos' hidden><span class='x' aria-hidden='true'>×</span><span class='limpar-rotulo-full'>Limpar todos os filtros</span><span class='limpar-rotulo-curto'>Limpar filtros</span></button>")
rep("<div class='card mt' id='aviso-mes' role='alert' hidden", "<div class='card mt mes-filtro' id='mes-filtro' hidden></div>\n<div class='card mt' id='aviso-mes' role='alert' hidden")
# abas
rep("  <button class='tab' role='tab' data-grupo='esc' data-tab='escala' id='tab-esc-atual'", "  <button class='tab' role='tab' data-grupo='esc' data-tab='esc-hoje' aria-selected='false'>Serviço de hoje</button>\n  <button class='tab' role='tab' data-grupo='esc' data-tab='escala' id='tab-esc-atual'")
rep("  <button class='tab' role='tab' data-grupo='divergencias' data-tab='divergencias' aria-selected='false'>Divergências</button>", "  <button class='tab' role='tab' data-grupo='divergencias' data-tab='divergencias' aria-selected='false'>Divergências</button>\n  <button class='tab' role='tab' data-grupo='resumo' data-tab='resumo-mes' aria-selected='false'>Resumo do mês</button>\n  <button class='tab' role='tab' data-grupo='resumo' data-tab='resumo-comp' aria-selected='false'>Comparativo mensal</button>\n  <button class='tab' role='tab' data-grupo='dia' data-tab='dia-acomp' aria-selected='false'>Acompanhamento do dia</button>\n  <button class='tab' role='tab' data-grupo='dia' data-tab='dia-cartao' aria-selected='false'>Cartão programa</button>")

# ---------- Operações: panorama diário ----------
rep("<section id='operacoes' data-pane='operacoes' hidden>\n", "<section id='operacoes' data-pane='operacoes' hidden>\n  <div data-draw='ops-dia-aviso'></div>\n")
rep("<section id='calendario' data-pane='calendario' hidden>\n", "<section id='calendario' data-pane='calendario' hidden>\n  <div data-draw='ops-dia-aviso'></div>\n")
rep("<section id='divops' data-pane='divops' hidden>\n", "<section id='divops' data-pane='divops' hidden>\n  <div data-draw='ops-dia-aviso'></div>\n")
rep("    <div class='chart' data-draw='g-ops'></div>", "    <div data-draw='g-ops-dia'></div>\n    <div class='chart' data-draw='g-ops'></div>")
rep("    <div data-draw='calendario'></div>\n  </div>\n", "    <div data-draw='calendario'></div>\n  </div>\n  <div class='card mt' id='cal-dia'>\n    <h2>Panorama do dia selecionado</h2>\n    <p class='sub'>Toque num dia do calendário ou escolha no seletor. O filtro vale para as abas Operações, Calendário e Divergências; “Limpar filtro” volta ao mês inteiro.</p>\n    <div data-draw='ops-dia-filtro'></div>\n    <div data-draw='ops-dia'></div>\n  </div>\n")
rep("<div class='meu' data-draw='meu'></div>", "<div class='meu' data-draw='meu'></div>\n  <p class='ext-abrir'><button type='button' class='btn-atalho' onclick=\"PA.abrirExtrato()\">Abrir o Extrato de horas</button></p>")
rep("  <button class='tab' role='tab' data-grupo='carga' data-tab='carga' aria-selected='false'>Horas do mês</button>", "  <button class='tab' role='tab' data-grupo='carga' data-tab='carga' aria-selected='false'>Horas do mês</button>\n  <button class='tab' role='tab' data-grupo='carga' data-tab='extrato-horas' aria-selected='false'>Extrato de horas</button>")
rep("<section id='carga' data-pane='carga' hidden>", "<section id='extrato-horas' data-pane='extrato-horas' hidden>\n  <div class='card' id='extrato-card'>\n    <h2>Extrato de horas</h2>\n    <p class='sub'>Escolha o seu nome e confira, turno por turno, o que você lançou no formulário CONTROLE - TURNO DE SERVIÇO e o que o painel considera no controle de horas: horário da escala, pré-turno, compensação noturna e total.</p>\n    <div data-draw='ext-sel'></div>\n    <div data-draw='ext-horas'></div>\n  </div>\n</section>\n\n<section id='carga' data-pane='carga' hidden>")

# Situação individual vira aba/card da mesma grade (não fica solta acima das abas)
rep("""<div class='card' id='meu-mes' data-grupo-show='carga' hidden>
  <h2>Situação individual</h2>
  <div class='filtro'><label for='sel-mil'>Militar</label><select id='sel-mil' data-draw='sel-mil' aria-label='Militar'></select></div>
  <div class='meu' data-draw='meu'></div>
  <p class='ext-abrir'><button type='button' class='btn-atalho' onclick="PA.abrirExtrato()">Abrir o Extrato de horas</button></p>
</div>
""", "")
rep("  <button class='tab' role='tab' data-grupo='carga' data-tab='turnos' aria-selected='false'>Escala e registros</button>",
    "  <button class='tab' role='tab' data-grupo='carga' data-tab='situacao' aria-selected='false'>Situação individual</button>\n  <button class='tab' role='tab' data-grupo='carga' data-tab='turnos' aria-selected='false'>Escala e registros</button>")
rep("<section id='turnos' data-pane='turnos' hidden>",
    "<section id='situacao' data-pane='situacao' hidden>\n  <div class='card' id='meu-mes'>\n    <h2>Situação individual</h2>\n    <p class='sub'>Escolha o militar para ver a carga horária, o serviço extraordinário e o limite de horas. A seleção também filtra as demais visões deste módulo.</p>\n    <div class='filtro'><label for='sel-mil'>Militar</label><select id='sel-mil' data-draw='sel-mil' aria-label='Militar'></select></div>\n    <div class='meu' data-draw='meu'></div>\n    <p class='ext-abrir'><button type='button' class='btn-atalho' onclick=\"PA.abrirExtrato()\">Abrir o Extrato de horas</button></p>\n  </div>\n</section>\n\n<section id='turnos' data-pane='turnos' hidden>")
rep("Selecione o militar em Situação individual, no topo, para filtrar os dados.",
    "Selecione o militar no card Situação individual para filtrar os dados.")
rep("  <div class='card mt' id='ops-lista'>\n    <h2>Operações lançadas</h2>", "  <div class='card mt' id='ops-diario'>\n    <h2>Panorama diário</h2>\n    <p class='sub'>Selecione um dia para ver os registros e o que estava previsto no cartão programa e não foi registrado. O filtro “Somente dias sem registro” lista os dias com previsão e nenhuma operação prevista registrada (mesmo critério do Calendário). Sem seleção, a aba fica como antes.</p>\n    <div data-draw='ops-dia-filtro'></div>\n    <div data-draw='ops-dia'></div>\n  </div>\n  <div class='card mt' id='ops-lista'>\n    <h2>Operações lançadas</h2>")
rep("rowsTable('t-ops','ops',[{k:'data',f:r=>dm(r.data)||r.data},{k:'indicador'},{k:'diao'},{k:'natureza',f:r=>r.verificar?r.natureza+' · NECESSÁRIO VERIFICAÇÃO (não conta)':r.natureza},{k:'reds'}]);",
    "rowsTable('t-ops','ops',[{k:'data',f:r=>dm(r.data)||r.data},{k:'indicador'},{k:'diao'},{k:'natureza',f:r=>r.verificar?r.natureza+' · NECESSÁRIO VERIFICAÇÃO (não conta)':r.natureza},{k:'reds'}],null,r=>!PA.selDia||r.data===PA.selDia);")

# ---------- Divergências por área ----------
rep("    <p class='sub'>Relação gerada automaticamente a partir da escala, do controle de turnos e do abastecimento.</p>\n    <div class='tw'><table class='cards'>\n      <thead><tr><th>Área</th><th>Gravidade</th><th>Descrição</th></tr></thead>",
    "    <p class='sub'>Relação gerada automaticamente a partir da escala, do controle de turnos, do abastecimento, das viaturas e das operações. Selecione a área para consultar os itens.</p>\n    <div data-draw='div-filtro'></div>\n    <p class='neutro' data-draw='div-neutro'></p>\n    <div class='tw div-tabela' id='div-tabela' hidden><table class='cards'>\n      <thead><tr><th>Área</th><th>Gravidade</th><th>Descrição</th></tr></thead>")
rep("    <p class='sub' data-draw='div-ops-res'></p>", "    <div data-draw='div-ops-filtro'></div>\n    <p class='sub' data-draw='div-ops-res'></p>")

# ---------- Patrulha Rural ----------
i, j = between("<section id='patrulha-rural' data-pane='patrulha-rural' hidden>", "</section>")
pr = s[i:j]
tot = re.search(r"  <div class='card'>\n    <h2>Cadastramento da Patrulha Rural</h2>.*?</div>\n", pr, re.S).group(0)
evo = re.search(r"  <div class='card mt'>\n    <h2>Evolução</h2>.*?</div>\n", pr, re.S).group(0)
novo_pr = ("<section id='patrulha-rural' data-pane='patrulha-rural' hidden>\n" + tot +
"  <div class='card mt' id='pr-mapa-card'>\n    <h2>Subsetores rurais</h2>\n    <p class='sub' data-draw='pr-sel'></p>\n    <div data-draw='pr-filtro'></div>\n    <div class='pr-map' id='pr-map' data-draw='pr-mapa' role='region' aria-label='Mapa dos subsetores rurais'></div>\n"
"    <div class='pr-leg'><span><i style='background:#a08f63'></i>Comunidade do plano com cadastro</span><span><i style='background:#fff'></i>Sem cadastro</span><span><i style='background:#d1c9b5;border-style:dashed'></i>A conferir</span></div>\n"
"    <p class='sub' style='margin-top:6px'>Contorno aproximado dos subsetores (não é limite oficial): áreas das localidades do IBGE (Censo 2022) já setorizadas, recortadas no limite municipal do IBGE. Toque no subsetor para filtrar; toque de novo para desfazer. O mapa mostra só limites, nomes de comunidades e dados agregados.</p>\n  </div>\n"
"  <div class='card mt' id='pr-resumo'>\n    <h2>Resumo por subsetor</h2>\n    <p class='sub'>Cadastros, comunidades do plano cobertas e pendentes. Estabelecimentos agropecuários e imóveis CAR são denominadores da base geográfica em 17/11/2026, só como apoio.</p>\n    <div data-draw='pr-cards'></div>\n  </div>\n"
"  <div class='card mt'>\n    <h2>Fila para a PR — comunidades do plano sem cadastro</h2>\n    <p class='sub'>Agrupada por subsetor. Sem nome de pessoa, telefone, CPF ou coordenada.</p>\n    <div data-draw='prural-lacunas'></div>\n  </div>\n"
+ evo +
"  <div class='card mt'>\n    <details><summary>Tabela por subsetor rural (09 a 14)</summary>\n    <div data-draw='prural-subsetores'></div>\n    </details>\n  </div>\n</section>")
s = s[:i] + novo_pr + s[j:]

# ---------- navegação com retorno ----------
rep("const abrir=(g,tab)=>{const ini=document.getElementById('inicio');", "const abrir0=(g,tab)=>{const ini=document.getElementById('inicio');")
rep("dash.setLink(g?(alvo||g):'inicio');window.scrollTo(0,0)};", "dash.setLink(g?(alvo||g):'inicio');window.scrollTo(0,0)};\nconst abrir=(g,tab,op)=>PA.nav?PA.nav(g,tab,op,abrir0):abrir0(g,tab);window.PA_abrir=abrir;")
rep("history.replaceState(null,'',u)", "history.replaceState(history.state,'',u)")
# ---------- dicas (tooltip): tocar de novo fecha; tocar fora fecha ----------
rep("return {show(lines,x,y){t.replaceChildren();", "return {show(lines,x,y){if(PA._tapT&&Date.now()-PA._tapT<400){if(!t.hidden&&t._alvo===PA._tapAlvo){t.hidden=true;t._alvo=null;return}t._alvo=PA._tapAlvo}t.replaceChildren();")
rep("window.dash=(function(){", "document.addEventListener('click',ev=>{window.PA=window.PA||{};PA._tapAlvo=ev.target.closest('td,.cald,rect,circle,path,.mi,.hturno')||ev.target;PA._tapT=Date.now()},true);\ndocument.addEventListener('click',ev=>{document.querySelectorAll('.tip:not([hidden])').forEach(t=>{if(!t.parentElement.contains(ev.target)){t.hidden=true;t._alvo=null}})});\nwindow.dash=(function(){")
# ---------- viatura: tocar de novo desmarca ----------
rep("const abrirV=()=>{PA.selVtr=r.viatura;", "const abrirV=()=>{PA.selVtr=PA.selVtr===r.viatura?'':r.viatura;")
# ---------- período: tocar de novo volta ao mês atual ----------
rep("document.querySelectorAll('.pbtn').forEach(b=>b.addEventListener('click',()=>{PA.per=b.dataset.per;", "document.querySelectorAll('.pbtn[data-per]').forEach(b=>b.addEventListener('click',()=>{PA.per=(PA.per===b.dataset.per&&b.dataset.per!=='mes')?'mes':b.dataset.per;b=[...document.querySelectorAll('.pbtn[data-per]')].find(x=>x.dataset.per===PA.per)||b;")
# ---------- intendência: tocar de novo desmarca; limpar categoria e pesquisa ----------
rep("  const estado={cat:'',termo:''};", "  const estado={cat:'',termo:''};PA.intEstado=estado;")
rep("b.addEventListener('click',()=>{estado.cat=k.id;chips();tabela()});ch.appendChild(b)})}", "b.addEventListener('click',()=>{estado.cat=(estado.cat===k.id&&k.id)?'':k.id;chips();tabela()});ch.appendChild(b)})}")
rep("el.appendChild(ch);\n    const cont=E('p','lista-cont');el.appendChild(cont);", "el.appendChild(ch);\n    const lpI=PA.btnLimpar(()=>{estado.cat='';estado.termo='';inp.value='';chips();tabela()},'Limpar filtros');lpI.style.marginBottom='8px';el.appendChild(lpI);PA.intLimpar=()=>{estado.cat='';estado.termo='';inp.value='';chips();tabela()};\n    const cont=E('p','lista-cont');el.appendChild(cont);")
rep("    function tabela(){const t=norm(estado.termo).trim();", "    function tabela(){lpI.hidden=!(estado.cat||estado.termo);const t=norm(estado.termo).trim();")

# ---------- Resumo do mês: carta compacta ----------
i, j = between("  dash.draw('k-carta',el=>{", "  dash.draw('k-carta-card',el=>{")
s = s[:i] + r"""  dash.draw('k-carta',el=>{
    const c=cartaDados();
    if(!c){el.textContent='Sem dados';return;}
    el.classList.add('kv-lista');el.replaceChildren();
    const fmt=n=>PA.fmtN(Math.abs(n));
    const itens=(c.itens||[]).map(cartaItemAtual).filter(x=>!/ESTOC|BAIX/i.test(String(x.situacao||''))).map(x=>{const o=x.kmRestanteOleo,m=x.kmRestanteMp;const ref=[o,m].filter(v=>v!=null&&!isNaN(v));return Object.assign(x,{min:ref.length?Math.min(...ref):Infinity})}).sort((a,b)=>a.min-b.min);
    const al=itens.filter(x=>x.alertaOleo==='vencido'||x.alertaMp==='vencido'||x.alertaOleo==='proximo'||x.alertaMp==='proximo');
    const lst=al.length?al:itens.slice(0,3);
    lst.forEach(x=>{const d=document.createElement('div');const venc=x.alertaOleo==='vencido'||x.alertaMp==='vencido';d.className='vt'+(venc?' vencido':(al.length?' proximo':''));
      const b=document.createElement('b');b.textContent=x.nome||x.prefixo;d.appendChild(b);
      const p=[];if(x.kmRestanteOleo!=null)p.push(x.kmRestanteOleo<0?'óleo vencido há '+fmt(x.kmRestanteOleo)+' km':'óleo em '+fmt(x.kmRestanteOleo)+' km');if(x.kmRestanteMp!=null)p.push(x.kmRestanteMp<0?'MP vencida há '+fmt(x.kmRestanteMp)+' km':'MP em '+fmt(x.kmRestanteMp)+' km');
      d.appendChild(document.createTextNode(' · '+(p.join(' · ')||'sem referência')));d.title=d.textContent;el.appendChild(d)});
    const rest=itens.length-lst.length;const t=document.createElement('div');t.className='vt';t.style.color='var(--color-fg-muted)';t.textContent=al.length?(rest>0?rest+' outra(s) em dia':''):(rest>0?'Todas em dia · '+rest+' outra(s)':'Todas em dia');if(t.textContent)el.appendChild(t);
    const mu=(c.itens||[]).filter(x=>x.multa);if(mu.length){const d=document.createElement('div');d.className='vt vencido';d.textContent='Multa: '+mu.map(x=>x.nome||x.prefixo).join(', ');el.appendChild(d)}
  });
""" + s[j - len("  dash.draw('k-carta-card',el=>{"):]

# ---------- regras de divergência ----------
patch_regras.aplicar(s, rep)
rep("  function aplicar(raw,origem){\n    PA.raw=raw||{};", "  function aplicar(raw,origem){\n    PA.raw=window.PA_NORM_Y99?window.PA_NORM_Y99(raw||{}):(raw||{});")
rep("if(igual){ultimo=raw;PA.raw=raw;", "if(igual){ultimo=raw;PA.raw=window.PA_NORM_Y99?window.PA_NORM_Y99(raw):raw;")

# ---------- addon JS antes da inicialização ----------
addon = open(os.path.join(D, 'parts', 'addon.js'), encoding='utf-8').read()

# v4.3.9: grupos de crimes do Código Penal no início da aba Crimes
SEC_CR = (
"  <div class='card' id='cr-grupos-card'>\n"
"    <h2>Crimes por grupo do Código Penal</h2>\n"
"    <p class='sub'>Os fatos do mês em Água Boa, agrupados pelos títulos do Código Penal e pelas leis especiais (Maria da Penha, drogas, armas e trânsito). Ao lado dos grupos, os cards Crimes por natureza e Crimes por bairro abrem o gráfico numa tela própria; o Voltar retorna para esta tela. Toque num grupo para ver os BOs na lista no fim da página. O detalhe do REDS abre numa janela sobreposta. O painel não exibe nomes de envolvidos, CPF, telefone nem endereço completo.</p>\n"
"    <p class='sub warn' data-draw='aviso' data-k='reds_crimes' hidden></p>\n"
"    <div data-draw='cr-grupos'></div>\n"
"  </div>\n"
)

rep("<section id='crimes' data-pane='crimes' hidden>\n  <div class='card' id='cr-natureza'>",
    "<section id='crimes' data-pane='crimes' hidden>\n" + SEC_CR + "  <div class='card' id='cr-natureza'>")
# Natureza e bairro saem da rolagem da tela Crimes e viram telas próprias (subcards).
rep(
"  <div class='card' id='cr-natureza'>\n"
"    <h2>Crimes por natureza</h2>\n"
"    <p class='sub'>Crimes registrados no mês em Água Boa.</p>\n"
"    <p class='sub warn' data-draw='aviso' data-k='reds_crimes' hidden></p>\n"
"    <p class='sub' data-draw='cr-fora'></p>\n"
"    <div class='chart' data-draw='g-cr-nat'></div>\n"
"  </div>\n"
"  <div class='card mt' id='cr-bairro'>\n"
"    <h2>Crimes por bairro ou comunidade</h2>\n"
"    <p class='sub'>Em vermelho, os pontos quentes (bairro com o número mínimo de crimes no mês definido nos parâmetros).</p>\n"
"    <div class='chart' data-draw='g-cr-bairro'></div>\n"
"  </div>\n",
"")
rep(
"  <div class='card mt' id='cr-heat'>\n"
"    <h2>Mapa de calor por bairro ou comunidade</h2>\n"
"    <div data-draw='heat-bairro'></div>\n"
"  </div>\n"
"</section>",
"  <div class='card mt' id='cr-heat'>\n"
"    <h2>Mapa de calor por bairro ou comunidade</h2>\n"
"    <div data-draw='heat-bairro'></div>\n"
"  </div>\n"
"  <div class='card mt' id='cr-bos-card'>\n"
"    <h2 class='pa-rec-cab'><button type='button' class='pa-rec-btn' id='cr-bos-toggle' aria-expanded='false' aria-controls='cr-bos-corpo'>Lista de BOs</button></h2>\n"
"    <div id='cr-bos-corpo' hidden>\n"
"      <p class='sub' id='cr-bos-dica'>Toque num grupo acima para ver os BOs deste mês em Água Boa.</p>\n"
"      <div data-draw='cr-grupo-lista'></div>\n"
"    </div>\n"
"  </div>\n"
"</section>\n"
"<section id='crimes-natureza' data-pane='crimes-natureza' hidden>\n"
"  <div class='card' id='cr-natureza'>\n"
"    <h2>Crimes por natureza</h2>\n"
"    <p class='sub'>Crimes tipificados do mês em Água Boa. Atendimentos U33004 e demais códigos U* não entram neste gráfico. O rótulo usa o nome curto da natureza e, no celular, fica acima da barra, sem corte à esquerda. Toque em ← Voltar para retornar à tela Crimes.</p>\n"
"    <p class='sub warn' data-draw='aviso' data-k='reds_crimes' hidden></p>\n"
"    <p class='sub' data-draw='cr-fora'></p>\n"
"    <div class='chart pa-hbar-wrap' data-draw='g-cr-nat'></div>\n"
"  </div>\n"
"</section>\n"
"<section id='crimes-bairro' data-pane='crimes-bairro' hidden>\n"
"  <div class='card' id='cr-bairro'>\n"
"    <h2>Crimes por bairro ou comunidade</h2>\n"
"    <p class='sub'>Em vermelho, os pontos quentes (bairro com o número mínimo de crimes no mês definido nos parâmetros). Atendimentos U33004 e demais códigos U* não entram neste gráfico. Toque em ← Voltar para retornar à tela Crimes.</p>\n"
"    <div class='chart pa-hbar-wrap' data-draw='g-cr-bairro'></div>\n"
"  </div>\n"
"</section>")


# v4.4.2 e v4.4.3 entram no teste e no oficial; o bloco OFICIAL remove faixa e dados estáticos
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v436.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v436_fix.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v437.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v438.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v440.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v442.js'), encoding='utf-8').read()
addon += '\n' + open(os.path.join(D, 'parts', 'addon_v443.js'), encoding='utf-8').read()
rep("p.textContent='Totais do mapa carga, sem numeração, patrimônio ou carga nominal. Quantidades individuais por militar não são exibidas neste painel, que é de acesso público.';", "p.textContent='Totais do mapa carga. A relação do material e o card Informações de Militares mostram a carga nominal (arma, colete e munição), com patrimônio e número de série. O número da CNH, o CPF, o telefone e o endereço não são exibidos.';")
rep("<script>\n/* Inicialização (v4.3.1", "<script>\n" + addon + "\n</script>\n<script>\n/* Inicialização (v4.3.1")
# ---------- v4.4.3 (26/11/2026): correções N1–N7, DSP como serviço, REDS conferido ----------
# (só no teste) window.PA_REDS_CONF_TESTE = cópia da aba CONFERÊNCIA em dados/reds_conf_2026-11.json, usada enquanto o servidor
# no ar (Code v4.3.8) não envia reds_conf; o bloco OFICIAL remove essa linha junto com PA_OPD_TESTE.
# N4 — a tabela do Cartão Programa (t-cp) já mostra só divergências; o botão "Só divergentes" fica só em t-cp-todos
rep("if(id==='t-cp-todos'||id==='t-cp'){", "if(id==='t-cp-todos'){")
# N5 — "Mostrar tratadas" fica oculto até existir registro de tratamento na planilha
rep("tr.style.opacity='.55';", "tr.style.opacity='.55';tr.hidden=true;", 2)
# DSP — Diligência de Segurança Pública é serviço (soma na carga; não reduz o limite)
rep("'SOU':10,'CPR':8};", "'SOU':10,'CPR':8,'DSP':(+window.PA_DSP_HORAS_DIA>0?+window.PA_DSP_HORAS_DIA:0)};", 2)
rep("if(k==='CPR')return {k,h:8,cat:'outro'};",
    "if(k==='CPR')return {k,h:8,cat:'outro'};if(k==='DSP'){const f=leg[k]?faixa(leg[k].horario):null;const h=f?Math.round(f.dur*10)/10:(+window.PA_DSP_HORAS_DIA>0?+window.PA_DSP_HORAS_DIA:0);return {k,h,cat:'servico',servico:true}}")
rep("efetivo.push(mil.filter(m=>info(m.cod[d-1]).h>0).length);",
    "efetivo.push(mil.filter(m=>{const z=info(m.cod[d-1]);return z.h>0||z.servico}).length);")
rep("m.cod.forEach((c,i)=>{const z=info(c);if(z.h){t++;h+=z.h;", "m.cod.forEach((c,i)=>{const z=info(c);if(z.h||z.servico){t++;h+=z.h;")
rep("if(z.h>0)(tur[z.k]=tur[z.k]||[]).push(m.militar);", "if(z.h>0||z.servico)(tur[z.k]=tur[z.k]||[]).push(m.militar);")
rep("if(h)leg[norm(c)]={codigo:c,horario:h}}}",
    "if(h)leg[norm(c)]={codigo:c,horario:h}}}\n    if(leg['DSP']&&/^DSP$/i.test(String(leg['DSP'].horario).trim()))leg['DSP'].horario='Diligência de Segurança Pública'+(+window.PA_DSP_HORAS_DIA>0?'':' (carga diária a definir)');")
rep("if(hh){sit=reg.length?'Cumprido'", "if(c==='DSP'&&!hh){sit=reg.length?'Cumprido':'DSP'}else if(hh){sit=reg.length?'Cumprido'")
# v4.4.4 — código sem horário de término (CPR, DSP com carga) só fica pendente depois que o dia termina (00h de Brasília do dia seguinte)
rep("if(f==null)return dia<=corte;", "if(f==null)return dia<=corte&&agoraMs>=Date.UTC(PA.M.ano,PA.M.mes-1,dia+1,3,0);")
rep("Previsto da escala = horas do turno + 30 min de pré-turno por turno escalado (não há pré-turno em folga, férias, licença, DP, RH ou CPR).",
    "Previsto da escala = horas do turno + 30 min de pré-turno por turno escalado (não há pré-turno em folga, férias, licença, DP, RH ou CPR). DSP (Diligência de Segurança Pública) é serviço: soma na carga horária e não reduz o limite; enquanto a carga diária da DSP não for definida, entram só as horas registradas no CONTROLE.")
# Outras situações (TC, DP, DSP sem horário etc.) no card Escala da tela inicial
rep("const af=textoAfast(sv);if(af.length)el.appendChild(E('div','sub2','Afastamentos: '+af.join(' · ')+'.'));",
    "const af=textoAfast(sv);if(af.length)el.appendChild(E('div','sub2','Afastamentos: '+af.join(' · ')+'.'));if(sv.outros&&sv.outros.length)el.appendChild(E('div','sub2','Outras situações: '+sv.outros.join(' · ')+'.'));")
# REDS — data de referência = última conferência (aba CONFERÊNCIA) ou último REDS; aviso único; faixa só com atraso > 1 dia
rep("""  const ref=dataRedsMaisRecente();
  if(!ref)return null;
  const n=diasEntre(ref,hojeISO());
  return {ref,dias:n,atrasado:n!=null&&n>1, texto:'REDS atualizado até '+isoDdMm(ref)+(n!=null&&n>1?' (há '+n+' dias)':'')};""",
"""  const ult=dataRedsMaisRecente();
  const cf=(typeof PA.ultimaConferenciaReds==='function')?PA.ultimaConferenciaReds():null;
  const conf=cf&&(!ult||cf.data>=ult)?cf.data:null;
  const ref=conf||ult;
  if(!ref)return null;
  const n=diasEntre(ref,hojeISO());
  const hBR=(new Date(Date.now()-3*3600e3)).getUTCHours();
  const atr=n!=null&&(n>2||(n===2&&hBR>=8));
  let texto=conf?'REDS conferido até '+isoDdMm(conf)+(ult&&ult<conf?' — sem novos registros desde '+isoDdMm(ult):(!ult?' — sem registros no mês':'')):'REDS atualizado até '+isoDdMm(ref);
  if(atr)texto+=' (há '+n+' dias)';
  return {ref,dias:n,atrasado:atr,conferido:!!conf,texto};""")
rep("""  box.classList.toggle('atrasado', !!info.atrasado);
  if(box.textContent!==info.texto) box.textContent=info.texto;""", """  box.classList.toggle('atrasado', !!info.atrasado);box.classList.toggle('em-dia', !info.atrasado);
  const tx=(info.atrasado?'⚠ ':'✓ ')+info.texto+(info.atrasado?' — conferência atrasada':'');
  if(box.textContent!==tx) box.textContent=tx;""")
rep("""  if(reds) item('REDS', reds.texto);""", """  /* v4.4.4: REDS só na faixa em destaque (#aviso-reds-ate), não em "Hoje e alertas" */""")
rep("function faixaReds(){", "PA._textoRedsAte=textoRedsAte;PA._faixaReds=faixaReds;\nfunction faixaReds(){")
# ---------- v4.4.5 (27/11/2026): calendário de operações ----------
# Antes: a previsão vinha só da aba CARTÃO PROGRAMA x REDS (montada pela R2 um dia depois), então dias ainda sem análise
# apareciam "sem previsão"; e o "hoje" era calculado em UTC (depois das 21h de Brasília o dia corrente já contava como passado).
rep("""dash.calc('calendario',{inputs:['cp','ops'],fn:(cp,ops)=>{const hoje=new Date().toISOString().slice(0,10);const out=[];
 for(let d=1;d<=PA.M.dias;d++){const data=PA.M.ym+'-'+String(d).padStart(2,'0');const prev=cp.filter(c=>c.data===data&&c.op);const feitos=prev.filter(c=>c.reds);const lanc=ops.filter(o=>o.data===data&&!o.verificar);
  let sit;if(data>hoje)sit='futuro';else if(data===hoje)sit='dia em andamento';else if(!prev.length)sit=lanc.length?'sem previsão (com registro)':'sem previsão';""",
"""dash.calc('calendario',{inputs:['cp','ops','reds_reg'],fn:(cp,ops,reg)=>{const hoje=new Date(Date.now()-3*3600e3).toISOString().slice(0,10);const out=[];
 const OPD=(()=>{const r=PA.raw&&PA.raw.opdiarias;if(r&&r.ok&&Array.isArray(r.dias))return r.dias;const t=window.PA_OPD_TESTE;return t&&t.ym===PA.M.ym&&Array.isArray(t.dias)?t.dias:[]})();
 const cpMax=d3.max(cp.filter(c=>c.op),c=>c.data)||'';
 for(let d=1;d<=PA.M.dias;d++){const data=PA.M.ym+'-'+String(d).padStart(2,'0');let prev=cp.filter(c=>c.data===data&&c.op);let fonte='cp';
  if(!prev.length&&data>cpMax){const od=OPD.find(x=>x.data===data);if(od&&od.itens&&od.itens.length){fonte='opd';prev=od.itens.map(it=>({data,op:it.nome,cod:String(it.codigo||'').trim().toUpperCase(),reds:''}))}}
  const feitos=prev.filter(c=>c.reds);const lanc=ops.filter(o=>o.data===data&&!o.verificar);
  let sit;if(data>hoje)sit='futuro';else if(data===hoje)sit='dia em andamento';else if(fonte==='opd')sit='aguardando REDS';else if(!prev.length)sit=lanc.length?'sem previsão (com registro)':'sem previsão';""")
rep("""  out.push({id:d,dia:d,data,prev:prev.map(c=>c.op+' ('+c.cod+')'+(c.reds?' ✓':' ✗')),""", """  out.push({id:d,dia:d,data,fonte,prev:prev.map(c=>c.op+' ('+c.cod+')'+(fonte==='opd'?'':(c.reds?' ✓':' ✗'))),""")
rep("""'sem previsão (com registro)':'color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)'};""",
    """'sem previsão (com registro)':'color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)','aguardando REDS':'transparent'};""")
rep("""if(r.sit==='futuro'||r.sit==='dia em andamento')c.style.border""", """if(r.sit==='futuro'||r.sit==='dia em andamento'||r.sit==='aguardando REDS')c.style.border""", 2)
rep("""<span style='--sw:color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)'>Sem previsão</span></div>""",
    """<span style='--sw:color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)'>Sem previsão</span><span style='--sw:transparent'>Aguardando REDS (tracejado: dia em andamento, futuro ou REDS ainda não conferido)</span></div>""")
# v4.4.5 — METAS: realizado e projeção vêm da aba METAS da planilha REDS (R2) quando houver; o cálculo no navegador fica só como reserva
rep("""  const MP=new Map(mplan.map(o=>[String(o['SIGLA']||'').trim().toUpperCase(),numBR(o['META'])]));""",
"""  const MP=new Map(mplan.map(o=>[String(o['SIGLA']||'').trim().toUpperCase(),numBR(o['META'])]));
  const MR=new Map(mplan.map(o=>{const ks=Object.keys(o);const g=re=>{const c=ks.find(x=>re.test(String(x).toUpperCase()));return c!=null&&String(o[c]).trim()!==''?numBR(o[c]):null};return [String(o['SIGLA']||'').trim().toUpperCase(),{real:g(/^REALIZADO/),proj:g(/^PROJE/)}]}));""")
rep("""    const falta=Math.max(0,(meta||0)-real);const pct=meta?real/meta:null;const proj=it.devidas?null:Math.round(real/dr*PA.M.dias*10)/10;""",
"""    const LP=MR.get(it.sigla);if(LP&&LP.real!=null){real=LP.real;origem='Aba METAS da planilha REDS (R2)'}
    const falta=Math.max(0,(meta||0)-real);const pct=meta?real/meta:null;const proj=it.devidas?null:(LP&&LP.proj!=null?LP.proj:Math.round(real/dr*PA.M.dias*10)/10);""")
# ---------- v4.4.6 (27/11/2026): visitas A20001 e A20002 em linhas separadas ----------
# Causa: a aba CRIMES E VISITAS indica 2 visitas no mesmo crime ("A20002 / U33004 / A20001") e o painel tratava o crime
# como 1 visita só: se a A20002 já tinha REDS, mostrava "Realizada" mesmo com a A20001 PENDENTE na coluna STATUS DA VISITA.
# Agora cada código indicado vira 1 linha, e a situação de cada uma vem do texto da própria planilha (colunas
# STATUS DA VISITA e VISITA JÁ REGISTRADA NO REDS, lidas pelo nome). Nenhum número novo é calculado.
rep("""  return cr.filter(c=>/A20028|A20001|U33004|A20002/i.test(c.visita)).map(c=>{const dias=c.data?Math.max(0,Math.round((new Date(hoje+'T12:00:00')-new Date(c.data+'T12:00:00'))/ms)):null;const feita=!!String(c.visita_reds||'').trim();const fora=c.municipio!==METAS.municipio;""",
"""  return cr.filter(c=>/A20028|A20001|U33004|A20002/i.test(c.visita)).flatMap(c=>{const dias=c.data?Math.max(0,Math.round((new Date(hoje+'T12:00:00')-new Date(c.data+'T12:00:00'))/ms)):null;const fora=c.municipio!==METAS.municipio;
    const vis=String(c.visita||'').toUpperCase();const cods=[...new Set((vis.match(/A20028|A20001|A20002|U33004/g)||[]).map(x=>x==='U33004'?'A20002':x))];
    const st=String(c.status||'');const vr=String(c.visita_reds||'').trim();
    return cods.map(cod=>{let feita;
    if(new RegExp(cod+'[^;|]*registrad','i').test(st))feita=true;else if(new RegExp(cod+'[^;|]*PENDENTE','i').test(st))feita=false;else if(cods.length===1)feita=!!vr;else feita=vr.includes(cod);
    const vreds=feita?((cods.length>1&&vr.split(/[;|]/).filter(x=>x.includes(cod)).join('; '))||vr):'';
    const codigo=cod==='A20002'&&/U33004/.test(vis)?'A20002 / U33004':cod;""")
rep("""    const situacao=feita?'Realizada ('+c.visita_reds+')':fora?'Fora de Água Boa – não conta':!prazo?'Pendente':vencida?'Vencida':'No prazo';
    return {id:c.reds,reds:c.reds,codigo:c.visita,natureza:c.natureza,data:c.data,bairro:c.bairro,endereco:c.endereco,dias,prazo,vencida,feita,fora,sugeridos,situacao}}).sort(""",
"""    const situacao=feita?'Realizada'+(vreds?' ('+vreds+')':''):fora?'Fora de Água Boa – não conta':!prazo?'Pendente':vencida?'Vencida':'No prazo';
    return {id:c.reds+'|'+cod,reds:c.reds,codigo,natureza:c.natureza,data:c.data,bairro:c.bairro,endereco:c.endereco,dias,prazo,vencida,feita,fora,sugeridos,situacao}})}).sort(""")
rep("""A20001: crime violento com vítima não fatal. U33004/A20002: visita a vítima de violência doméstica (recomendada, fora da meta da P3). Cada crime gera 1 visita.""",
"""A20001: devida conforme a coluna GERA VISITA da aba D_NATUREZAS_CV (crime violento do rol, violência doméstica, lesão corporal e crimes que podem evoluir para crime violento). U33004/A20002: visita a vítima de violência doméstica (fora da meta da P3). Quando o crime pede as duas visitas, cada uma aparece em sua linha, com a situação própria lida da planilha.""")
# cache local separado do oficial
rep("const CK='pa_v434_dados_'", "const CK='pa_v446t_dados_'")
s = s.replace("/^pa_v434_dados_/", "/^pa_v446t_dados_/")

OUT = D
if os.environ.get('OFICIAL') == '1':
    # ---------- build OFICIAL v4.4.5 (sem marcas de teste, sem dados estáticos) ----------
    import re as _r
    OUT = os.path.join(D, 'oficial'); os.makedirs(OUT, exist_ok=True)
    s = s.replace("<title>Painel Água Boa — versão de teste v4.4.6 (27/11/2026)</title>", "<title>Painel de Controle — Destacamento de Água Boa — PMMG</title>")
    s = s.replace("Painel v4.4.6-teste", "Painel v4.4.6")
    s, k1 = _r.subn(r"<div class='banner-teste' role='status'>.*?</div>\n", "", s, count=1, flags=_r.S)
    k2 = 1  # v4.4.5: não há mais dado de teste embutido para remover
    s = s.replace("pa_v446t_dados_", "pa_v446_dados_")
    s = s.replace("CONFIGURAÇÃO ÚNICA DA VERSÃO DE TESTE v4.3.5", "CONFIGURAÇÃO ÚNICA v4.4.6")
    assert k1 == 1 and k2 == 1, (k1, k2)
# v4.4.5: caminhos mortos de dado embutido viram 'undefined' (nenhuma variável de teste existe mais)
s = s.replace('window.PA_OPD_TESTE', 'undefined').replace('window.PA_REDS_CONF_TESTE', 'undefined')
open(os.path.join(OUT, 'src.html'), 'w', encoding='utf-8').write(s)
print('src ok', len(s))
subprocess.run([sys.executable, os.path.join(D, 'build.py'), os.path.join(OUT, 'src.html'), os.path.join(OUT, 'index.html')], check=True)
h = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
for x in ['CPF']:
    pass
print('ok')
