/* ===== v4.3.6-teste (19/11, 2ª rodada): correções do bloco Hoje, abas, REDS, celular e Intendência. ===== */
(function(){
const PA=window.PA;
const E=PA.E||((t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e});
const hojeISO=()=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){const d=new Date();return new Intl.DateTimeFormat('en-CA').format(d)}};
const isoBr=s=>{s=String(s||'');const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+'/'+m[2]+'/'+m[1]:s};
const isoDdMm=s=>{s=String(s||'');const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[3]+'/'+m[2]:s};
const diasEntre=(a,b)=>{const A=Date.parse(a+'T12:00:00'),B=Date.parse(b+'T12:00:00');if(!isFinite(A)||!isFinite(B))return null;return Math.round((B-A)/864e5)};
const plural=(n,sg,pl)=>(Math.abs(n)===1?sg:pl).replace('%s',String(n));

/* ---- Conf. da Intendência: "Com divergência" (item 14) ---- */
function textoVazioDiv(txt){
  const t=String(txt||'').replace(/\s+/g,' ').trim();
  if(!t)return true;
  const n=t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.:;]+$/,'');
  return /^(nenhum|nenhuma|nao|-|n\/a|n\.a\.?|na)$/.test(n);
}
function mapaCargaNao(v){
  const n=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  return n==='nao'||n==='nao.'||n==='n';
}
function marcarConf(r){
  if(!r||typeof r!=='object')return r;
  if(!textoVazioDiv(r.divergencias)||mapaCargaNao(r.mapaAtualizado)){
    r.resultado='Com divergência';
    r.comDivergencia=true;
  }
  return r;
}
function ajustarConfInt(s){
  if(!s||typeof s!=='object')return s;
  (s.lista||[]).forEach(marcarConf);
  if(s.lista&&s.lista[0]) s.resultado=s.lista[0].resultado;
  else marcarConf(s);
  return s;
}
(function instalarDash(){
  let cur=window.dash;
  const envolver=v=>{
    if(!v||v._v436fix)return v;
    if(typeof v.calc==='function'){
      const oc=v.calc.bind(v);
      v.calc=function(id,o){
        if(id==='conf_int'&&o&&typeof o.fn==='function'){
          const fn=o.fn;
          o=Object.assign({},o,{fn:function(carga){return ajustarConfInt(fn(carga))}});
        }
        return oc(id,o);
      };
    }
    if(typeof v._iniciar==='function'){
      const oi=v._iniciar.bind(v);
      v._iniciar=function(raw){
        const r=oi(raw);
        setTimeout(function(){ if(window.PA&&PA._passagemFix) PA._passagemFix(); },0);
        return r;
      };
    }
    v._v436fix=true;
    return v;
  };
  if(cur){ window.dash=envolver(cur); return; }
  try{
    Object.defineProperty(window,'dash',{
      configurable:true, enumerable:true,
      get(){return cur},
      set(v){ cur=envolver(v); }
    });
  }catch(e){}
})();

/* ---- 4. Um card Logística = tela Logística ---- */
function unificarLogistica(){
  if(document.querySelector('#inicio.home-padrao'))return;
  const cards=[...document.querySelectorAll('#inicio .mcard, #menu .mcard')];
  const peloTitulo=t=>cards.filter(b=>{
    const x=(b.querySelector('.mt1')&&b.querySelector('.mt1').textContent||'').trim();
    return new RegExp('^'+t+'$','i').test(x);
  });
  let ab=peloTitulo('Abastecimento')[0]||cards.find(b=>b.getAttribute('data-ir')==='viaturas'||(b.getAttribute('data-ir')==='logistica'&&/combustível|abastec/i.test(b.textContent)));
  let vt=peloTitulo('Viaturas')[0]||cards.find(b=>b!==ab&&(b.getAttribute('data-ir')==='odometro'||(/^Viaturas$/i.test((b.querySelector('.mt1')||{}).textContent||''))));
  if(ab&&vt&&ab!==vt){
    const t=ab.querySelector('.mt1'); if(t) t.textContent='Logística';
    const md=ab.querySelector('.md'); if(md) md.textContent='Abastecimento, odômetro, emprego por viatura, km por militar, motos e revisão.';
    const mv=ab.querySelector('.mv');
    if(mv&&vt.querySelector('.mv')){
      /* mantém o combustível e acrescenta as viaturas da carta, se couber */
    }
    ab.setAttribute('data-ir','logistica');
    ab.removeAttribute('data-abrir');
    vt.remove();
  }else{
    [...peloTitulo('Abastecimento'),...peloTitulo('Viaturas')].forEach(b=>{
      const t=b.querySelector('.mt1'); if(t) t.textContent='Logística';
      b.setAttribute('data-ir','logistica');
    });
  }
}
unificarLogistica();

