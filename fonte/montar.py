#!/usr/bin/env python3
"""Monta a versão de teste v4.3.5 a partir do fonte oficial v4.3.4 (não altera o oficial)."""
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
rep("<title>Painel de Controle — Destacamento de Água Boa — PMMG</title>", "<title>Painel Água Boa — versão de teste v4.3.6 (19/11/2026)</title>")
rep("<span style='margin:0 8px'>Painel v4.3.4</span>", "<span style='margin:0 8px'>Painel v4.3.6-teste</span>")
# v4.3.5-teste (18/11): pedido do Matheus – remover os cards de visitas tranquilizadoras da Carga horária e do Cartão programa
import re as _re
for _id in ('vis-escala','vis-cartao'):
    _m=_re.search(r"\n  <div class='card mt' id='%s'>.*?\n  </div>(?=\n)"%_id,s,_re.S)
    assert _m, _id
    s=s.replace(_m.group(0),'',1)
geo = open(os.path.join(D, 'geo', 'geo_prural.json'), encoding='utf-8').read()
opd = open(os.path.join(D, 'dados', 'opdiarias_2026-11.json'), encoding='utf-8').read()
cfg = open(os.path.join(D, 'parts', 'config_head.js'), encoding='utf-8').read()
rep("<base target=\"_top\">", "<script>\n" + cfg + "\nwindow.PA_GEO=" + geo + ";\nwindow.PA_OPD_TESTE=" + json.dumps(json.loads(opd), ensure_ascii=False, separators=(',', ':')) + ";\n</script>\n<base target=\"_top\">")
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
sec = ''.join(mc(x) for x in ['produtividade', 'crimes', 'intendencia', 'eventos', 'patrulha-rural', 'divergencias'])
sec = sec.replace("<button class='mcard alerta' data-abrir='divergencias'>", "<button class='mcard' data-abrir='divergencias'>").replace("Divergências a regularizar na escala, nos turnos, nas viaturas e no abastecimento.", "Itens para conferir por área: carga horária, escala, abastecimento, viaturas e operações.").replace("<b data-draw='m-div'>—</b> pendências a regularizar", "<b data-draw='m-div'>—</b> itens para conferir")
I = lambda ico: "<span class='mh'><svg class='ico' aria-hidden='true'><use href='#%s'/></svg>" % ico
novo_inicio = ("<div id='inicio'>\n"
"<div class='banner-teste' role='status'>\n<p><strong>Versão de teste v4.3.6</strong> — 19/11/2026 (horário de Brasília). O <a href='https://painelaguaboa.github.io/'>painel oficial</a> não foi alterado. Os dados são os mesmos do painel oficial; o Controle de Operações Diárias usa dados de teste. O cartão programa do dia é só consulta.</p>\n</div>\n"
"<div id='menu'>\n<div class='menu menu-principal'>\n"
"  <button class='mcard' data-abrir='carga'>" + I('i-relogio') + "<span class='mt1'>Carga horária</span></span><span class='md'>Horas do mês por militar, turnos registrados, serviço extraordinário, férias e situação individual.</span><span class='mv'><b data-draw='m-carga'>—</b> acima do limite do mês</span></button>\n"
"  <button class='mcard' data-abrir='esc'>" + I('i-cal') + "<span class='mt1'>Escala</span></span><span class='md'>Serviço de hoje, próximos sete dias, escala do mês e previsão do mês seguinte.</span><span class='mv' data-draw='m-esc'>—</span></button>\n"
"  <button class='mcard' data-ir='viaturas'>" + I('i-vtr') + "<span class='mt1'>Abastecimento</span></span><span class='md'>Conferência dos abastecimentos com os turnos, SIAD e carta situacional.</span><span class='mv'><b data-draw='m-log'>—</b> em combustível no mês</span></button>\n"
"  <button class='mcard' data-ir='odometro'>" + I('i-vtr') + "<span class='mt1'>Viaturas</span></span><span class='md'>Odômetro, emprego por viatura, km por militar, motos e revisão.</span><span class='mv'><b data-draw='m-vtr'>—</b> viaturas na carta situacional</span></button>\n"
"  <button class='mcard' data-abrir='operacoes'>" + I('i-alvo') + "<span class='mt1'>Operações</span></span><span class='md'>Operações por indicador, panorama diário, calendário e conferência.</span><span class='mv'><b data-draw='m-ops'>—</b> lançadas no mês</span></button>\n"
"  <button class='mcard' data-abrir='resumo'>" + I('i-graf') + "<span class='mt1'>Resumo do mês</span></span><span class='md'>Indicadores do mês e comparativo mensal.</span><span class='mv'><b data-draw='m-resumo'>—</b> indicadores</span></button>\n"
"  <button class='mcard' data-abrir='dia'>" + I('i-relogio') + "<span class='mt1'>Acompanhamento do dia / Cartão programa</span></span><span class='md'>Acompanhamento do dia, consulta do cartão programa e Controle de Operações Diárias.</span><span class='mv'><b data-draw='m-dia'>—</b> atividades previstas para hoje</span></button>\n"
"</div>\n<div class='mais-mod'>\n<h2>Demais módulos</h2>\n<div class='menu menu-sec'>\n" + sec + "</div>\n</div>\n</div>\n</div>\n\n")
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
rep("<section id='turnos' data-pane='turnos' hidden>", novas + "<section id='turnos' data-pane='turnos' hidden>")
# grupo-topo: voltar, títulos, limpar todos
rep("  <button class='voltar' id='voltar'>Início</button>", "  <button class='voltar ant' id='voltar-ant' type='button' hidden>← Voltar</button>\n  <button class='voltar' id='voltar'>Início</button>")
rep("  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>", "  <span class='gtitulo' data-g='divergencias' hidden>Divergências</span>\n  <span class='gtitulo' data-g='resumo' hidden>Resumo do mês</span>\n  <span class='gtitulo' data-g='dia' hidden>Acompanhamento do dia / Cartão programa</span>\n  <button type='button' class='limpar' id='limpar-todos' hidden><span class='x' aria-hidden='true'>×</span>Limpar todos os filtros</button>")
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
if os.environ.get('OFICIAL') != '1':
    addon += '\n' + open(os.path.join(D, 'parts', 'addon_v436.js'), encoding='utf-8').read()
