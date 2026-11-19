/* ===== v4.3.5-teste: filtros com limpeza, navegação com retorno, panorama diário, divergências por área,
   Patrulha Rural com mapa, cartão programa e Controle de Operações Diárias. ===== */
(function(){
const PA=window.PA;
const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const p2=n=>String(n).padStart(2,'0');
const dmx=s=>s?String(s).slice(8,10)+'/'+String(s).slice(5,7):'—';
const SEMANA=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const hojeISO=()=>{const d=new Date(Date.now()-3*36e5);return d.toISOString().slice(0,10)};
PA.E=E;

/* ---------- 1. Registro de filtros e botão "Limpar" ---------- */
PA.F=PA.F||{};
PA.regFiltro=function(id,o){PA.F[id]=o};
PA.btnLimpar=function(fn,txt){const b=E('button','limpar');b.type='button';const x=E('span','x','×');x.setAttribute('aria-hidden','true');b.append(x,document.createTextNode(txt||'Limpar filtro'));b.addEventListener('click',ev=>{ev.stopPropagation();fn();PA.atuFiltros()});return b};
PA.atuFiltros=function(){let n=0;Object.keys(PA.F).forEach(k=>{const f=PA.F[k];let a=false;try{a=!!f.ativo()}catch(e){}if(a)n++;(f.btns?f.btns():[]).forEach(b=>{if(b)b.hidden=!a})});const lt=document.getElementById('limpar-todos');if(lt)lt.hidden=n<2};
PA.limparTodos=function(){Object.keys(PA.F).forEach(k=>{const f=PA.F[k];try{if(f.ativo())f.limpar()}catch(e){}});PA.atuFiltros()};
['click','change','input'].forEach(t=>document.addEventListener(t,()=>setTimeout(PA.atuFiltros,0)));

/* militar (Carga horária) e militar (Resultados): select + × */
function limparSelect(id,state){const sel=document.getElementById(id);if(!sel)return null;const b=PA.btnLimpar(()=>{sel.value='';sel.dispatchEvent(new Event('change'))});b.hidden=true;sel.insertAdjacentElement('afterend',b);PA.regFiltro(id,{ativo:()=>!!PA[state],limpar:()=>{sel.value='';if(sel.onchange)sel.onchange()},btns:()=>[b]});return b}
limparSelect('sel-mil','selMil');limparSelect('sel-res','selRes');
/* viatura selecionada */
(function(){const card=document.getElementById('vtr-detalhe');if(!card)return;const b=PA.btnLimpar(()=>{PA.selVtr='';dash.draw('odo-cards');dash.draw('vtr-det')},'Limpar seleção da viatura');b.hidden=true;b.style.marginBottom='8px';card.querySelector('h2').insertAdjacentElement('afterend',b);
 const c2=document.getElementById('odo-atual');let b2=null;if(c2){b2=PA.btnLimpar(()=>{PA.selVtr='';dash.draw('odo-cards');dash.draw('vtr-det')},'Limpar seleção da viatura');b2.hidden=true;b2.style.marginTop='8px';c2.appendChild(b2)}
 PA.regFiltro('vtr',{ativo:()=>!!PA.selVtr,limpar:()=>{PA.selVtr='';dash.draw('odo-cards');dash.draw('vtr-det')},btns:()=>[b,b2]})})();
/* período (Logística) */
(function(){const per=document.querySelector('#periodo .per');if(!per)return;const b=PA.btnLimpar(()=>PA.setPer('mes'),'Voltar ao mês atual');b.hidden=true;b.style.marginTop='8px';per.insertAdjacentElement('afterend',b);
 PA.setPer=v=>{PA.per=v;document.querySelectorAll('.pbtn[data-per]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.per===v?'true':'false'));dash.draw('vtr-det');dash.draw('g-vtr-comp')};
 PA.regFiltro('per',{ativo:()=>PA.per&&PA.per!=='mes',limpar:()=>PA.setPer('mes'),btns:()=>[b]})})();
/* intendência: categoria e pesquisa */
PA.regFiltro('int',{ativo:()=>!!(PA.intEstado&&(PA.intEstado.cat||PA.intEstado.termo)),limpar:()=>{if(PA.intLimpar)PA.intLimpar()},btns:()=>[]});
/* mês exibido (?mes=AAAA-MM) */
(function(){const bar=document.getElementById('mes-filtro');if(!bar||!window.PA_NO_GAS)return;const m=new URLSearchParams(location.search).get('mes');if(!m)return;
 const nomes=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];const t=E('span',null,'Mês exibido: '+(nomes[+m.slice(5,7)-1]||m)+'/'+m.slice(0,4)+'.');
 const b=PA.btnLimpar(()=>{const u=new URL(location.href);u.searchParams.delete('mes');location.href=u.toString()},'Voltar ao mês atual');bar.append(t,b);bar.hidden=false;
 PA.regFiltro('mes',{ativo:()=>true,limpar:()=>{},btns:()=>[b]})})();

/* ---------- 2. Navegação com retorno (← Voltar e voltar do navegador/celular) ---------- */
PA._pilha=[];
PA.nav=function(g,tab,op,abrir0){op=op||{};
 const atual=PA._navAtual||{g:null,tab:null};const y=window.scrollY||0;
 const inicial=!PA._navPronto;
 if(!op.semHist&&!inicial&&!PA._pop){const novo={g:g||null,tab:tab||null};if(novo.g!==atual.g||novo.tab!==atual.tab){
   PA._pilha.push({g:atual.g,tab:atual.tab,y});
   if(window.PA_NO_GAS){try{history.replaceState(Object.assign({},history.state||{},{pa:1,g:atual.g,tab:atual.tab,y,n:PA._pilha.length-1}),'');history.pushState({pa:1,g:novo.g,tab:novo.tab,y:0,n:PA._pilha.length},'')}catch(e){}}}}
 abrir0(g,tab);
 const at=document.querySelector('#abas .tab[aria-selected="true"]');PA._navAtual={g:g||null,tab:g?(at?at.dataset.tab:tab):null};
 const vb=document.getElementById('voltar-ant');if(vb)vb.hidden=!PA._pilha.length||!g;
 if(op.y!=null){const yy=op.y;requestAnimationFrame(()=>setTimeout(()=>window.scrollTo(0,yy),60))}
};
PA.voltar=function(){if(!PA._pilha.length){PA_abrir(null);return}if(window.PA_NO_GAS&&history.state&&history.state.pa){history.back();return}const s=PA._pilha.pop();PA_abrir(s.g,s.tab,{semHist:true,y:s.y})};
window.addEventListener('popstate',ev=>{const s=ev.state;if(!s||!s.pa)return;PA._pop=true;
 while(PA._pilha.length>(s.n||0))PA._pilha.pop();
 PA_abrir(s.g,s.tab,{semHist:true,y:s.y||0});setTimeout(()=>{PA._pop=false},150)});
window.addEventListener('load',()=>setTimeout(()=>{PA._navPronto=true;try{if(window.PA_NO_GAS)history.replaceState(Object.assign({},history.state||{},{pa:1,g:(PA._navAtual||{}).g||null,tab:(PA._navAtual||{}).tab||null,y:0,n:0}),'')}catch(e){}},0));
(function(){const vb=document.getElementById('voltar-ant');if(vb)vb.addEventListener('click',()=>PA.voltar());const lt=document.getElementById('limpar-todos');if(lt)lt.addEventListener('click',()=>PA.limparTodos())})();

/* ---------- 3. Tela inicial: indicadores neutros dos cards ---------- */
dash.draw('m-vtr',el=>{const c=PA.raw&&PA.raw.carta;const n=c&&c.itens?c.itens.length:null;el.textContent=n==null?'—':String(n)});
dash.draw('m-resumo',el=>{el.textContent=String(document.querySelectorAll('#kpis > .card').length||'—')});

/* ---------- 4. Operações: panorama diário e dias sem registro ---------- */
PA.selDia=PA.selDia||'';PA.soSemReg=!!PA.soSemReg;
const regDia=()=>{const d=dash.data('reds_reg');return d.status==='ok'&&d.data?d.data:[]};
function situacaoDias(){const c=dash.data('calendario');return c.status==='ok'&&c.data?c.data:[]}
const semRegistro=r=>r.sit==='previsto sem registro';
function redesOps(){['ops-dia-aviso','ops-dia-filtro','ops-dia','g-ops-dia','t-ops','ops-vazio','calendario','t-cal-sem','t-div-ops','div-ops-res'].forEach(n=>dash.draw(n));const g=document.querySelector("[data-draw='g-ops']");if(g){const h=!!PA.selDia;if(g.hidden!==h){g.hidden=h;if(!h)dash.draw('g-ops')}}}
/* Seleciona (ou desmarca, tocando de novo) um dia: filtra TODA a área de Operações e mostra o panorama logo abaixo. */
PA.setDia=function(data,doSeletor){const novo=doSeletor?(data||''):(PA.selDia===data?'':data);PA.selDia=novo;if(novo&&PA.soSemReg){const r=situacaoDias().find(x=>x.data===novo);if(r&&!semRegistro(r))PA.soSemReg=false}redesOps();
 if(novo){requestAnimationFrame(()=>{const alvo=[...document.querySelectorAll('.pdia')].find(x=>!x.closest('[hidden]'));if(alvo){let topo=0;let b=document.elementFromPoint(Math.round(innerWidth/2),4);while(b&&b!==document.body){const ps=getComputedStyle(b).position;if(ps==='sticky'||ps==='fixed'){topo=b.getBoundingClientRect().bottom;break}b=b.parentElement}const y=alvo.getBoundingClientRect().top+window.scrollY-topo-12;window.scrollTo({top:Math.max(0,y),behavior:'smooth'})}})}};
PA.regFiltro('ops-dia',{ativo:()=>!!PA.selDia,limpar:()=>{PA.selDia='';redesOps()},btns:()=>[]});
PA.regFiltro('ops-sem',{ativo:()=>PA.soSemReg,limpar:()=>{PA.soSemReg=false;redesOps()},btns:()=>[]});
dash.draw('ops-dia-filtro',el=>{el.replaceChildren();const dias=situacaoDias();if(!dias.length){el.textContent='—';return}
 const bar=E('div','fbar');const lb=E('label',null,'Dia');const sid='sel-dia'+(el.closest('#calendario')?'-cal':'');lb.htmlFor=sid;const sel=E('select');sel.id=sid;sel.className='sel-dia';sel.setAttribute('aria-label','Dia');
 const lista=dias.filter(r=>r.sit!=='futuro'&&(!PA.soSemReg||semRegistro(r)));
 sel.appendChild(new Option(PA.soSemReg?'Selecione um dia sem registro':'Todos os dias (sem filtro)',''));
 lista.forEach(r=>{const o=new Option(p2(r.dia)+'/'+PA.M.mm+' · '+r.sit+(r.np?' ('+r.nf+'/'+r.np+')':''),r.data);sel.appendChild(o)});
 if(PA.selDia&&!lista.some(r=>r.data===PA.selDia))PA.selDia='';
 sel.value=PA.selDia;sel.onchange=()=>{PA.setDia(sel.value,true)};
 const tg=E('button','pbtn','Somente dias sem registro');tg.type='button';tg.setAttribute('aria-pressed',String(PA.soSemReg));tg.addEventListener('click',()=>{PA.soSemReg=!PA.soSemReg;redesOps()});
 const lp=PA.btnLimpar(()=>{PA.selDia='';PA.soSemReg=false;redesOps()});lp.hidden=!(PA.selDia||PA.soSemReg);
 bar.append(lb,sel,tg,lp);el.appendChild(bar);
 const n=dias.filter(semRegistro).length;const p=E('p','neutro',n?n+' dia(s) do mês com previsão no cartão programa e nenhuma operação prevista registrada.':'Não há dia com previsão sem registro até o momento.');el.appendChild(p)});
dash.draw('ops-dia',el=>{el.replaceChildren();const dias=situacaoDias();if(!dias.length)return;
 if(!PA.selDia&&PA.soSemReg){const sem=dias.filter(semRegistro);if(!sem.length){el.appendChild(E('p','sub','Não há dia com previsão sem registro.'));return}
  const h=E('h3',null,'Dias com previsão sem registro');el.appendChild(h);const tw=E('div','tw');const tb=E('table','cards');tb.innerHTML='<thead><tr><th>Data</th><th>Previsto</th><th>Lançado na aba do mês</th></tr></thead>';const body=E('tbody');
  sem.forEach(r=>{const tr=E('tr','semreg');tr.style.cursor='pointer';tr.tabIndex=0;tr.title='Abrir o panorama do dia';[[dmx(r.data)+' · '+SEMANA[new Date(r.data+'T12:00:00').getDay()],'Data'],[r.prev.join(' · '),'Previsto'],[r.lanc.join(', ')||'nenhuma','Lançado na aba do mês']].forEach(([t,l])=>{const td=E('td',null,t);td.setAttribute('data-label',l);tr.appendChild(td)});const ir=()=>PA.setDia(r.data,true);tr.addEventListener('click',ir);tr.addEventListener('keydown',e=>{if(e.key==='Enter')ir()});body.appendChild(tr)});
  tb.appendChild(body);tw.appendChild(tb);el.appendChild(tw);el.appendChild(E('p','sub','Selecione a linha para abrir o panorama do dia.'));return}
 if(!PA.selDia)return;
 const r=dias.find(x=>x.data===PA.selDia);if(!r)return;const box=E('div','pdia');
 box.appendChild(E('div','dh',dmx(r.data)+' · '+SEMANA[new Date(r.data+'T12:00:00').getDay()]+' · '+r.sit));
 const cpD=(dash.data('cp').data||[]).filter(c=>c.data===r.data&&c.op);const ops=(dash.data('ops').data||[]).filter(o=>o.data===r.data);const reg=regDia().filter(x=>x.data===r.data);
 const k=E('div','meu');[[cpD.length,'Previstas no cartão'],[cpD.filter(c=>c.reds).length,'Previstas com REDS'],[cpD.filter(c=>!c.reds).length,'Previstas sem registro'],[ops.filter(o=>!o.verificar).length,'Lançadas na aba '+PA.M.NOME],[reg.length,'REDS do dia']].forEach(([v,l])=>{const m=E('div','mi');m.append(E('div','kv sm',String(v)),E('div','kl',l));k.appendChild(m)});box.appendChild(k);
 const sem=cpD.filter(c=>!c.reds);
 if(sem.length){box.appendChild(E('h3',null,'Previsto e não registrado'));const d=E('div','semr');const ul=E('ul','lst');sem.forEach(c=>ul.appendChild(E('li',null,c.op+' ('+c.cod+')'+(c.equipe?' · previsto: '+c.equipe:''))));d.appendChild(ul);box.appendChild(d)}
 const tabela=(tit,hd,linhas,vazio)=>{box.appendChild(E('h3',null,tit));if(!linhas.length){box.appendChild(E('p','sub',vazio));return}const tw=E('div','tw');const tb=E('table','cards');tb.innerHTML='<thead><tr>'+hd.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead>';const body=E('tbody');linhas.forEach(l=>{const tr=E('tr');l.forEach((v,i)=>{const td=E('td',null,v==null||v===''?'—':String(v));td.setAttribute('data-label',hd[i]);tr.appendChild(td)});body.appendChild(tr)});tb.appendChild(body);tw.appendChild(tb);box.appendChild(tw)};
 tabela('Cartão programa do dia',['Operação prevista','Código previsto','Equipe/turno','Nº REDS','Situação'],cpD.map(c=>[c.op,c.cod,c.equipe,c.reds,c.status]),'Sem previsão no cartão programa neste dia.');
 tabela('Operações lançadas na aba '+PA.M.NOME,['Indicador','DIAO','Natureza','Nº REDS','Horário'],ops.map(o=>[o.indicador,o.diao,o.verificar?o.natureza+' · NECESSÁRIO VERIFICAÇÃO (não conta)':o.natureza,o.reds,o.inicio&&o.termino?o.inicio+'–'+o.termino:'']),'Nenhuma operação lançada na aba do mês neste dia.');
 tabela('REDS registrados no dia (todas as naturezas)',['Nº REDS','Tipo','Código','Natureza','Município','Bairro/comunidade','Responsável'],reg.map(x=>[x.reds,x.tipo,x.codigo,x.natureza,x.municipio,x.bairro,x.resp]),'Nenhum REDS registrado neste dia.');
 el.appendChild(box)});


/* aviso do filtro do dia (topo das abas Operações, Calendário e Divergências) */
dash.draw('ops-dia-aviso',el=>{el.replaceChildren();if(!PA.selDia)return;const r=situacaoDias().find(x=>x.data===PA.selDia);
 const b=E('div','dia-aviso');b.append(E('span',null,'Filtro do dia: '),E('b',null,dmx(PA.selDia)+' · '+SEMANA[new Date(PA.selDia+'T12:00:00').getDay()]+(r?' · '+r.sit:'')),E('span','sub',' — esta área mostra só esta data.'));
 b.appendChild(PA.btnLimpar(()=>PA.setDia('',true)));el.appendChild(b)});
/* indicadores do dia (substitui o gráfico do mês enquanto há dia selecionado) */
dash.draw('g-ops-dia',el=>{el.replaceChildren();if(!PA.selDia)return;const ops=(dash.data('ops').data||[]).filter(o=>!o.verificar);const dia=ops.filter(o=>o.data===PA.selDia);
 const por=d3.rollup(dia,v=>v.length,o=>o.indicador||'—');const mes=d3.rollup(ops,v=>v.length,o=>o.indicador||'—');
 el.appendChild(E('p','sub','Operações lançadas em '+dmx(PA.selDia)+' por indicador (entre parênteses, o total do mês). Limpe o filtro para ver o gráfico do mês com as metas.'));
 if(!dia.length){el.appendChild(E('p','neutro','Nenhuma operação lançada na aba '+PA.M.NOME+' nesta data.'));return}
 const k=E('div','meu');[...por.entries()].sort((a,b)=>b[1]-a[1]).forEach(([ind,n])=>{const m=E('div','mi');m.append(E('div','kv sm',String(n)),E('div','kl',ind+' (mês: '+(mes.get(ind)||0)+')'));k.appendChild(m)});
 const t=E('div','mi');t.append(E('div','kv sm',String(dia.length)),E('div','kl','Total do dia (mês: '+ops.length+')'));k.appendChild(t);el.appendChild(k)});
/* texto da lista de lançamentos com o filtro do dia */
dash.draw('ops-vazio',el=>{const d=dash.data('ops');if(d.status!=='ok'){el.textContent='—';return}const L=PA.selDia?d.data.filter(o=>o.data===PA.selDia):d.data;const nv=L.filter(o=>o.verificar).length;
 const onde=PA.selDia?' em '+dmx(PA.selDia):' na aba '+PA.M.NOME;el.textContent=L.length?(L.length-nv)+' operação(ões)'+onde+(nv?' (mais '+nv+' marcada(s) NECESSÁRIO VERIFICAÇÃO, fora das contagens).':'.')+(PA.selDia?' Mês inteiro: '+d.data.filter(o=>!o.verificar).length+'.':''):'Não há operação lançada'+onde+'.'});
/* calendário: tocar no dia seleciona o dia (tocar de novo desmarca); dica só com mouse */
dash.draw('calendario',box=>{box.replaceChildren();const d=dash.data('calendario');if(d.status!=='ok'||!d.data)return;const tip=PA.tip(box);
 const CC={'previsto sem registro':'#AB2328','parcial':'color-mix(in srgb, var(--color-warn) 70%, transparent)','cumprido':'color-mix(in srgb, #a08f63 55%, transparent)','sem previsão':'color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)','sem previsão (com registro)':'color-mix(in srgb, var(--cds-chart-muted) 35%, transparent)'};
 const g=E('div','cal');['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].forEach(x=>g.appendChild(E('div','calh',x)));
 const w0=new Date(Date.UTC(PA.M.ano,PA.M.mes-1,1)).getUTCDay();for(let i=0;i<w0;i++)g.appendChild(document.createElement('div'));
 d.data.forEach(r=>{const c=E('button','cald'+(PA.selDia===r.data?' sel':''));c.type='button';c.style.background=CC[r.sit]||'';if(r.sit==='previsto sem registro'){c.style.color='#fff';c.style.fontWeight='700'}if(r.sit==='futuro'||r.sit==='dia em andamento')c.style.border='1px dashed var(--color-border-line)';
  c.setAttribute('aria-pressed',String(PA.selDia===r.data));c.setAttribute('aria-label',dmx(r.data)+' · '+r.sit+(r.np?' · '+r.nf+' de '+r.np+' previstas com registro':''));
  c.append(E('div',null,p2(r.dia)),E('div','cals',r.np?r.nf+'/'+r.np:(r.nl?r.nl+' lanç.':'')));
  const lines=()=>[p2(r.dia)+'/'+PA.M.mm+' · '+r.sit].concat(r.prev.length?['Previsto:'].concat(r.prev):['Sem previsão no cartão programa']).concat(r.lanc.length?['Lançado na aba '+PA.M.NOME+': '+r.lanc.join(', ')]:[]);
  c.addEventListener('pointermove',ev=>{if(ev.pointerType!=='mouse')return;const b=box.getBoundingClientRect();tip.show(lines(),ev.clientX-b.left,ev.clientY-b.top)});c.addEventListener('pointerleave',()=>tip.hide());
  c.addEventListener('click',ev=>{ev.stopPropagation();tip.hide();if(r.sit==='futuro'){PA.setDia(r.data);return}PA.setDia(r.data)});g.appendChild(c)});
 box.appendChild(g);box.appendChild(E('p','sub',PA.selDia?'Dia '+dmx(PA.selDia)+' selecionado — toque nele de novo para desmarcar.':'Toque num dia para abrir o panorama logo abaixo e filtrar as abas de Operações.'))});
/* dias com previsão sem registro / parcial — com o filtro do dia */
dash.draw('t-cal-sem',tb=>{tb.replaceChildren();const HS=['Data','Previsto','Lançado na aba do mês'];const L=situacaoDias().filter(r=>(r.sit==='previsto sem registro'||r.sit==='parcial')&&(!PA.selDia||r.data===PA.selDia));
 if(!L.length){const tr=E('tr');const td=E('td',null,PA.selDia?'O dia '+dmx(PA.selDia)+' não tem previsão pendente.':'Não há dia com previsão pendente.');td.colSpan=3;tr.appendChild(td);tb.appendChild(tr);return}
 L.forEach(r=>{const tr=E('tr',r.sit==='previsto sem registro'?'semreg':null);tr.style.cursor='pointer';[dmx(r.data),r.prev.join(' · '),r.lanc.join(', ')||'nenhuma'].forEach((v,i)=>{const td=E('td',null,v);td.setAttribute('data-label',HS[i]);tr.appendChild(td)});tr.addEventListener('click',()=>PA.setDia(r.data,true));tb.appendChild(tr)})});

/* ---------- 5. Divergências por área ---------- */
const AREAS=['Carga horária','Escala','Abastecimento','Viaturas','Operações'];
PA.selDivCat=PA.selDivCat||'';PA.divBaixas=!!PA.divBaixas;
const rD=()=>['div-neutro','div-filtro','t-div'].forEach(n=>dash.draw(n));
PA.regFiltro('div-cat',{ativo:()=>!!PA.selDivCat,limpar:()=>{PA.selDivCat='';rD()},btns:()=>[]});
PA.regFiltro('div-baixas',{ativo:()=>PA.divBaixas,limpar:()=>{PA.divBaixas=false;rD();dash.draw('t-div-ops');dash.draw('div-ops-filtro')},btns:()=>[]});
const divLista=()=>{const d=dash.data('div');return d.status==='ok'&&d.data?d.data:[]};
dash.draw('div-filtro',el=>{el.replaceChildren();const L=divLista();const g=E('div','fcards');g.setAttribute('role','group');g.setAttribute('aria-label','Área');
 AREAS.forEach(a=>{const n=L.filter(x=>x.area===a&&(PA.divBaixas||x.gravidade!=='Baixa')).length;const b=E('button','fcard');b.type='button';b.setAttribute('aria-pressed',String(PA.selDivCat===a));b.append(E('span','ft',a),E('span','fn',n?n+' item(ns) para conferir':'nada a conferir'));b.addEventListener('click',()=>{PA.selDivCat=PA.selDivCat===a?'':a;rD()});g.appendChild(b)});
 el.appendChild(g);const bar=E('div','fbar');const tb=E('button','pbtn','Mostrar baixas');tb.type='button';tb.setAttribute('aria-pressed',String(PA.divBaixas));tb.addEventListener('click',()=>{PA.divBaixas=!PA.divBaixas;rD()});
 const tr=E('button','pbtn','Mostrar tratadas');tr.type='button';tr.disabled=true;tr.title='Disponível quando houver registro de tratamento na planilha';tr.style.opacity='.55';
 const lp=PA.btnLimpar(()=>{PA.selDivCat='';PA.divBaixas=false;rD()});lp.hidden=!(PA.selDivCat||PA.divBaixas);bar.append(tb,tr,lp);el.appendChild(bar)});
dash.draw('div-neutro',el=>{const L=divLista().filter(x=>PA.divBaixas||x.gravidade!=='Baixa');const tw=document.getElementById('div-tabela');if(tw)tw.hidden=!PA.selDivCat;
 if(!PA.selDivCat){const ar=AREAS.filter(a=>L.some(x=>x.area===a)).length;el.textContent=L.length?'Há '+L.length+' item(ns) para conferir em '+ar+' área(s). Selecione a área para consultar.':'Não há item para conferir.';return}
 const n=L.filter(x=>x.area===PA.selDivCat).length;el.textContent=PA.selDivCat+': '+n+' item(ns)'+(PA.divBaixas?'':' de gravidade alta ou média')+'.'});
dash.draw('t-div',tb=>{tb.replaceChildren();if(!PA.selDivCat)return;const HS=['Área','Gravidade','Descrição'];divLista().filter(x=>x.area===PA.selDivCat&&(PA.divBaixas||x.gravidade!=='Baixa')).forEach(r=>{const tr=E('tr');[[r.area],[r.gravidade,r.gravidade==='Alta'?'bad':r.gravidade==='Média'?'warn':''],[r.descricao]].forEach(([v,c],i)=>{const td=E('td',c||null,v||'—');td.setAttribute('data-label',HS[i]);tr.appendChild(td)});tb.appendChild(tr)})});
dash.draw('m-div',el=>{const L=divLista().filter(x=>x.gravidade!=='Baixa');el.textContent=String(L.length)});
/* Operações > Divergências: só alta e média por padrão */
dash.draw('div-ops-filtro',el=>{el.replaceChildren();const bar=E('div','fbar');const tb=E('button','pbtn','Mostrar baixas');tb.type='button';tb.setAttribute('aria-pressed',String(PA.divBaixas));tb.addEventListener('click',()=>{PA.divBaixas=!PA.divBaixas;['div-ops-filtro','t-div-ops','div-ops-res'].forEach(n=>dash.draw(n))});const tr=E('button','pbtn','Mostrar tratadas');tr.type='button';tr.disabled=true;tr.style.opacity='.55';tr.title='Disponível quando houver registro de tratamento';const lp=PA.btnLimpar(()=>{PA.divBaixas=false;['div-ops-filtro','t-div-ops','div-ops-res'].forEach(n=>dash.draw(n))});lp.hidden=!PA.divBaixas;bar.append(tb,tr,lp);el.appendChild(bar)});
dash.draw('t-div-ops',tb=>{tb.replaceChildren();const d=dash.data('div_ops');if(d.status!=='ok'||!d.data)return;const HS=['Data','Nº REDS','Divergência','Gravidade','Detalhe','Militar'];d.data.filter(r=>(PA.divBaixas||r.grav!=='Baixa')&&(!PA.selDia||r.data===PA.selDia)).forEach(r=>{const tr=E('tr');[[dmx(r.data)],[r.reds],[r.tipo],[r.grav,r.grav==='Alta'?'bad':r.grav==='Média'?'warn':''],[r.det],[r.militar]].forEach(([v,c],i)=>{const td=E('td',c||null,v==null||v===''?'—':v);td.setAttribute('data-label',HS[i]);tr.appendChild(td)});tb.appendChild(tr)})});
dash.draw('div-ops-res',el=>{const d=dash.data('div_ops');if(d.status!=='ok'||!d.data){el.textContent='';return}const a=d.data.filter(r=>(PA.divBaixas||r.grav!=='Baixa')&&(!PA.selDia||r.data===PA.selDia));el.textContent=(PA.selDia?dmx(PA.selDia)+': ':'')+a.length+' linha(s) (uma por REDS)'+(PA.divBaixas?'':', gravidade alta e média')+': '+d3.rollups(a,v=>v.length,r=>r.tipo).map(([k,v])=>k+' '+v).join(' · ')});

/* ---------- 6. Patrulha Rural: subsetores, mapa e cartões ---------- */
PA.selSub=PA.selSub||'';
const subNome=r=>{const t=String((r&&r.rotulo)||'').replace(/^\s*\d{1,2}\s*[–-]\s*/,'').split(/\s*\/\s*/).join(', ');return t||('Subsetor '+(r&&r.sub||''))};
const prOk=()=>{const d=dash.data('prural_ok');return d.status==='ok'&&d.data?d.data:null};
const subRot=(nome,num,tag)=>{const s=E(tag||'span','sub-nome');s.appendChild(document.createTextNode(nome));const n=E('small','sub-num',num);n.setAttribute('aria-label','subsetor '+num);s.appendChild(n);return s};
function rPR(){['pr-filtro','pr-cards','prural-subsetores','prural-lacunas','pr-sel'].forEach(n=>dash.draw(n));prMapaSel()}
PA.regFiltro('pr-sub',{ativo:()=>!!PA.selSub,limpar:()=>{PA.selSub='';rPR()},btns:()=>[]});
PA.setSub=s=>{PA.selSub=PA.selSub===s?'':s;rPR()};
dash.draw('pr-filtro',el=>{el.replaceChildren();const p=prOk();if(!p)return;const g=E('div','fcards');g.setAttribute('role','group');g.setAttribute('aria-label','Subsetor');
 (p.porSubsetor||[]).forEach(r=>{const b=E('button','fcard');b.type='button';b.setAttribute('aria-pressed',String(PA.selSub===r.sub));const t=subRot(subNome(r),r.sub);t.classList.add('ft');b.append(t,E('span','fn',r.cobertosPlano+' de '+r.comunidadesPlano+' comunidades do plano'));b.title=r.nomeCompleto||'';b.addEventListener('click',()=>PA.setSub(r.sub));g.appendChild(b)});
 el.appendChild(g);const lp=PA.btnLimpar(()=>{PA.selSub='';rPR()},'Limpar filtro · visão do município');lp.hidden=!PA.selSub;lp.style.marginBottom='10px';el.appendChild(lp)});
dash.draw('pr-sel',el=>{const p=prOk();const r=p&&(p.porSubsetor||[]).find(x=>x.sub===PA.selSub);el.textContent=r?'Filtro: '+subNome(r)+' (subsetor '+r.sub+'). Os totais do card de cadastramento e a evolução continuam sendo do município.':'Visão geral do município. Selecione um subsetor no filtro, no mapa ou nos cartões.'});
dash.draw('pr-cards',el=>{el.replaceChildren();const p=prOk();if(!p)return;const g=E('div','pr-cards');
 (p.porSubsetor||[]).filter(r=>!PA.selSub||r.sub===PA.selSub).forEach(r=>{const b=E('button','pr-card');b.type='button';b.setAttribute('aria-pressed',String(PA.selSub===r.sub));
  const cab=E('div','pn');cab.append(E('span','pn-tit',subNome(r)));
  const selo=E('span','pn-selo','Setor '+String(r.sub==null?'':r.sub).padStart(2,'0'));
  selo.setAttribute('aria-label','subsetor '+r.sub);cab.appendChild(selo);
  const pend=Math.max(0,(r.comunidadesPlano||0)-(r.cobertosPlano||0));
  const k=E('div','pk');
  [[r.cadastros,'cadastros',null],[r.cobertosPlano+'/'+r.comunidadesPlano,'comunidades','comunidades do plano cobertas'],[pend,'pendentes',null]].forEach(([v,l,tit])=>{
    const d=E('div','pk-item');d.append(E('b',null,String(v)),E('span',null,l));if(tit)d.title=tit;k.appendChild(d);
  });
  const corpo=E('div','pr-corpo');
  corpo.append(E('div','pp pp-com',r.nomeCompleto||''),E('div','pp pp-base','Base: '+(r.est!=null?r.est+' estab. agropecuários · ':'')+(r.car!=null?r.car+' imóveis CAR':'')));
  b.append(cab,k,corpo);b.addEventListener('click',()=>PA.setSub(r.sub));g.appendChild(b)});el.appendChild(g)});
dash.draw('prural-subsetores',el=>{el.replaceChildren();const p=prOk();if(!p)return;const tb=E('table','cards');const hd=['Subsetor','Cadastros','Comunidades do plano','Est. agro (base)','Imóveis CAR (base)'];tb.innerHTML='<thead><tr>'+hd.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead>';const body=E('tbody');
 (p.porSubsetor||[]).filter(r=>!PA.selSub||r.sub===PA.selSub).forEach(r=>{const tr=E('tr');[null,r.cadastros,r.cobertosPlano+' de '+r.comunidadesPlano,r.est,r.car].forEach((v,i)=>{const td=E('td');td.setAttribute('data-label',hd[i]);if(i===0){td.appendChild(subRot(subNome(r),r.sub));if(r.nomeCompleto)td.appendChild(E('small','sub-full',r.nomeCompleto))}else td.textContent=v==null?'—':String(v);tr.appendChild(td)});body.appendChild(tr)});tb.appendChild(body);const tw=E('div','tw');tw.appendChild(tb);el.appendChild(tw)});
dash.draw('prural-lacunas',el=>{el.replaceChildren();const p=prOk();if(!p)return;const subs=(p.porSubsetor||[]).filter(r=>!PA.selSub||r.sub===PA.selSub);
 const grupo=(tit,lista,fmt)=>{const L=lista.filter(c=>!PA.selSub||c.sub===PA.selSub);if(!L.length)return;if(tit)el.appendChild(E('h3',null,tit));
  subs.concat([{sub:'',rotulo:'Sem subsetor'}]).forEach(r=>{const it=L.filter(c=>(c.sub||'')===r.sub);if(!it.length)return;const g=E('div','pr-grupo');const h=E('h3');h.appendChild(subRot(subNome(r),r.sub||'—'));h.appendChild(E('small','sub-full',it.length+' comunidade(s)'));g.appendChild(h);const ul=E('ul','lista-lac');it.forEach(c=>{const li=E('li');li.appendChild(E('b',null,c.nome));const s=fmt(c);if(s)li.appendChild(E('small',null,s));ul.appendChild(li)});g.appendChild(ul);el.appendChild(g)})};
 const bits=c=>[c.dom!=null?c.dom+' domicílios na base':'',c.est!=null?c.est+' estabelecimentos agropecuários':'',c.nota||''].filter(Boolean).join(' · ');
 grupo('',p.lacunasPlano||[],bits);grupo('A conferir',p.aConferirPlano||[],c=>c.nota||'Casamento ainda não firme.');grupo('Outras comunidades da base com muitos estabelecimentos e zero cadastro',p.outrasLacunas||[],c=>(c.dom||'—')+' domicílios · '+(c.est||'—')+' estabelecimentos');
 if(!el.children.length)el.appendChild(E('p','sub','Todas as comunidades do plano'+(PA.selSub?' neste subsetor':'')+' têm cadastro.'))});
/* mapa (Leaflet + OpenStreetMap), carregado só quando a aba é aberta */
let LF=null,lfCarregando=false;const lfFila=[];
function leaflet(cb){if(window.L&&window.L.map){cb();return}lfFila.push(cb);if(lfCarregando)return;lfCarregando=true;const l=E('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);const s=E('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=()=>{lfFila.splice(0).forEach(f=>f())};s.onerror=()=>{const el=document.getElementById('pr-map');if(el)el.textContent='Não foi possível carregar o mapa (biblioteca Leaflet). Verifique a conexão.'};document.head.appendChild(s)}
let MP=null;
function prMapaSel(){if(!MP)return;const geo=window.PA_GEO;const sel=PA.selSub;
 MP.subs.eachLayer(l=>{const s=l.feature.properties.sub;const on=sel&&s===sel;l.setStyle(s==='URB'?{color:'#373435',weight:1,dashArray:'4 4',fillColor:'#9a9a9a',fillOpacity:sel?0.04:0.12}:{color:on?'#373435':'#a08f63',weight:on?4:1.5,fillColor:'#a08f63',fillOpacity:sel?(on?0.35:0.05):0.18});if(on)l.bringToFront()});
 MP.rot.forEach(m=>{const vis=!sel||m._sub===sel;m.setOpacity(vis?1:0.25)});
 MP.com.eachLayer(m=>{const vis=!sel||m._sub===sel;m.setStyle({opacity:vis?1:0.2,fillOpacity:vis?0.95:0.15});if(sel&&vis)m.openTooltip();else m.closeTooltip()});
 if(sel){let b=null;MP.subs.eachLayer(l=>{if(l.feature.properties.sub===sel)b=l.getBounds()});if(b)MP.map.fitBounds(b,{paddingTopLeft:[18,18],paddingBottomRight:[18,34]})}else MP.map.fitBounds(MP.lim.getBounds(),{paddingTopLeft:[10,10],paddingBottomRight:[10,30]})}
dash.draw('pr-mapa',el=>{const geo=window.PA_GEO;if(!geo){el.textContent='Base geográfica indisponível.';return}const p=prOk();
 leaflet(()=>{const L=window.L;if(MP&&MP.el===el){MP.map.invalidateSize();prMapaSel();return}
  el.replaceChildren();const map=L.map(el,{scrollWheelZoom:false,tap:true,zoomSnap:0.25});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:16,attribution:'© colaboradores do OpenStreetMap'}).addTo(map);
  const lim=L.geoJSON(geo.limite,{style:{color:'#373435',weight:2.5,fill:false},interactive:false}).addTo(map);
  const nomes={};(p&&p.porSubsetor||[]).forEach(r=>{nomes[r.sub]=subNome(r)});
  const subs=L.geoJSON(geo.subsetores,{onEachFeature:(f,l)=>{const s=f.properties.sub;if(s==='URB'){l.bindTooltip('Setor 1 – Urbano (subsetores 01 a 08)',{sticky:true});return}l.bindTooltip((nomes[s]||'Subsetor')+' · '+s,{sticky:true});l.on('click',()=>PA.setSub(s))}}).addTo(map);
  const rot=[];subs.eachLayer(l=>{const s=l.feature.properties.sub;if(s==='URB')return;const c=l.getBounds().getCenter();const pol=l.feature.geometry;const m=L.marker(c,{interactive:true,icon:L.divIcon({className:'',html:'<span style="background:#373435;color:#fff;font:700 12px/1 sans-serif;padding:3px 6px;display:inline-block;white-space:nowrap">'+s+'</span>',iconSize:null})}).addTo(map);m._sub=s;m.on('click',()=>PA.setSub(s));rot.push(m)});
  const cob=new Set((p&&p.cobertosNomes)||[]);const conf=new Set(((p&&p.aConferirPlano)||[]).map(c=>c.nome));const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const cobN=new Set([...cob].map(norm));const confN=new Set([...conf].map(norm));
  const com=L.layerGroup().addTo(map);(geo.comunidades||[]).forEach(c=>{if(c.lat==null)return;const st=cobN.has(norm(c.nome))?'com':confN.has(norm(c.nome))?'conf':'sem';const m=L.circleMarker([c.lat,c.lon],{radius:6,color:'#373435',weight:2,fillColor:st==='com'?'#a08f63':st==='conf'?'#d1c9b5':'#ffffff',fillOpacity:.95,dashArray:st==='conf'?'2 2':null});m._sub=c.sub;m.bindTooltip(c.nome+' · '+(st==='com'?'com cadastro':st==='conf'?'a conferir':'sem cadastro'),{className:'pr-rot',direction:'top',offset:[0,-6]});m.on('click',()=>PA.setSub(c.sub));com.addLayer(m)});
  MP={el,map,subs,lim,rot,com};map.fitBounds(lim.getBounds(),{paddingTopLeft:[10,10],paddingBottomRight:[10,30]});prMapaSel();setTimeout(()=>{map.invalidateSize();prMapaSel()},120)})});

/* ---------- 7. Controle de Operações Diárias (Google Doc do mês) ---------- */
function opdDados(){const r=PA.raw&&PA.raw.opdiarias;if(r&&r.ok)return Object.assign({fonte:'servidor'},r);const t=window.PA_OPD_TESTE;if(t&&t.ym===(PA.M&&PA.M.ym))return Object.assign({fonte:'teste'},t);return null}
PA.opdDados=opdDados;
dash.draw('opd',el=>{el.replaceChildren();const o=opdDados();
 const a=E('a','btn-doc');a.target='_blank';a.rel='noopener';a.href=(o&&o.url)||'https://docs.google.com/document/d/1GMuQNPLdXqU8bldML3fTLEiSR_LpCqQUbz5NIRersB4/edit';a.textContent='Abrir o documento '+((o&&o.titulo)||'CONTROLE DE OPERAÇÕES DIÁRIAS');el.appendChild(a);
 if(!o){el.appendChild(E('p','sub aviso-neutro','Não foi possível ler o Controle de Operações Diárias neste momento. Consulte as operações previstas pelo botão acima; o resumo volta a aparecer aqui assim que o servidor conseguir ler o documento.'));return}
 if(o.fonte==='teste'){const s=E('p','sub');s.style.marginTop='10px';const t=E('span','modo-teste','DADOS DE TESTE');s.append(t,document.createTextNode(' '+(o.rotulo||'Conteúdo estático do documento.')+' Após a implantação do Code.gs v4.3.5, o painel lê o documento do mês na pasta 07 OPERAÇÕES E EVENTOS.'));el.appendChild(s)}
 const hj=hojeISO();const d=(o.dias||[]).find(x=>x.data===hj);
 el.appendChild(E('h3',null,'Operações previstas para hoje, '+dmx(hj)+(d?' ('+d.dia_semana.toLowerCase()+')':'')));
 if(!d||!d.itens.length){el.appendChild(E('p','sub',d?'Sem atividade prevista no documento para hoje.':'O documento não tem linha para hoje.'));}
 else{const ul=E('ul','opd-lista');d.itens.forEach(i=>ul.appendChild(E('li',null,i.nome+' ('+i.codigo+')')));el.appendChild(ul)}
 const am=(o.dias||[]).find(x=>x.data>hj);if(am&&am.itens.length){const det=E('details');det.className='mt';det.appendChild(E('summary',null,'Próximo dia ('+dmx(am.data)+'): '+am.itens.length+' atividade(s)'));const ul=E('ul','opd-lista');am.itens.forEach(i=>ul.appendChild(E('li',null,i.nome+' ('+i.codigo+')')));det.appendChild(ul);el.appendChild(det)}});


/* ---------- Situação individual: horas lançadas, pré-turno, compensação noturna e total (separados) ---------- */

PA.CPR_NOME='Curso de Patrulha Rural';
PA.codRotulo=function(c){const s=String(c||'');return s.toUpperCase()==='CPR'?s+' · '+PA.CPR_NOME:s};
PA.cprNota=function(m){const g=(dash.data('grade').data||[]).filter(x=>x.militar===m&&String(x.codigo||'').toUpperCase()==='CPR');if(!g.length)return '';
 const dias=g.map(x=>+x.dia).sort((a,b)=>a-b);const consec=dias.every((d,i)=>!i||d===dias[i-1]+1);
 const faixa=consec?(dias[0]+(dias.length>1?' a '+dias[dias.length-1]:'')+'/'+PA.M.mm):dias.map(d=>String(d).padStart(2,'0')+'/'+PA.M.mm).join(', ');
 const h=Math.round(d3.sum(g,x=>x.horas_escala)*10)/10;
 return 'CPR — '+PA.CPR_NOME+' ('+faixa+'): '+PA.fmtN(h,1)+' h lançadas em escala extraordinária (situação excepcional).'};
PA.cprNotaEl=function(){const t=PA.cprNota(PA.selMil);if(!t)return null;const p=E('p','dia-aviso cpr-nota',t);p.setAttribute('role','status');return p};

dash.draw('meu',el=>{el.replaceChildren();if(!PA.selMil){el.appendChild(E('p','sub','Selecione o militar para consultar a escala, a carga horária, o serviço extraordinário e o limite de horas. A seleção também filtra as demais visões deste módulo.'));return}
 const d=dash.data('resumo');if(d.status!=='ok'||!d.data){el.textContent='—';return}const r=d.data.find(x=>x.militar===PA.selMil);if(!r){el.textContent='Não há dados deste militar no mês selecionado.';return}
 [['Turnos na escala',String(r.turnos_escala)],['Previsto da escala (com pré-turno)',PA.fmtN(r.horas_escala,1)+' h'],['Horas lançadas',PA.fmtN(r.horas_lancadas,1)+' h'],['Pré-turno: 30 min por turno escalado',PA.preTxt(r.militar).linhas,'largo'],['Compensação noturna 23h–5h: 10 min por hora cheia',PA.compTxt(r.militar,r.comp_min).linhas,'largo'],['Total',PA.fmtN(r.horas_reais,1)+' h'],['Além da escala',(r.extra>0?'+':'')+PA.fmtN(r.extra,1)+' h'],['Limite do mês',PA.fmtN(r.limite,1)+' h'],['Projeção do mês',PA.fmtN(r.projecao)+' h',r.projecao>r.limite?'bad':''],['Com lançamentos em dia',PA.fmtN(r.projecao_completa)+' h',r.projecao_completa>r.limite?'bad':''],['Saldo sobre o limite',(r.saldo>0?'+':'')+PA.fmtN(r.saldo)+' h',r.saldo>0?'bad':''],['Turnos sem registro',String(r.sem_registro),r.sem_registro?'bad':'']].forEach(([l,v,c])=>{const b=E('div','mi'+(c==='largo'?' largo':''));b.append(E('div','kv sm'+(c&&c!=='largo'?' '+c:''),v),E('div','kl',l));el.appendChild(b)});const nota=PA.cprNotaEl();if(nota)el.insertBefore(nota,el.firstChild)});
dash.draw('meu-extrato',el=>{el.replaceChildren();if(!PA.selMil)return;const g=dash.data('grade');if(g.status!=='ok'||!g.data)return;const fe=(dash.data('fora_escala').data||[]);
 const linhas=g.data.filter(x=>x.militar===PA.selMil&&(x.horas_escala>0||x.situacao==='Registrado fora da escala')).map(x=>{const lanc=x.horas_registradas;const pre=x.horas_escala>0?(x.pre_incluido?'já no lançamento':(x.pre_creditado?'+0,5 h':(x.situacao==='Cumprido'?'—':'previsto +0,5 h'))):'— (fora da escala)';
   const tot=x.horas_reais!=null?x.horas_reais:(x.situacao==='Previsto'?x.horas_escala+(x.comp_prev_min||0)/60:null);
   return [p2(x.dia)+'/'+PA.M.mm,PA.codRotulo(x.codigo)+(x.horario?' · '+x.horario:''),x.situacao,x.registro?x.registro.replace(/ · \d{5}/g,''):'—',lanc!=null?PA.fmtN(lanc,1):'—',pre,x.horas_reais!=null?(x.comp_min?x.comp_min+' min':'0'):(x.situacao==='Previsto'&&x.comp_prev_min?'previsto '+x.comp_prev_min+' min':'—'),tot!=null?PA.fmtN(tot,1)+(x.horas_reais==null?' (previsto)':''):'—']});
 const ch=g.data.find(x=>x.militar===PA.selMil);const k=ch&&ch.chave;
 fe.filter(f=>f.chave&&f.chave===k).forEach(f=>linhas.push([p2(f.dia)+'/'+PA.M.mm,'Atividade fora da escala','Fora da escala',f.inicio&&f.fim?f.inicio+' às '+f.fim:'—',PA.fmtN(f.horas,1),'— (fora da escala)',f.comp_min?f.comp_min+' min':'0',PA.fmtN(f.horas+(f.comp_min||0)/60,1)]));
 linhas.sort((a,b)=>a[0].localeCompare(b[0]));
 const nEx=PA.cprNotaEl();if(nEx)el.appendChild(nEx);
el.appendChild(E('h3',null,'Extrato por turno'));const HS=['Data','Escala','Situação','Horário lançado','Horas lançadas','Pré-turno (30 min)','Compensação noturna 23h–5h','Total'];
 const tw=E('div','tw');const tb=E('table','cards');tb.innerHTML='<thead><tr>'+HS.map((h,i)=>'<th'+(i===4||i===7?" class='n'":'')+'>'+h+'</th>').join('')+'</tr></thead>';const body=E('tbody');
 linhas.forEach(l=>{const tr=E('tr');l.forEach((v,i)=>{const td=E('td',i===4||i===7?'n':null,v);td.setAttribute('data-label',HS[i]);tr.appendChild(td)});body.appendChild(tr)});tb.appendChild(body);tw.appendChild(tb);el.appendChild(tw);
 el.appendChild(E('p','sub','Pré-turno (30 min): somado só em turno escalado; quando o lançamento já começa 30 min antes do horário da escala, ele já está nas horas lançadas e não é somado de novo. Compensação noturna 23h–5h: 10 min por hora completa cumprida na faixa, por turno (Res. 4.285/2013, art. 11, § 5º).'))});




/* ---------- Extrato de horas como página própria (#extrato?mil=NOME) ---------- */
PA.extHash=function(){return '#extrato'+(PA.selMil?'?mil='+encodeURIComponent(PA.selMil):'')};
PA.abrirExtrato=function(mil){if(mil!=null){PA.selMil=mil;try{localStorage.setItem('pa_mil',mil)}catch(e){}const m=document.getElementById('sel-mil');if(m)m.value=mil}PA_abrir('carga','extrato-horas');window.scrollTo(0,0)};
PA.modoExtrato=function(){const on=!!(PA._navAtual&&PA._navAtual.g==='carga'&&PA._navAtual.tab==='extrato-horas');document.body.classList.toggle('pg-extrato',on);const vb=document.getElementById('voltar-ant');if(vb&&on)vb.hidden=false;
 try{if(window.PA_NO_GAS){const h=location.hash||'';if(on){if(h!==PA.extHash())history.replaceState(history.state,'',location.pathname+location.search+PA.extHash())}else if(/^#extrato/.test(h))history.replaceState(history.state,'',location.pathname+location.search)}}catch(e){}};
PA._voltarBase=PA.voltar;PA.voltar=function(){if(!PA._pilha.length&&document.body.classList.contains('pg-extrato')){PA_abrir('carga','carga',{semHist:true});return}return PA._voltarBase.apply(this,arguments)};
if(PA.nav){const navE=PA.nav;PA.nav=function(){const r=navE.apply(this,arguments);PA.modoExtrato();return r}}
PA.lerHashExtrato=function(){const h=decodeURIComponent((location.hash||'').replace(/^#/,''));if(!/^extrato\b/.test(h))return false;const m=h.match(/[?&]mil=([^&]*)/);PA.abrirExtrato(m?m[1].trim():null);return true};
(function(){const w=()=>{if(window.PA_ir&&!window.PA_ir._ext){const o=window.PA_ir;window.PA_ir=function(t){if(/^extrato\b/.test(String(t||''))){PA.lerHashExtrato();return true}return o.apply(this,arguments)};window.PA_ir._ext=1}};w();document.addEventListener('DOMContentLoaded',w);
 window.addEventListener('load',()=>setTimeout(()=>{w();if(/^#extrato/.test(location.hash||'')&&!document.body.classList.contains('pg-extrato'))PA.lerHashExtrato()},30))})();

/* textos claros de pré-turno e compensação noturna (contagem por turno) */
const fH=v=>PA.fmtN(v,Math.abs(v%1)>1e-9?1:0)+' h';const nT=n=>n+(n===1?' turno':' turnos');
PA.preTxt=function(m){const g=(dash.data('grade').data||[]).filter(x=>x.militar===m&&x.horas_escala>0);const inc=g.filter(x=>x.pre_incluido>0),som=g.filter(x=>x.pre_creditado>0);const hi=d3.sum(inc,x=>x.pre_incluido),hs=d3.sum(som,x=>x.pre_creditado);
 const a='Somado à parte: '+fH(hs)+' ('+nT(som.length)+')',b='Já incluído no horário lançado: '+fH(hi)+' ('+nT(inc.length)+')';return {linhas:a+'\n'+b,curto:a+' · '+b,frase:'Pré-turno: 30 min por turno escalado · '+a+' · '+b}};
PA.compTxt=function(m,cmTot){const G=dash.data('grade').data||[];const g=G.filter(x=>x.militar===m&&x.comp_min>0);const ch=(G.find(x=>x.militar===m)||{}).chave;const f=(dash.data('fora_escala').data||[]).filter(x=>ch&&x.chave===ch&&x.comp_min>0);
 const cm=cmTot!=null?cmTot:d3.sum(g,x=>x.comp_min)+d3.sum(f,x=>x.comp_min);const n=g.length+f.length;const a=cm?'Acrescido: +'+cm+' min = '+fH(Math.round(cm/6)/10)+' ('+(cm/10)+(cm===10?' hora cheia':' horas cheias')+' em '+nT(n)+')':'Nenhuma hora cheia entre 23h e 5h no mês';return {linhas:a,curto:a,frase:'Compensação noturna 23h–5h: 10 min por hora cheia · '+a}};
/* ---------- Extrato de horas (Carga horária) — identificação pelo NOME (coluna C), nunca pelo nº PM ---------- */
const hhmm=h=>{h=((h%24)+24)%24;const H=Math.floor(h+1e-6),M=Math.round((h-H)*60);return p2(H)+'h'+p2(M)};
const horEsc=s=>{const m=String(s||'').split('–');if(m.length!==2)return '';const a=parseInt(m[0],10),b=parseInt(m[1],10);return {ini:a,fim:b,txt:hhmm(a)+'–'+hhmm(b)}};
function roboOK(linha){const v=PA.raw&&PA.raw.t_robo;if(!Array.isArray(v))return null;const r=v[linha-1];return /^\s*OK/i.test(String((r||[])[0]||''))}
function noHorario(linha){const d=dash.data('t_hor');const r=d.status==='ok'&&d.data?d.data.find(x=>x.i===linha):null;return String((r||{}).no_horario||'').trim().toLowerCase()}
function sidsStatus(linhas){if(!linhas.length)return null;const st=linhas.map(l=>{const ok=roboOK(l);const nh=noHorario(l);if(ok)return {v:'ok',m:'OK na coluna X'};if(nh==='sim')return {v:'ok',m:'entrou e saiu no horário previsto'};return {v:'pend',m:nh==='não'?'fora do horário previsto e sem OK':'sem resposta sobre o horário'}});
 const pend=st.filter(x=>x.v==='pend');return pend.length?{v:'pend',m:pend[0].m}:{v:'ok',m:st[0].m}}
PA.extLinhas=function(mil){const g=dash.data('grade'),T=dash.data('turnos'),F=dash.data('fora_escala');if(g.status!=='ok'||!g.data)return null;const CN=window.PA_COMP_NOT;
 const G=g.data.filter(x=>x.militar===mil);if(!G.length)return [];const chave=G[0].chave;const tur=(T.data||[]).filter(t=>t.chave===chave);const out=[];
 G.filter(x=>x.horas_escala>0||x.situacao==='Registrado fora da escala').forEach(x=>{const regs=tur.filter(t=>t.dia===x.dia);const he=horEsc(x.horario);const esc=x.horas_escala>0;
  const cn=regs.map(r=>CN(r.hi,r.horas));const hc=d3.sum(cn,c=>c.horas_completas),cm=d3.sum(cn,c=>c.comp_min);let pre='—',preSt='não se aplica (fora da escala)';
  if(esc&&he){pre=hhmm(he.ini-0.5)+'–'+hhmm(he.ini);preSt=x.pre_incluido>=0.5?'já incluído no horário lançado':x.pre_incluido>0?Math.round(x.pre_incluido*60)+' min já incluídos, '+Math.round(x.pre_creditado*60)+' min somados à parte':x.pre_creditado?'somado à parte (+30 min)':x.situacao==='Previsto'?'será somado à parte (+30 min)':'aguardando lançamento'}
  let cnTxt='—';if(regs.length)cnTxt=hc?hc+(hc===1?' hora cheia':' horas cheias')+' na faixa → +'+cm+' min':'sem hora cheia na faixa';else if(x.situacao==='Previsto'&&x.comp_prev_min)cnTxt='previsto: '+(x.comp_prev_min/10)+' hora(s) cheia(s) na faixa → +'+x.comp_prev_min+' min';
  const tot=x.horas_reais!=null?x.horas_reais:null;
  out.push({dia:x.dia,ordem:x.dia*100+(regs[0]?regs[0].hi:(he?he.ini:0)),tipo:esc?'Turno escalado':'Turno fora da escala',situacao:x.situacao,lancado:regs.length?regs.map(r=>r.inicio+'–'+r.fim).join(' / '):(x.situacao==='Previsto'?'— (turno futuro)':'sem lançamento'),
   escala:esc?PA.codRotulo(x.codigo)+(he?' · '+he.txt:''):'folga ('+PA.codRotulo(x.codigo||'—')+')',pre,preSt,cnTxt,hc,cm,lanc:x.horas_registradas,tot,prevTot:x.situacao==='Previsto'?x.horas_escala+(x.comp_prev_min||0)/60:null,sids:sidsStatus(regs.map(r=>r.linha)),preCred:x.pre_creditado||0,preIncl:x.pre_incluido||0})});
 (F.data||[]).filter(f=>f.chave===chave).forEach(f=>{const hi=ph(f.inicio);const c=CN(hi,f.horas);out.push({dia:f.dia,ordem:f.dia*100+(hi||0),tipo:'Atividade fora da escala',situacao:'Fora da escala',lancado:f.inicio&&f.fim?f.inicio+'–'+f.fim:'—',escala:'—',pre:'—',preSt:'não se aplica (fora da escala)',cnTxt:c.horas_completas?c.horas_completas+(c.horas_completas===1?' hora cheia':' horas cheias')+' na faixa → +'+c.comp_min+' min':'sem hora cheia na faixa',hc:c.horas_completas,cm:c.comp_min,lanc:f.horas,tot:f.horas+c.comp_min/60,prevTot:null,sids:sidsStatus([f.linha]),preCred:0,preIncl:0})});
 return out.sort((a,b)=>a.ordem-b.ordem)};
const ph=s=>{const m=String(s||'').match(/([0-9]{1,2}):([0-9]{2})/);return m?(+m[1])+(+m[2])/60:null};
dash.draw('ext-sel',el=>{el.replaceChildren();const g=dash.data('grade');if(g.status!=='ok'||!g.data){el.textContent='—';return}
 const nomes=[...new Map(g.data.map(r=>[r.militar,+String(r.matricula||'').replace(/[^0-9]/g,'')||9e9])).entries()].sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
 if(PA.selMil&&!nomes.includes(PA.selMil)){const q=PA.selMil.toLowerCase();const f=nomes.find(n=>n.toLowerCase()===q)||nomes.find(n=>n.toLowerCase().split(' ').includes(q))||nomes.find(n=>n.toLowerCase().includes(q));PA.selMil=f||'';const m=document.getElementById('sel-mil');if(m)m.value=PA.selMil;try{localStorage.setItem('pa_mil',PA.selMil)}catch(e){}setTimeout(()=>{dash.draw('ext-horas');dash.draw('meu');PA.modoExtrato()},0)}
 const bar=E('div','fbar');const lb=E('label',null,'Seu nome');lb.htmlFor='ext-mil';const sel=E('select');sel.id='ext-mil';sel.appendChild(new Option('Escolha o seu nome',''));nomes.forEach(n=>sel.appendChild(new Option(n,n)));sel.value=PA.selMil||'';
 sel.onchange=()=>{const m=document.getElementById('sel-mil');if(m){m.value=sel.value;m.dispatchEvent(new Event('change'))}else{PA.selMil=sel.value;dash.draw('ext-horas')}};
 if(document.body.classList.contains('pg-extrato'))PA.modoExtrato();bar.append(lb,sel);if(PA.selMil)bar.appendChild(PA.btnLimpar(()=>{const m=document.getElementById('sel-mil');if(m){m.value='';m.dispatchEvent(new Event('change'))}}));el.appendChild(bar)});
dash.draw('ext-horas',el=>{el.replaceChildren();if(!PA.selMil){el.appendChild(E('p','sub','Escolha o seu nome para ver o extrato do mês.'));return}const L=PA.extLinhas(PA.selMil);if(!L){el.textContent='—';return}
 const nH=PA.cprNotaEl();if(nH)el.appendChild(nH);if(!L.length){el.appendChild(E('p','sub','Não há turno deste militar no mês.'));return}
 const semX=!(PA.raw&&Array.isArray(PA.raw.t_robo));
 const ul=E('ul','ext-lista');L.forEach(r=>{const li=E('li','ext-item'+(r.situacao==='Previsto'?' futuro':''));
  const cab=E('div','ext-cab');cab.append(E('span','ext-data',p2(r.dia)+'/'+PA.M.mm+' · '+SEMANA[new Date(PA.M.ym+'-'+p2(r.dia)+'T12:00:00').getDay()].replace('-feira','')),E('span','ext-tipo',r.tipo));
  const sd=E('span','ext-sids');if(r.sids){sd.classList.add(r.sids.v);sd.textContent=(r.sids.v==='ok'?'✓ Lançado no SIDS':'⚠ Pendente no SIDS');sd.title=r.sids.m}else{sd.textContent=r.situacao==='Previsto'?'Turno futuro':'Sem lançamento no formulário';sd.classList.add('nd')}cab.appendChild(sd);li.appendChild(cab);
  const dl=E('dl','ext-campos');[['Lançado no formulário (início–término)',r.lancado],['Horário da escala',r.escala],['Pré-turno (30 min)',r.pre==='—'?r.preSt:r.pre+' · '+r.preSt],['Compensação noturna 23h–5h',r.cnTxt],['Horas lançadas',r.lanc!=null?PA.fmtN(r.lanc,1)+' h':'—'],['Total considerado no controle',r.tot!=null?PA.fmtN(r.tot,1)+' h':(r.prevTot!=null?PA.fmtN(r.prevTot,1)+' h (previsto)':'—')]].forEach(([k,v])=>{dl.append(E('dt',null,k),E('dd',null,v))});
  if(r.sids&&r.sids.v==='pend')dl.append(E('dt',null,'Motivo da pendência'),E('dd',null,r.sids.m));
  li.appendChild(dl);ul.appendChild(li)});el.appendChild(ul);
 const feitos=L.filter(r=>r.lanc!=null);const t=k=>d3.sum(feitos,r=>r[k]||0);const ok=L.filter(r=>r.sids&&r.sids.v==='ok').length,pend=L.filter(r=>r.sids&&r.sids.v==='pend').length;
 const rod=E('div','ext-rodape');rod.appendChild(E('div','ext-sub','Totais do mês (turnos já lançados)'));const k=E('div','meu');
 [[String(feitos.length),'Lançamentos considerados'],[PA.fmtN(t('lanc'),1)+' h','Horas lançadas'],[PA.preTxt(PA.selMil).linhas,'Pré-turno: 30 min por turno escalado','largo'],[PA.compTxt(PA.selMil,t('cm')).linhas,'Compensação noturna 23h–5h: 10 min por hora cheia','largo'],[PA.fmtN(t('tot'),1)+' h','Total considerado no controle'],[ok+' ✓ · '+pend+' ⚠','Lançado no SIDS / pendentes']].forEach(([v,l,c])=>{const m=E('div','mi'+(c?' '+c:''));m.append(E('div','kv sm',v),E('div','kl',l));k.appendChild(m)});rod.appendChild(k);
 rod.appendChild(E('p','ext-leg','Pré-turno: todo turno escalado conta 30 min antes do horário da escala. Se você lançou o início já nesse horário, os 30 min estão nas horas lançadas (“já incluído no horário lançado”); se lançou o início no horário da escala, o painel soma os 30 min (“somado à parte”). Nunca conta duas vezes. Compensação noturna 23h–5h: para cada hora cheia trabalhada entre 23h e 5h, o painel acrescenta 10 min (Res. 4.285/2013, art. 11, § 5º). Lançado no SIDS: verde quando a coluna X do CONTROLE tem OK ou quando o turno foi no horário previsto; amarelo quando a resposta foi “Não” e não há OK.'+(semX?' A coluna X do CONTROLE ainda não chegou ao painel; por enquanto o check usa só a resposta “ENTROU e SAIU no horário previsto?”.':'')));
 el.appendChild(rod)});

/* ---------- 8. Cartão programa do dia — SOMENTE CONSULTA (nada é lançado pelo painel) ---------- */
PA.cpData='';
function cpItens(data){const cp=(dash.data('cp').data||[]).filter(c=>c.data===data&&c.op);const raw=(dash.data('reds_cp').data||[]);
 if(cp.length)return {fonte:'Cartão programa x REDS (cronograma e nota da escala)',itens:cp.map(c=>{const r=raw[c.id]||{};return {atividade:c.op,cod:c.cod,horario:String(r['HORÁRIO PREVISTO']||'').trim(),local:String(r['COMUNIDADES/SETOR PREVISTOS']||'').trim(),equipe:String(c.equipe||'').trim(),min:c.min}})};
 const o=opdDados();const d=o&&(o.dias||[]).find(x=>x.data===data);if(d&&d.itens.length)return {fonte:'Controle de Operações Diárias'+(o.fonte==='teste'?' (dados de teste)':''),itens:d.itens.map(i=>({atividade:i.nome,cod:i.codigo,horario:'',local:'',equipe:''}))};
 return {fonte:'',itens:[]}}
function cpServico(data){const g=dash.data('grade');if(g.status!=='ok'||!g.data||data.slice(0,7)!==PA.M.ym)return [];const dia=+data.slice(8,10);
 return g.data.filter(r=>r.dia===dia&&r.horas_escala>0).map(r=>({militar:r.militar,codigo:String(r.codigo||''),horario:r.horario||''})).sort((a,b)=>String(a.horario).localeCompare(String(b.horario)))}
function cpDatas(){const hj=hojeISO();return [...new Set([hj].concat((dash.data('cp').data||[]).filter(c=>c.op).map(c=>c.data)).concat(((opdDados()||{}).dias||[]).filter(d=>d.itens.length).map(d=>d.data)))].filter(Boolean).sort()}
dash.draw('m-dia',el=>{const n=cpItens(hojeISO()).itens.length;el.textContent=n?String(n):'—'});
if(PA.nav){const nav0=PA.nav;PA.nav=function(g,tab,op,f){if(g==='dia')PA.cpData='';return nav0.apply(this,arguments)}}
dash.draw('cp-dia',el=>{el.replaceChildren();const hj=hojeISO();const data=PA.cpData||hj;
 const fb=E('div','fbar');const lb=E('label',null,'Data (opcional)');const sel=E('select');sel.setAttribute('aria-label','Escolher outra data');
 cpDatas().forEach(d=>sel.appendChild(new Option(dmx(d)+(d===hj?' (hoje)':''),d)));if(![...sel.options].some(o=>o.value===data))sel.appendChild(new Option(dmx(data),data));sel.value=data;
 sel.onchange=()=>{PA.cpData=sel.value===hj?'':sel.value;dash.draw('cp-dia')};fb.append(lb,sel);
 if(data!==hj)fb.appendChild(PA.btnLimpar(()=>{PA.cpData='';dash.draw('cp-dia')},'Voltar para hoje'));el.appendChild(fb);
 const DS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];const dw=DS[new Date(data+'T12:00:00').getDay()];
 el.appendChild(E('div','cp-data',(data===hj?'Hoje, ':'')+dmx(data)+' · '+dw));
 const {fonte,itens}=cpItens(data);
 if(!itens.length){el.appendChild(E('p','cp-vazio','Não há atividade prevista para '+dmx(data)+' nas fontes do painel.'))}
 else{const ul=E('ul','cp-lista');itens.forEach(it=>{const li=E('li','cp-item');li.appendChild(E('div','cp-ativ',it.atividade));li.appendChild(E('div','cp-cod',it.cod||'—'));
   if(!it.horario&&!it.local&&!it.equipe&&!it.min){li.appendChild(E('div','cp-nd2','Horário, local/subsetor e guarnição: conforme escala do dia.'));ul.appendChild(li);return}
   const dl=E('dl','cp-campos');const dur=/^\d+(,\d+)?\s*h$/i.test(it.horario);
   [['Horário',it.horario&&!dur?it.horario:''],['Duração mínima',dur?it.horario:(it.min?Math.round(it.min)+' min':'')],['Local / subsetor',it.local],['Guarnição / turno',it.equipe]].forEach(([k,v])=>{if(!v&&k==='Duração mínima')return;const dt=E('dt',null,k),dd=E('dd',null,v||'conforme escala do dia');if(!v)dd.className='cp-nd';dl.append(dt,dd)});
   li.appendChild(dl);ul.appendChild(li)});el.appendChild(ul);el.appendChild(E('p','sub','Fonte: '+fonte+'.'))}
 const sv=cpServico(data);if(sv.length){const box=E('div','cp-servico');box.appendChild(E('div','cp-sub','Militares de serviço no dia (escala)'));const ul=E('ul','cp-mil');sv.forEach(m=>ul.appendChild(E('li',null,m.militar+' · '+(m.horario||m.codigo))));box.appendChild(ul);el.appendChild(box)}
 el.appendChild(E('p','cp-nota','Somente consulta. O cumprimento é apurado pelos REDS no dia seguinte; nada é lançado por este painel.'))});
})();