/* ---- 3. Trocar de aba: rolar até a barra, não ao topo ---- */
function rolarBarraAbas(g){
  setTimeout(compactarTabelasMobile,300);
  if(!g)return;
  const bar=document.getElementById('grupo-topo')||document.getElementById('abas');
  if(!bar)return;
  const ir=()=>{try{bar.scrollIntoView({block:'start',behavior:'auto'})}catch(e){bar.scrollIntoView(true)}};
  ir();
  requestAnimationFrame(ir);
  setTimeout(ir,0);
  setTimeout(ir,80);
}
function instalarAbrir(){
  if(!window.PA_abrir||window.PA_abrir._v436fix)return !!window.PA_abrir;
  const orig=window.PA_abrir;
  window.PA_abrir=function(g,tab,op){
    const r=orig.apply(this,arguments);
    rolarBarraAbas(g);
    return r;
  };
  window.PA_abrir._v436fix=true;
  if(window.PA_ir&&!window.PA_ir._v436fixScroll){
    const ir=window.PA_ir;
    window.PA_ir=function(h){
      const ok=ir.apply(this,arguments);
      const dest=String(h||'').replace(/^#/,'').split('?')[0];
      const t=[...document.querySelectorAll('#abas .tab')].find(x=>x.dataset.tab===dest||x.dataset.grupo===dest);
      if(ok||t) rolarBarraAbas((t&&t.dataset.grupo)||dest||true);
      return ok;
    };
    window.PA_ir._v436=true;
    window.PA_ir._v436fixScroll=true;
  }
  return true;
}

document.addEventListener('click',function(ev){
  const b=ev.target.closest&&ev.target.closest('#abas .tab, [data-abrir], [data-ir], .mcard');
  if(!b)return;
  const g=b.dataset.grupo||b.getAttribute('data-abrir')||b.getAttribute('data-ir');
  if(!g||g==='inicio')return;
  setTimeout(function(){rolarBarraAbas(g)},0);
  setTimeout(function(){rolarBarraAbas(g)},80);
}, false);

(function(){
  if(!instalarAbrir()){
    const t=setInterval(()=>{if(instalarAbrir())clearInterval(t)},20);
    setTimeout(()=>clearInterval(t),20000);
  }
})();

/* ---- 1 e 2. Bloco Hoje com as mesmas fontes do painel ---- */
function itensCartaoHoje(){
  const data=hojeISO();
  try{
    const cp=((dash.data('cp')||{}).data)||[];
    const raw=((dash.data('reds_cp')||{}).data)||[];
    const list=cp.filter(c=>c.data===data&&c.op);
    if(list.length) return list.map(c=>({atividade:c.op,cod:c.cod}));
  }catch(e){}
  try{
    const o=(PA.opdDados?PA.opdDados():(typeof opdDados==='function'?opdDados():(window.PA_OPD_TESTE&&PA.M&&window.PA_OPD_TESTE.ym===PA.M.ym?window.PA_OPD_TESTE:null)));
    const d=o&&(o.dias||[]).find(x=>x.data===data);
    if(d&&d.itens&&d.itens.length) return d.itens.map(i=>({atividade:i.nome||i.atividade,cod:i.codigo||i.cod}));
  }catch(e){}
  /* fallback: o mesmo número do card da inicial */
  const n=parseInt((document.querySelector("[data-draw='m-dia']")||{}).textContent,10);
  if(n) return Array.from({length:n},()=>({atividade:null}));
  return [];
}
function servicoHoje(){
  const data=hojeISO();
  try{
    const g=dash.data('grade');
    if(!g||g.status!=='ok'||!g.data||!PA.M||data.slice(0,7)!==PA.M.ym) return [];
    const dia=+data.slice(8,10);
    return g.data.filter(r=>r.dia===dia&&r.horas_escala>0)
      .map(r=>({militar:r.militar,codigo:String(r.codigo||''),horario:r.horario||''}))
      .sort((a,b)=>String(a.horario).localeCompare(String(b.horario)));
  }catch(e){return []}
}
function textoServico(){
  const L=servicoHoje();
  if(!L.length) return 'Nenhum militar escalado em turno de serviço hoje.';
  const grupos={};
  L.forEach(r=>{
    const k=(r.codigo||'?')+(r.horario?' '+r.horario:'');
    (grupos[k]=grupos[k]||[]).push(r.militar);
  });
  return Object.keys(grupos).map(k=>k+': '+grupos[k].join(', ')).join(' · ');
}
function textoCartao(){
  const itens=itensCartaoHoje();
  if(!itens.length) return 'Sem atividade prevista para hoje.';
  const nomes=itens.map(i=>i.atividade).filter(Boolean);
  if(!nomes.length) return plural(itens.length,'%s atividade prevista para hoje','%s atividades previstas para hoje')+'.';
  return plural(itens.length,'%s atividade prevista para hoje','%s atividades previstas para hoje')+': '+nomes.join('; ')+'.';
}

function eventosSemPlanoFix(){
  const ev=PA.raw&&PA.raw.eventos; const itens=(ev&&ev.itens)||[];
  const hj=hojeISO();
  const paraIso=s=>{s=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:''};
  return itens.filter(e=>{
    const d=paraIso(e.dataInicio||e.data||''); if(!d)return false;
    const n=diasEntre(hj,d); if(n==null||n<0||n>7)return false;
    const risco=String(e.risco||'').trim();
    const pol=String(e.policiamento||e.efetivoPm||'').trim();
    const falta=v=>!v||/^a definir$/i.test(v)||v==='—'||v==='-';
    return falta(risco)||falta(pol);
  });
}
function preencherHoje(){
  const ul=document.querySelector('#bloco-hoje .hoje-lista');
  if(!ul)return;
  ul.replaceChildren();
  const item=(t,s)=>{const li=E('li');li.append(E('b',null,t+': '),document.createTextNode(s));ul.appendChild(li)};
  item('Serviço', textoServico());
  item('Cartão programa', textoCartao());
  try{
    const d=dash.data('resumo');
    const acima=((d&&d.status==='ok'&&d.data)||[]).filter(r=>r.projecao>r.limite);
    item('Carga horária', acima.length? plural(acima.length,'%s militar acima do limite','%s militares acima do limite') : 'Ninguém acima do limite neste momento.');
  }catch(e){item('Carga horária','Consulte a Carga horária.')}
  try{
    const ev=eventosSemPlanoFix();
    if(ev.length) item('Eventos', plural(ev.length,'%s evento nos próximos 7 dias sem risco ou policiamento definidos.','%s eventos nos próximos 7 dias sem risco ou policiamento definidos.'));
  }catch(e){}
  const reds=textoRedsAte();
  if(reds) item('REDS', reds.texto);
}
PA._preencherHoje=preencherHoje;

/* ---- 15. REDS atualizado até dd/mm ---- */
function dataRedsMaisRecente(){
  try{
    const d=dash.data('reds_reg');
    const rows=(d&&d.status==='ok'&&d.data)||[];
    const datas=rows.map(r=>String(r.data||'').slice(0,10)).filter(s=>/^\d{4}-\d{2}-\d{2}$/.test(s));
    if(!datas.length)return '';
    return datas.sort()[datas.length-1];
  }catch(e){return ''}
}
function textoRedsAte(){
  if(typeof PA.redsIndisponivel==='function'&&PA.redsIndisponivel())return null;
  const ref=dataRedsMaisRecente();
  if(!ref)return null;
  const n=diasEntre(ref,hojeISO());
  return {ref,dias:n,atrasado:n!=null&&n>1, texto:'REDS atualizado até '+isoDdMm(ref)+(n!=null&&n>1?' (há '+n+' dias)':'')};
}
function faixaReds(){
  let box=document.getElementById('aviso-reds-ate');
  const info=textoRedsAte();
  if(!info){
    /* se o mês não tem REDS, o aviso específico cuida; some este */
    if(box)box.remove();
    return;
  }
  if(!box){
    box=E('div','aviso-faixa aviso-reds-ate'); box.id='aviso-reds-ate'; box.setAttribute('role','status');
    const bar=document.getElementById('statusbar');
    if(bar&&bar.parentNode)bar.insertAdjacentElement('afterend',box);
    else document.body.insertBefore(box,document.body.firstChild);
  }
  box.classList.toggle('atrasado', !!info.atrasado);
  if(box.textContent!==info.texto) box.textContent=info.texto;
}

/* ---- 7. Destaque de divergências na inicial ---- */
function listaDiv(){
  try{
    const d=dash.data&&dash.data('div');
    return (d&&d.status==='ok'&&d.data)||[];
  }catch(e){return []}
}
function atuarFaixaDiv(){
  ['faixa-div','destaque-div-inicio'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove()});
  const all=listaDiv();
  const vis=all.filter(x=>PA.divBaixas||x.gravidade!=='Baixa');
  const n=vis.length||all.length;
  let box=document.getElementById('rodape-div');
  if(!box){
    box=E('p','rodape-div'); box.id='rodape-div';
    const rod=document.querySelector('.pa .rodape, .rodape');
    if(rod&&rod.parentNode) rod.parentNode.insertBefore(box, rod);
    else document.body.appendChild(box);
  }
  if(!n){box.hidden=true;box.replaceChildren();return}
  const txt=plural(n,'%s item em Divergências para conferir','%s itens em Divergências para conferir');
  if(box.dataset.n===String(n)&&box.textContent===txt){box.hidden=false;return}
  box.dataset.n=String(n);
  box.hidden=false;
  box.replaceChildren();
  const a=E('a',null,txt);
  a.href='#divergencias';
  a.addEventListener('click',ev=>{ev.preventDefault();if(window.PA_ir)window.PA_ir('divergencias');else if(window.PA_abrir)PA_abrir('divergencias')});
  box.appendChild(a);
}
PA._atuFaixaDiv=atuarFaixaDiv;