rep("<script>\n/* Inicialização (v4.3.1", "<script>\n" + addon + "\n</script>\n<script>\n/* Inicialização (v4.3.1")
# cache local separado do oficial
rep("const CK='pa_v434_dados_'", "const CK='pa_v435t_dados_'")
s = s.replace("/^pa_v434_dados_/", "/^pa_v435t_dados_/")

OUT = D
if os.environ.get('OFICIAL') == '1':
    # ---------- build OFICIAL v4.3.5 (sem marcas de teste, sem dados estáticos) ----------
    import re as _r
    OUT = os.path.join(D, 'oficial'); os.makedirs(OUT, exist_ok=True)
    s = s.replace("<title>Painel Água Boa — versão de teste v4.3.6 (19/11/2026)</title>", "<title>Painel de Controle — Destacamento de Água Boa — PMMG</title>")
    s = s.replace("Painel v4.3.6-teste", "Painel v4.3.5")
    s, k1 = _r.subn(r"<div class='banner-teste' role='status'>.*?</div>\n", "", s, count=1, flags=_r.S)
    s, k2 = _r.subn(r"\nwindow\.PA_OPD_TESTE=.*?;\n</script>", "\n</script>", s, count=1, flags=_r.S)
    s = s.replace("pa_v435t_dados_", "pa_v435_dados_")
    s = s.replace("CONFIGURAÇÃO ÚNICA DA VERSÃO DE TESTE v4.3.5", "CONFIGURAÇÃO ÚNICA v4.3.5")
    assert k1 == 1 and k2 == 1, (k1, k2)
open(os.path.join(OUT, 'src.html'), 'w', encoding='utf-8').write(s)
print('src ok', len(s))
subprocess.run([sys.executable, os.path.join(D, 'build.py'), os.path.join(OUT, 'src.html'), os.path.join(OUT, 'index.html')], check=True)
h = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
for x in ['CPF']:
    pass
print('ok')
