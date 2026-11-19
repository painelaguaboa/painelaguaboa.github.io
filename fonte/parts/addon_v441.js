/* ===== v4.4.1: card Registros, detalhe do REDS em janela sobreposta ===== */
(function(){
const E=PA.E||function(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
PA.E=E;

function munNorm(s){
  return String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function munOk(){
  const m=(window.METAS&&METAS.municipio)||(PA.METAS&&PA.METAS.municipio)||'AGUA BOA';
  return munNorm(m)||'AGUA BOA';
}
function isFora(mun){
  const t=munNorm(mun);
  return !!(t && t!==munOk() && !/AGUA BOA/.test(t));
}
function isoData(v){
  const s=String(v||'').trim();
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const m=s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/);
  if(m) return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  return s;
}
function dm(iso){
  const s=isoData(iso);
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m?m[3]+'/'+m[2]:(s||'—');
}
function noPeriodo(dataIso){
  if(PA.selDia) return isoData(dataIso)===isoData(PA.selDia);
  return true;
}
const RX_REDS=/^\d{4}-\d{9}-\d{3}$/;

/* Tipos reais da aba REGISTROS, agrupados para o card. */
PA.grupoTipoReds=function(tipo){
  const t=String(tipo||'').trim();
  if(!t) return 'outros';
  if(/^RAT$/i.test(t)) return 'RAT';
  if(/^BOS/i.test(t)) return 'BOS';
  if(/\bTCO\b|termo\s+circunstanciado/i.test(t)) return 'TCO';
  if(/^BO\b/i.test(t) || /^boletim/i.test(t)) return 'BO';
  return 'outros';
};
PA.TIPOS_REDS=[
  {id:'BO', titulo:'BO', sub:'Boletim de ocorrência (policial, trânsito, ambiental e outros).'},
  {id:'RAT', titulo:'RAT', sub:'Relatório de atividades.'},
  {id:'BOS', titulo:'BOS', sub:'Boletim de ocorrência simplificado, inclusive o amplo.'},
  {id:'TCO', titulo:'TCO', sub:'Termo Circunstanciado de Ocorrência — só quando o tipo do REDS for TCO.'}
];

function listaReg(raw){
  const d=dash.data('reds_reg');
  return (d&&d.status==='ok'&&Array.isArray(d.data))?d.data:[];
}

PA.listaRegistrosMes=function(){
  const mun=munOk();
  return listaReg().map(r=>{
    const tipo=r.tipo||'';
    return {
      reds:r.reds, tipo:tipo, grupoTipo:PA.grupoTipoReds(tipo),
      codigo:r.codigo, natureza:r.natureza, categoria:r.categoria,
      data:isoData(r.data), inicio:r.inicio, termino:r.termino,
      municipio:r.municipio, bairro:r.bairro,
      fora:isFora(r.municipio),
      resp:r.resp
    };
  }).filter(r=>r.reds);
};

PA.contagemRegistros=function(){
  const L=PA.listaRegistrosMes().filter(r=>!r.fora && noPeriodo(r.data));
  const por={BO:0,RAT:0,BOS:0,TCO:0,outros:0};
  L.forEach(r=>{por[r.grupoTipo]=(por[r.grupoTipo]||0)+1});
  return {total:L.length, por:por, fora:PA.listaRegistrosMes().filter(r=>r.fora && noPeriodo(r.data)).length};
};

/* Junta crime + registro + bloco reds_bo para o card do detalhe. */
PA.dadoReds=function(id){
  const crimes=(typeof PA.listaCrimesMes==='function'?PA.listaCrimesMes():[]);
  const c=crimes.find(x=>x.reds===id)||{};
  const r=PA.listaRegistrosMes().find(x=>x.reds===id)||{};
  const boRaw=((PA.raw&&PA.raw.reds_bo)||[]);
  let extra={};
  if(Array.isArray(boRaw)&&boRaw.length>1){
    const h=(boRaw[0]||[]).map(x=>String(x||'').trim());
    const row=boRaw.slice(1).find(rr=>rr&&String(rr[0]||'').trim()===id);
    if(row) h.forEach((k,i)=>{if(k) extra[k]=row[i]});
  }
  const crTab=dash.data('reds_crimes');
  let obs='';
  if(crTab&&crTab.status==='ok'&&Array.isArray(crTab.data)){
    const hit=crTab.data.find(x=> (x['Nº REDS']||x['N. REDS'])===id);
    if(hit) obs=String(hit['OBSERVAÇÃO']||hit['OBSERVACAO']||'');
  }
  let natSec=c.natSec||'';
  const m=/natureza secund[aá]ria:\s*(.+)/i.exec(obs);
  if(m) natSec=m[1].trim();
  const tipo=r.tipo||extra['TIPO']||c.tipo||'';
  const data=c.data||r.data||isoData(extra['DATA']);
  const horaFato=c.hora||'';
  const inicioAt=r.inicio||extra['INÍCIO']||extra['INICIO']||'';
  const nat=c.nat||r.natureza||extra['NATUREZA']||'';
  const cod=c.cod||r.codigo||extra['CÓDIGO']||extra['CODIGO']||'';
  const cat=c.cat||r.categoria||extra['CATEGORIA']||'';
  const vd=c.vd;
  const grupo=c.grupo||(typeof PA.classificaCrime==='function'&&cod?PA.classificaCrime(cod,nat,cat,vd):'');
  const gTit=(PA.CRIMES_GRUPOS||[]).find(x=>x.id===grupo);
  const bairro=c.bairro||r.bairro||extra['BAIRRO/COMUNIDADE']||'';
  const mun=c.municipio||r.municipio||extra['MUNICÍPIO']||extra['MUNICIPIO']||'';
  const vtr=c.viatura||extra['VIATURA(S)']||extra['VIATURA']||'';
  const frac=c.fracao||extra['FRAÇÃO DO RESPONSÁVEL']||extra['FRACAO DO RESPONSAVEL']||'';
  const resumo=c.resumo||([
    nat?(nat+(cod?' ('+cod+')':'')):'',
    tipo, bairro?('em '+bairro):'', 
    c.situacao?String(c.situacao).toLowerCase():''
  ].filter(Boolean).join('. ')+(nat?'.':''));
  return {
    reds:id, tipo, data, horaFato, inicioAt, nat, natSec, cod, cat, grupo,
    grupoTitulo:gTit?gTit.titulo:(grupo||''),
    bairro, municipio:mun, fora:isFora(mun),
    viatura:vtr, fracao:frac, resumo, vd:!!vd,
    situacao:c.situacao||'', qtdVitimas:c.qtdVitimas, qtdAutores:c.qtdAutores,
    prisao:c.prisao, tipoPrisao:c.tipoPrisao, apreensoes:c.apreensoes, veiculo:c.veiculo
  };
};

/* ---------- janela sobreposta do detalhe ---------- */
function scroller(){return document.scrollingElement||document.documentElement;}

function marcarAncora(sel, reds){
  if(!sel&&!reds) return;
  let el=null;
  if(sel){try{el=document.querySelector(sel)}catch(e){}}
  if(!el&&reds){
    el=document.querySelector('[data-reds="'+reds+'"]');
  }
  if(!el) return;
  el.classList.add('pa-reds-flash');
  el.setAttribute('data-reds-flash','1');
  setTimeout(()=>{el.classList.remove('pa-reds-flash');el.removeAttribute('data-reds-flash')},2800);
}

function fecharSheet(viaHist){
  const wrap=document.getElementById('pa-reds-overlay');
  if(!wrap) return;
  const st=PA._redsSheet||{};
  wrap.remove();
  document.body.classList.remove('pa-reds-aberto');
  document.removeEventListener('keydown', onEsc, true);
  PA._redsSheet=null;
  const y=st.y||0;
  requestAnimationFrame(()=>{scroller().scrollTop=y; window.scrollTo(0,y);
    setTimeout(()=>{window.scrollTo(0,y); marcarAncora(st.ancora, st.reds)},50);
  });
  if(st.pushed && !viaHist){
    PA._redsFechaHist=true;
    try{history.back()}catch(e){}
  }
}

function onEsc(ev){if(ev.key==='Escape'){ev.preventDefault();fecharSheet()}}

function onPopReds(ev){
  if(PA._redsFechaHist){PA._redsFechaHist=false; return;}
  if(PA._redsSheet){
    ev.stopImmediatePropagation();
    fecharSheet(true);
  }
}
window.addEventListener('popstate', onPopReds, true);

function linDet(dl, rot, val, cls){
  const v=(val==null||val==='')?'':String(val).trim();
  if(!v) return;
  dl.appendChild(E('dt',null,rot));
  dl.appendChild(E('dd',cls||'',v));
}

function renderSheetBody(box, d, lista, idx){
  const topo=E('div','pa-reds-topo');
  const fechar=E('button','pa-reds-fechar','Fechar');
  fechar.type='button';
  fechar.setAttribute('aria-label','Fechar detalhe do REDS');
  const x=E('span','pa-reds-x','×');
  x.setAttribute('aria-hidden','true');
  fechar.prepend(x);
  fechar.addEventListener('click',()=>fecharSheet());
  const tit=E('div','pa-reds-tit');
  tit.appendChild(E('strong',null,d.reds));
  if(d.tipo) tit.appendChild(E('span','pa-reds-tipo',d.tipo));
  topo.appendChild(fechar);
  topo.appendChild(tit);
  if(lista&&lista.length>1){
    const nav=E('div','pa-reds-nav');
    const ant=E('button','pbtn pa-reds-np','Anterior');
    const prx=E('button','pbtn pa-reds-np','Próximo');
    ant.type=prx.type='button';
    ant.disabled=idx<=0;
    prx.disabled=idx>=lista.length-1;
    ant.addEventListener('click',()=>{if(idx>0)PA.abrirRedsDetalhe({lista:lista,index:idx-1,semHist:true,manterY:true})});
    prx.addEventListener('click',()=>{if(idx<lista.length-1)PA.abrirRedsDetalhe({lista:lista,index:idx+1,semHist:true,manterY:true})});
    nav.append(ant,prx);
    topo.appendChild(nav);
  }
  box.appendChild(topo);

  const corpo=E('div','pa-reds-corpo');
  const dl=E('dl','pa-reds-dl');
  const quando=d.horaFato?(dm(d.data)+' · '+d.horaFato):(dm(d.data)+(d.inicioAt?' (início do atendimento: '+d.inicioAt+')':''));
  linDet(dl,'Data e hora do fato', d.horaFato? (dm(d.data)+' · '+d.horaFato): dm(d.data));
  if(!d.horaFato && d.inicioAt) linDet(dl,'Início do atendimento', d.inicioAt);
  linDet(dl,'Natureza principal', (d.nat||'—')+(d.cod?' ('+d.cod+')':''));
  if(d.natSec) linDet(dl,'Natureza secundária', d.natSec);
  if(d.grupoTitulo) linDet(dl,'Grupo do crime', d.grupoTitulo+(d.vd?' · Lei Maria da Penha':''));
  else if(d.vd) linDet(dl,'Marcador','Lei Maria da Penha (violência doméstica)');
  linDet(dl,'Local', d.bairro? (d.bairro+(d.fora&&d.municipio?(' · '+d.municipio):'')) : (d.municipio||''));
  const guar=[d.fracao, d.viatura?('viatura '+d.viatura):''].filter(Boolean).join(' · ');
  linDet(dl,'Guarnição e viatura', guar);
  if(d.situacao) linDet(dl,'Situação', d.situacao);
  if(d.prisao && /^s/i.test(String(d.prisao))) linDet(dl,'Prisão', d.tipoPrisao||'Sim');
  if(d.apreensoes) linDet(dl,'Apreensões', d.apreensoes);
  linDet(dl,'Resumo', d.resumo||'—', 'pa-reds-resumo');
  corpo.appendChild(dl);
  corpo.appendChild(E('p','sub','O resumo usa só campos estruturados do REDS. Não são exibidos nomes de envolvidos, CPF, telefone, endereço completo nem coordenadas.'));
  box.appendChild(corpo);
}

PA.abrirRedsDetalhe=function(opts){
  opts=opts||{};
  const lista=(opts.lista||[]).filter(x=>x&& (x.reds||typeof x==='string')).map(x=>typeof x==='string'?{reds:x}:x);
  let idx=opts.index;
  if(idx==null && opts.reds) idx=lista.findIndex(x=>x.reds===opts.reds);
  if(idx==null||idx<0){ if(opts.reds){ lista.unshift({reds:opts.reds}); idx=0;} else return; }
  const id=lista[idx].reds;
  const d=PA.dadoReds(id);
  const y=opts.manterY&&PA._redsSheet?PA._redsSheet.y:(window.scrollY||scroller().scrollTop||0);
  const ancora=opts.ancora||('[data-reds="'+id+'"]');
  const already=document.getElementById('pa-reds-overlay');
  if(already) already.remove();

  const wrap=E('div','pa-reds-overlay');
  wrap.id='pa-reds-overlay';
  wrap.setAttribute('role','presentation');
  const back=E('button','pa-reds-back');
  back.type='button';
  back.setAttribute('aria-label','Fechar, tocando fora do detalhe');
  back.addEventListener('click',()=>fecharSheet());
  const sheet=E('div','pa-reds-sheet');
  sheet.setAttribute('role','dialog');
  sheet.setAttribute('aria-modal','true');
  sheet.setAttribute('aria-labelledby','pa-reds-tit-id');
  renderSheetBody(sheet,d,lista,idx);
  const t=sheet.querySelector('.pa-reds-tit strong');
  if(t) t.id='pa-reds-tit-id';
  wrap.append(back,sheet);
  document.body.appendChild(wrap);
  document.body.classList.add('pa-reds-aberto');
  document.addEventListener('keydown', onEsc, true);
  const fechar=sheet.querySelector('.pa-reds-fechar');
  if(fechar) try{fechar.focus()}catch(e){}

  let pushed=opts.semHist? !!(PA._redsSheet&&PA._redsSheet.pushed) : true;
  if(!opts.semHist){
    try{history.pushState({paReds:1,reds:id},'')}catch(e){pushed=false}
  }
  PA._redsSheet={reds:id,y:y,ancora:ancora,pushed:pushed,lista:lista,index:idx};
};

/* Voltar do app fecha a janela primeiro. */
const _voltar=PA.voltar;
if(typeof _voltar==='function'){
  PA.voltar=function(){ if(PA._redsSheet){fecharSheet();return;} return _voltar.apply(this,arguments); };
}

/* ---------- card da home e tela Registros ---------- */
function setNum(el,n){
  if(!el)return;
  el.replaceChildren();
  el.appendChild(document.createTextNode((n==null||n==='')?'—':String(n)));
}

dash.draw('m-reg',el=>{
  const c=PA.contagemRegistros();
  setNum(el,c.total);
  const md=el.closest('.mcard')&&el.closest('.mcard').querySelector('.md');
  if(md){
    const p=c.por;
    md.textContent='BO '+p.BO+' · RAT '+p.RAT+' · BOS '+p.BOS+' · TCO '+p.TCO;
  }
});

function redesenhaReg(){
  ['rg-tipos','rg-lista'].forEach(n=>{try{dash.draw(n)}catch(e){}});
}

dash.draw('rg-tipos',el=>{
  el.replaceChildren();
  const c=PA.contagemRegistros();
  const grid=E('div','cr-g-grid rg-g-grid');
  PA.TIPOS_REDS.forEach(g=>{
    const n=c.por[g.id]||0;
    const b=E('button','cr-grupo'+(n?'':' cr-grupo-vazio')+(PA.selRegTipo===g.id?' cr-grupo-on':''));
    b.type='button';
    b.setAttribute('aria-pressed', PA.selRegTipo===g.id?'true':'false');
    b.appendChild(E('span','cr-g-tit',g.titulo));
    b.appendChild(E('span','cr-g-sub',g.sub));
    const nv=E('span','cr-g-n');
    nv.appendChild(E('b',null,String(n)));
    nv.appendChild(document.createTextNode(n===1?' registro':' registros'));
    b.appendChild(nv);
    b.addEventListener('click',()=>{
      PA.selRegTipo=PA.selRegTipo===g.id?null:g.id;
      redesenhaReg();
    });
    grid.appendChild(b);
  });
  el.appendChild(grid);
  const tot=E('p','sub','Total: '+c.total+' REDS em Água Boa'+(PA.selDia?' no dia '+dm(PA.selDia):' no mês')+'.');
  el.appendChild(tot);
  if(c.fora){
    el.appendChild(E('p','sub',c.fora+' registro(s) do destacamento fora de Água Boa (inclusive Itambacuri) não entram nestes totais.'));
  }
});

dash.draw('rg-lista',el=>{
  el.replaceChildren();
  const gid=PA.selRegTipo;
  if(!gid){el.hidden=true;return}
  el.hidden=false;
  const g=PA.TIPOS_REDS.find(x=>x.id===gid);
  const itens=PA.listaRegistrosMes().filter(r=>!r.fora&&noPeriodo(r.data)&&r.grupoTipo===gid)
    .sort((a,b)=>(b.data||'').localeCompare(a.data||'')||String(b.reds).localeCompare(String(a.reds)));
  el.appendChild(E('h3',null,g?g.titulo:'Tipo'));
  el.appendChild(E('p','sub',itens.length?(itens.length+(itens.length===1?' registro':' registros')+' · toque para abrir o detalhe'):('Nenhum '+((g&&g.titulo)||'registro')+' neste período em Água Boa.')));
  if(!itens.length) return;
  const ul=E('ul','cr-bo-lst');
  itens.forEach((r,i)=>{
    const li=E('li');
    const b=E('button','cr-bo-item');
    b.type='button';
    b.setAttribute('data-reds',r.reds);
    b.appendChild(E('span','cr-bo-n',r.reds));
    b.appendChild(E('span','cr-bo-m',dm(r.data)+(r.inicio?' · '+r.inicio:'')));
    b.appendChild(E('span','cr-bo-t',(r.tipo?r.tipo+' · ':'')+(r.natureza||'Natureza não informada')+(r.codigo?' ('+r.codigo+')':'')));
    b.appendChild(E('span','cr-bo-b',r.bairro||r.municipio||''));
    b.addEventListener('click',()=>{
      PA.abrirRedsDetalhe({lista:itens,index:i,reds:r.reds,ancora:'[data-reds="'+r.reds+'"]'});
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
  el.appendChild(ul);
});

/* Crimes: o detalhe deixa de abrir embaixo da lista e passa à janela. */
const _redesenha=typeof redesenhaCrimes==='function'?redesenhaCrimes:(PA.redesenhaCrimes);
function hookCrimesLista(){
  const el=document.querySelector("[data-draw='cr-grupo-lista']");
  if(!el) return;
  const bo=document.querySelector("[data-draw='cr-bo']");
  if(bo){bo.hidden=true;bo.replaceChildren();}
  el.querySelectorAll('.cr-bo-item').forEach((b,i)=>{
    const n=b.querySelector('.cr-bo-n');
    const reds=n?n.textContent.trim():'';
    if(RX_REDS.test(reds)) b.setAttribute('data-reds',reds);
    const novo=b.cloneNode(true);
    b.parentNode.replaceChild(novo,b);
    novo.addEventListener('click',()=>{
      const id=novo.getAttribute('data-reds');
      const gid=PA.selCrimeGrupo;
      const itens=(typeof PA.listaCrimesMes==='function'?PA.listaCrimesMes():[])
        .filter(c=>!c.fora&&c.grupo===gid)
        .sort((a,b)=>(b.data||'').localeCompare(a.data||'')||String(b.reds).localeCompare(String(a.reds)));
      const idx=itens.findIndex(c=>c.reds===id);
      PA.abrirRedsDetalhe({lista:itens,index:idx<0?0:idx,reds:id,ancora:'[data-reds="'+id+'"]'});
    });
  });
}

if(typeof window.redesenhaCrimes==='function' || typeof redesenhaCrimes==='function'){
  const orig=window.redesenhaCrimes||redesenhaCrimes;
  window.redesenhaCrimes=function(){
    PA.selCrimeReds=null;
    const r=orig.apply(this,arguments);
    hookCrimesLista();
    return r;
  };
  if(typeof redesenhaCrimes==='function') try{redesenhaCrimes=window.redesenhaCrimes}catch(e){}
}

const _drawGrupo=dash.draw;
/* After any draw of the crime list, hook buttons. */
const _crDraw=dash._draws||{};
function afterDrawCrimes(){
  hookCrimesLista();
  const bo=document.querySelector("[data-draw='cr-bo']");
  if(bo){bo.hidden=true;}
}
['cr-grupo-lista','cr-bo','cr-grupos'].forEach(n=>{
  /* wrap by observing after dash.draw is called — hook on clicks via delegation as fallback */
});

document.addEventListener('click',function(ev){
  if(ev.target.closest('.pa-reds-overlay')) return;
  const item=ev.target.closest('.cr-bo-item[data-reds], .cr-bo-item');
  if(item && item.closest("[data-draw='cr-grupo-lista']")){
    const reds=item.getAttribute('data-reds')||((item.querySelector('.cr-bo-n')||{}).textContent||'').trim();
    if(!RX_REDS.test(reds)) return;
    if(item.__paRedsHook) return;
    ev.preventDefault();
    ev.stopPropagation();
    const gid=PA.selCrimeGrupo;
    const itens=(typeof PA.listaCrimesMes==='function'?PA.listaCrimesMes():[])
      .filter(c=>!c.fora&&(!gid||c.grupo===gid))
      .sort((a,b)=>(b.data||'').localeCompare(a.data||'')||String(b.reds).localeCompare(String(a.reds)));
    const idx=itens.findIndex(c=>c.reds===reds);
    PA.abrirRedsDetalhe({lista:itens,index:idx<0?0:idx,reds:reds,ancora:'[data-reds="'+reds+'"]'});
  }
}, true);

/* Tabelas com coluna Nº REDS (dia, militar, resultados, apreensões, etc.). */
function marcarCelulasReds(root){
  (root||document).querySelectorAll('table.cards td').forEach(td=>{
    const t=String(td.textContent||'').trim();
    if(RX_REDS.test(t) && !td.querySelector('button,a')){
      td.setAttribute('data-reds',t);
      td.classList.add('pa-reds-cel');
      td.style.cursor='pointer';
      const tr=td.closest('tr');
      if(tr&&!tr.getAttribute('data-reds')) tr.setAttribute('data-reds',t);
    }
  });
}
const mo=new MutationObserver(()=>marcarCelulasReds());
if(document.body) mo.observe(document.body,{childList:true,subtree:true});
else document.addEventListener('DOMContentLoaded',()=>{mo.observe(document.body,{childList:true,subtree:true});marcarCelulasReds()});

document.addEventListener('click',function(ev){
  if(ev.target.closest('.pa-reds-overlay, .cr-bo-item')) return;
  const td=ev.target.closest('td.pa-reds-cel, td[data-reds], tr[data-reds] td');
  if(!td) return;
  const tr=td.closest('tr');
  const reds=(td.getAttribute('data-reds')||(tr&&tr.getAttribute('data-reds'))||String(td.textContent||'').trim());
  if(!RX_REDS.test(reds)) return;
  ev.preventDefault();
  ev.stopPropagation();
  const tab=td.closest('table');
  const lista=[];
  if(tab){
    tab.querySelectorAll('tr[data-reds], td[data-reds]').forEach(n=>{
      const id=n.getAttribute('data-reds');
      if(RX_REDS.test(id)&&!lista.some(x=>x.reds===id)) lista.push({reds:id});
    });
  }
  const ancora=tr?'tr[data-reds="'+reds+'"]':'[data-reds="'+reds+'"]';
  if(tr) tr.setAttribute('data-reds',reds);
  PA.abrirRedsDetalhe({lista:lista.length?lista:[{reds:reds}],reds:reds,ancora:ancora});
}, true);

/* Recarrega totais do card quando o mês/dia muda. */
const _setDia=PA.setDia;
if(typeof _setDia==='function'){
  PA.setDia=function(){const r=_setDia.apply(this,arguments); try{dash.draw('m-reg');dash.draw('rg-tipos');dash.draw('rg-lista')}catch(e){} return r;};
}

})();