/* ---- 5. Divergências abrem com a lista ---- */
function abrirListaDiv(){
  if(!(window.dash&&typeof dash.draw==='function'))return;
  const tw=document.getElementById('div-tabela');
  if(tw) tw.hidden=false;
  if(!PA._divNeutroHook){
    dash.draw('div-neutro',el=>{
      const L=listaDiv().filter(x=>PA.divBaixas||x.gravidade!=='Baixa');
      const tw2=document.getElementById('div-tabela'); if(tw2) tw2.hidden=false;
      const ar=[...new Set(L.map(x=>x.area))].length;
      if(!PA.selDivCat){
        el.textContent=L.length?('Há '+plural(L.length,'%s item para conferir','%s itens para conferir')+' em '+plural(ar,'%s área','%s áreas')+'. A lista completa está abaixo; toque numa área para filtrar.'):'Não há item para conferir.';
        return;
      }
      const n=L.filter(x=>x.area===PA.selDivCat).length;
      el.textContent=PA.selDivCat+': '+plural(n,'%s item','%s itens')+(PA.divBaixas?'':' de gravidade alta ou média')+'.';
    });
    PA._divNeutroHook=true;
  }
  if(!PA._tDivHook2){
    dash.draw('t-div',tb=>{
      tb.replaceChildren();
      const L=listaDiv().filter(x=>(PA.selDivCat?x.area===PA.selDivCat:true)&&(PA.divBaixas||x.gravidade!=='Baixa'));
      const HS=['Área','Gravidade','Descrição'];
      L.forEach(r=>{
        const tr=E('tr');
        [[r.area],[r.gravidade,r.gravidade==='Alta'?'bad':r.gravidade==='Média'?'warn':''],[r.descricao]].forEach(([v,c],i)=>{const td=E('td',c||null,v||'—');td.setAttribute('data-label',HS[i]);tr.appendChild(td)});
        tb.appendChild(tr);
      });
    });
    PA._tDivHook2=true; PA._tDivHook=true;
  }
}

/* ---- 6. Plurais em números separados do texto (ex.: "1" + " visitas pendentes") ---- */
function acertarPluralSolto(){
  document.querySelectorAll('.mv, .hoje-lista li, .fn, .aviso-faixa, [data-draw]').forEach(el=>{
    if(el.dataset.pluralOk==='1'&&!/visita|evento|item|área|militar/.test(el.textContent))return;
    const txt=el.textContent||'';
    const regras=[
      [/1 visitas pendentes/g,'1 visita pendente'],
      [/1 visitas\b/g,'1 visita'],
      [/1 evento\(s\)/g,'1 evento'],
      [/(\d+) evento\(s\)/g,(m,n)=>plural(+n,'%s evento','%s eventos')],
      [/1 item\(ns\)/g,'1 item'],
      [/(\d+) item\(ns\)/g,(m,n)=>plural(+n,'%s item','%s itens')],
      [/1 área\(s\)/g,'1 área'],
      [/(\d+) área\(s\)/g,(m,n)=>plural(+n,'%s área','%s áreas')],
      [/\b1 militares\b/g,'1 militar']
    ];
    /* nós de texto */
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);
    const nodes=[]; let n; while(n=w.nextNode()) nodes.push(n);
    if(nodes.length===1){
      let t=nodes[0].nodeValue;
      regras.forEach(([re,to])=>{t=t.replace(re,to)});
      if(t!==nodes[0].nodeValue) nodes[0].nodeValue=t;
      return;
    }
    /* número num <b> e o restante no seguinte */
    const b=el.querySelector('b, [data-draw]');
    if(b&&b.nextSibling&&b.nextSibling.nodeType===3){
      const num=parseInt(b.textContent,10);
      let rest=b.nextSibling.nodeValue||'';
      if(!isNaN(num)){
        if(/^\s*visitas pendentes/.test(rest)) rest=num===1?' visita pendente':' visitas pendentes';
        else if(/^\s*visitas\b/.test(rest)) rest=num===1?' visita':' visitas';
        else if(/^\s*evento\(s\)/.test(rest)) rest=num===1?' evento':' eventos';
        else if(/^\s*item\(ns\)/.test(rest)) rest=num===1?' item':' itens';
        else if(/^\s*militares\b/.test(rest)) rest=num===1?' militar':' militares';
        if(rest!==b.nextSibling.nodeValue) b.nextSibling.nodeValue=rest;
      }
    }
  });
}

/* ---- 8 e 9. REDS do mês ausente e cabeçalho sem turno ---- */
function aplicarRedsAusente(){
  const sem=typeof PA.redsIndisponivel==='function'&&PA.redsIndisponivel();
  document.body.classList.toggle('sem-reds', !!sem);
  const msg=sem&&PA.msgReds?PA.msgReds():'';
  if(sem){
    document.querySelectorAll("[data-draw='aviso'], p.sub.warn, .aguarda, .aviso-reds").forEach(el=>{
      const t=String(el.textContent||'');
      if(!t||/Aguardando/i.test(t)||/planilha de análise do REDS/i.test(t)||/ainda não disponível/.test(t)||/ainda não é lida/i.test(t)){
        el.textContent=msg;
        el.hidden=false;
        el.classList.add('aviso-reds');
      }
    });
    /* metas 0/15 e projeção 0: substitui o bloco por um aviso, sem número enganoso */
    document.querySelectorAll("[data-draw='metas'], [data-draw='comp-ind'], [data-draw='res-kpis'], [data-draw='cp-res']").forEach(el=>{
      if(el.dataset.redsMsg==='1')return;
      if(/0\s*\/\s*\d+|projeção\s*0/i.test(el.textContent)||el.querySelector('.mi')){
        el.replaceChildren();
        el.appendChild(E('p','sub aviso-reds',msg+'. As metas e a projeção aparecerão quando a planilha do mês estiver disponível.'));
        el.dataset.redsMsg='1';
      }
    });
    /* textos soltos "Aguardando atualização do sistema" */
    document.querySelectorAll('p, div, span').forEach(el=>{
      if(el.childElementCount)return;
      const t=String(el.textContent||'');
      if(/^Aguardando atualização do sistema/i.test(t) || /planilha de análise do REDS ainda não é lida/i.test(t)){
        el.textContent=msg;
        el.classList.add('aviso-reds');
      }
    });
  }
}
function consertarCorte(){
  const inst=document.querySelector('#topo .banner-txt .inst:last-of-type')||document.querySelector('#topo .inst:last-of-type');
  if(!inst)return;
  if(!inst.dataset.corteOrig) inst.dataset.corteOrig=inst.innerHTML;
  const kpis=window.dash&&dash.data&&dash.data('kpis');
  if(!kpis||kpis.status!=='ok'||!kpis.data||!kpis.data[0])return;
  const corte=String(kpis.data[0].corte==null?'':kpis.data[0].corte).trim();
  const vazio=!corte||corte==='—'||corte==='00'||corte==='0';
  if(vazio){
    if(inst.dataset.semTurno==='1')return;
    inst.dataset.semTurno='1';
    const mes=document.querySelector("[data-draw='mes-nome']");
    inst.replaceChildren();
    if(mes) inst.appendChild(mes);
    inst.appendChild(document.createTextNode(mes?' · nenhum turno registrado ainda':'nenhum turno registrado ainda'));
  }else if(inst.dataset.semTurno==='1'){
    inst.innerHTML=inst.dataset.corteOrig;
    inst.dataset.semTurno='';
    try{dash.draw('mes-nome');dash.draw('corte');dash.draw('mes-mm')}catch(e){}
  }
}

/* ---- 11. Legenda 3/4* ---- */
function legendaEscalaClara(){
  const extra='3/4* = começa 1 h mais cedo (15h às 01h).';
  const base='Horários: 2/3 e PR1 08–18 · 3/4* 15–01 · 3/4 16–02 · PR2 13–23 · C1 07–15 · C2 15–23 · C3 23–07 · 2 08–14 · 3 14–20 · 4* 20–02 · F folga. '+extra+' O 3/4 “sem asterisco” é 16h às 02h (também 10 h). O 4* começa às 20h e vai até 02h (6 h).';
  document.querySelectorAll('.leg-escala-cod, p.sub').forEach(p=>{
    const t=p.textContent||'';
    if(/3\/4\*/.test(t) && !/começa 1 h mais cedo/.test(t) && /15[h–-]0?1/.test(t)){
      if(p.classList.contains('leg-escala-cod')||/Horários:/.test(t)){
        p.textContent=base;
      }
    }
  });
  ['esc-atual-grade','prox-escala','esc-hoje'].forEach(id=>{
    const el=document.getElementById(id)||document.querySelector("[data-draw='"+id+"']");
    if(!el)return;
    const card=el.closest('.card')||el.parentNode;
    if(!card)return;
    let p=card.querySelector('.leg-escala-cod');
    if(!p){ p=E('p','sub leg-escala-cod',base); card.appendChild(p); }
    else if(!/começa 1 h mais cedo/.test(p.textContent)) p.textContent=base;
  });
}

/* ---- 10. Tabelas no celular: campos principais + Ver detalhes; paginação ---- */
const COLS_PRINC={
  't-conf':['Data','Viatura','Motorista','Conferência'],
  't-vtr':['Viatura','Km','R$','Km/l'],
  't-motos':['Moto','Militar','Km rodados','R$'],
  't-ops':['Data','Indicador','Nº REDS'],
  't-prod':['Militar','Participações','Como responsável'],
  't-prod-turno':['Militar','Turnos trabalhados','Participações','Registros por turno'],
  't-apr':['Data','Nº REDS','Tipo','Militar'],
  't-res':['Data','Nº REDS','Resultado','Quantidade'],
  't-cp':['Data','Operação prevista','Situação'],
  't-cp-todos':['Data','Operação prevista','Situação'],
  't-div-ops':['Data','Nº REDS','Divergência','Gravidade'],
  't-visitas':['Visita','Data do fato','Situação'],
  't-kmmil':['Militar','Km no mês','Km/h']
};
function compactarTabelasMobile(){
  const estreito=(window.innerWidth||0)<=640 || !!(window.matchMedia&&window.matchMedia('(max-width:640px)').matches);
  if(!estreito){
    document.querySelectorAll('table.tabela-mobile').forEach(tb=>{
      tb.querySelectorAll('.col-extra').forEach(c=>c.classList.remove('col-extra'));
    });
    return;
  }
  const grupos=new Set();
  document.querySelectorAll('#abas .tab[data-grupo="logistica"], #abas .tab[data-grupo="operacoes"]').forEach(t=>grupos.add(t.dataset.tab));
  document.querySelectorAll('[data-pane]').forEach(sec=>{
    const pane=sec.getAttribute('data-pane');
    if(!grupos.has(pane))return;
    sec.querySelectorAll('table').forEach(table=>compactarUma(table,true));
  });
}
function compactarUma(table,estreito){
  /* Pedido do Matheus (19/11/2026): retirar o “Ver detalhes” em todas as telas.
     As tabelas voltam a mostrar todos os campos (ex.: Horário) como antes da v4.3.6. */
  return;
  const tb=table.tBodies[0]; if(!tb||!tb.rows.length)return;
  const heads=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
  const draw=(tb.querySelector('[data-draw]')||table.querySelector('[data-draw]')||{}).getAttribute?.('data-draw')||'';
  const prefer=COLS_PRINC[draw];
  const keep=prefer?heads.map((h,i)=>prefer.some(p=>h===p||h.toLowerCase()===p.toLowerCase())?i:-1).filter(i=>i>=0):heads.slice(0,Math.min(4,heads.length)).map((_,i)=>i);
  if(!keep.length) keep.push(0);
  const extra=heads.map((_,i)=>i).filter(i=>!keep.includes(i));
  table.classList.add('tabela-mobile');
  if(table.dataset.detMobile==='1'&&!tb.querySelector('td.det-col-mob')){
    table.dataset.detMobile='';
    const th0=table.querySelector('th.det-col-mob'); if(th0) th0.remove();
  }
  if(estreito&&extra.length){
    [...table.querySelectorAll('tr')].forEach(tr=>{
      if(tr.classList.contains('extra-det'))return;
      [...tr.children].forEach((c,i)=>{
        if(c.classList.contains('det-col-mob'))return;
        if(extra.includes(i)) c.classList.add('col-extra');
        else c.classList.remove('col-extra');
      });
    });
    if(!table.dataset.detMobile){
      const th=document.createElement('th'); th.className='det-col-mob'; th.textContent='Detalhes';
      const headRow=table.querySelector('thead tr'); if(headRow) headRow.appendChild(th);
      [...tb.rows].forEach(tr=>{
        if(tr.classList.contains('extra-det')||tr.querySelector('.det-col-mob'))return;
        const td=E('td','det-col-mob');
        const b=E('button','btn-det','Ver detalhes'); b.type='button';
        b.addEventListener('click',()=>{
          const aberto=tr.classList.contains('aberto-det');
          const nxt=tr.nextElementSibling;
          if(aberto&&nxt&&nxt.classList.contains('extra-det')){nxt.remove();tr.classList.remove('aberto-det');b.textContent='Ver detalhes';return}
          tr.classList.add('aberto-det'); b.textContent='Ocultar detalhes';
          const extraTr=E('tr','extra-det');
          const cell=E('td'); cell.colSpan=keep.length+1;
          const dl=E('dl','res-det');
          heads.forEach((h,i)=>{
            if(keep.includes(i))return;
            const v=(tr.children[i]&&tr.children[i].textContent||'').trim();
            dl.append(E('dt',null,h),E('dd',null,v||'—'));
          });
          cell.appendChild(dl); extraTr.appendChild(cell);
          tr.after(extraTr);
        });
        td.appendChild(b); tr.appendChild(td);
      });
      table.dataset.detMobile='1';
    }
  }
  /* paginação: 12 linhas visíveis */
  const PAG=12;
  const rows=[...tb.rows].filter(r=>!r.classList.contains('extra-det'));
  if(rows.length>PAG){
    let wrap=table.parentElement.querySelector('.pag-tabela');
    if(!wrap){
      wrap=E('div','pag-tabela');
      const info=E('span');
      const ant=E('button','pbtn','Anterior'); ant.type='button';
      const prox=E('button','pbtn','Próxima'); prox.type='button';
      wrap.append(ant,info,prox);
      table.after(wrap);
      wrap._pag=0;
      const pintar=()=>{
        const p=wrap._pag||0;
        const ini=p*PAG, fim=ini+PAG;
        rows.forEach((r,i)=>{
          const vis=i>=ini&&i<fim;
          r.hidden=!vis;
          r.classList.toggle('pag-oculta', !vis);
          const det=r.nextElementSibling;
          if(det&&det.classList.contains('extra-det')&&!vis) det.remove();
        });
        info.textContent=' '+(ini+1)+'–'+Math.min(fim,rows.length)+' de '+rows.length+' ';
        ant.disabled=p<=0; prox.disabled=fim>=rows.length;
      };
      ant.addEventListener('click',()=>{wrap._pag=Math.max(0,(wrap._pag||0)-1);pintar()});
      prox.addEventListener('click',()=>{wrap._pag=(wrap._pag||0)+1;pintar()});
      table._pintarPag=pintar;
    }
    if(table._pintarPag) table._pintarPag();
  }
}

function aplicarConfDivergencia(){
  if(!(window.dash&&dash.data))return;
  const d=dash.data('conf_int');
  if(!d||d.status!=='ok'||!d.data)return;
  const antes=JSON.stringify((d.data.lista||[]).map(r=>r.resultado));
  ajustarConfInt(d.data);
  const depois=JSON.stringify((d.data.lista||[]).map(r=>r.resultado));
  if(antes!==depois){
    ['int-confs','int-conf-sit','int-situacao'].forEach(n=>{try{dash.draw(n)}catch(e){}});
  }
}
function passagemFix(){
  if(PA._passandoFix)return;
  PA._passandoFix=true;
  try{
    if(typeof trocarAguardandoReds==='function') trocarAguardandoReds();
    aplicarRedsAusente();
    consertarCorte();
    faixaReds();
    abrirListaDiv();
    atuarFaixaDiv();
    preencherHoje();
    acertarPluralSolto();
    if(typeof varrerPlural==='function') varrerPlural(document.body);
    legendaEscalaClara();
    aplicarConfDivergencia();
    if(typeof avisoCarta==='function') avisoCarta();
    if(typeof avisoEventos==='function') avisoEventos();
  }finally{
    PA._passandoFix=false;
    clearTimeout(PA._compT);
    PA._compT=setTimeout(compactarTabelasMobile,200);
  }
}
PA._passagemFix=passagemFix;

function quandoPronto(fn){
  const t=setInterval(()=>{if(window.dash&&dash.data){clearInterval(t);fn()}},200);
  setTimeout(()=>clearInterval(t),40000);
}
quandoPronto(()=>{
  passagemFix();
  const raiz=document.getElementById('app')||document.body;
  let ag=null;
  new MutationObserver(()=>{clearTimeout(ag);ag=setTimeout(passagemFix,150)}).observe(raiz,{childList:true,subtree:true});
});
window.addEventListener('resize',()=>{clearTimeout(PA._rzFix);PA._rzFix=setTimeout(compactarTabelasMobile,250)});
})();
