/* ===== v4.3.6-teste (19/11/2026): uso, REDS do mês, carta atrasada, eventos e limite. Não entra no oficial. ===== */
(function(){
const PA=window.PA;
const E=PA.E||((t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e});
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const nomeMes=()=>{if(PA.M&&PA.M.min)return PA.M.min;if(PA.M&&PA.M.ym)return MESES[+PA.M.ym.slice(5,7)-1]||'';const ym=(PA.raw&&PA.raw._mes)||'';return ym?MESES[+ym.slice(5,7)-1]||'':'este mês'};
const hojeISO=()=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){const d=new Date();const z=d.getTimezoneOffset();const l=new Date(d.getTime()-(z-180)*6e4);return l.toISOString().slice(0,10)}};
const isoBr=s=>{s=String(s||'');const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[3]+'/'+m[2]+'/'+m[1];const n=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return n?s:''};
const paraIso=s=>{s=String(s||'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:''};
const diasEntre=(a,b)=>{const A=Date.parse(a+'T12:00:00'),B=Date.parse(b+'T12:00:00');if(!isFinite(A)||!isFinite(B))return null;return Math.round((B-A)/864e5)};
const plural=(n,sg,pl)=> (Math.abs(n)===1?sg:pl).replace('%s', String(n));

/* 35 — concordância de plural em textos gerados depois */
const PL=[
  [/(\d+)\s+visita\(s\) tranquilizadora\(s\) vencida\(s\)/g,(m,n)=>plural(+n,'%s visita tranquilizadora vencida','%s visitas tranquilizadoras vencidas')],
  [/(\d+)\s+visita\(s\) no prazo, ainda não realizada\(s\)/g,(m,n)=>plural(+n,'%s visita no prazo, ainda não realizada','%s visitas no prazo, ainda não realizadas')],
  [/(\d+)\s+item\(ns\)/g,(m,n)=>plural(+n,'%s item','%s itens')],
  [/(\d+)\s+área\(s\)/g,(m,n)=>plural(+n,'%s área','%s áreas')],
  [/\b1 visitas pendentes\b/g,'1 visita pendente'],
  [/\b1 visitas\b/g,'1 visita']
];
PA.acertaPlural=function(s){s=String(s==null?'':s);PL.forEach(([re,to])=>{s=s.replace(re,to)});return s};
function varrerPlural(el){if(!el||el.nodeType!==1)return;const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null);let n;while(n=w.nextNode()){const t=PA.acertaPlural(n.nodeValue);if(t!==n.nodeValue)n.nodeValue=t}}
const mo=new MutationObserver(muts=>{muts.forEach(m=>m.addedNodes.forEach(nd=>{if(nd.nodeType===1)varrerPlural(nd);else if(nd.nodeType===3){const t=PA.acertaPlural(nd.nodeValue);if(t!==nd.nodeValue)nd.nodeValue=t}}))});
if(document.body)mo.observe(document.body,{childList:true,subtree:true});
varrerPlural(document.body);

/* 34 — nomes unificados */
function unificarNomes(){
  /* Abastecimento e Viaturas abrem o grupo Logística (abas internas continuam com os nomes de cada tela). */
  document.querySelectorAll('#inicio .mcard, #menu .mcard').forEach(b=>{
    const tit=(b.querySelector('.mt1')&&b.querySelector('.mt1').textContent||'').trim();
    if(/^(Abastecimento|Viaturas)$/i.test(tit) || b.getAttribute('data-ir')==='viaturas' || b.getAttribute('data-ir')==='odometro' || b.getAttribute('data-abrir')==='abastecimento'){
      if(b.hasAttribute('data-ir')) b.setAttribute('data-ir','logistica');
      if(b.hasAttribute('data-abrir')) b.setAttribute('data-abrir','logistica');
    }
  });
  const tabDia=document.querySelector("#abas .tab[data-tab='dia-cartao']");
  if(tabDia && tabDia.textContent.trim()==='Cartão programa') tabDia.textContent='Cartão programa do dia';
}
unificarNomes();

/* 29 e 28 — link próprio de cada aba e rolar até ela */
const ALIAS={
  prox:'previsao', inicio:'', 'esc-atual':'escala', 'esc-hoje':'esc-hoje',
  'home':'', 'inicio':''
};
function alvoHash(h){
  h=String(h||'').replace(/^#/,'').split('?')[0];
  if(ALIAS[h]!=null)h=ALIAS[h];
  return h;
}
function rolarAba(h){
  const orig=String(h||'').replace(/^#/,'').split('?')[0];
  const dest=alvoHash(orig);
  const el=document.getElementById(orig)||document.getElementById(dest)||document.querySelector("[data-pane='"+dest+"']")||document.querySelector("#abas .tab[data-tab='"+dest+"']");
  if(!el)return;
  setTimeout(()=>{try{el.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){el.scrollIntoView(true)}},80);
}
function instalarPaIr(){
  if(!window.PA_ir||window.PA_ir._v436)return !!window.PA_ir;
  const orig=window.PA_ir;
  window.PA_ir=function(h){
    const dest=alvoHash(h);
    let ok=false;
    if(orig) ok=!!orig.call(this, dest);
    if(!ok && dest){
      const t=[...document.querySelectorAll('#abas .tab')].find(x=>x.dataset.tab===dest);
      if(t&&window.PA_abrir){window.PA_abrir(t.dataset.grupo,dest);ok=true}
    }
    if(ok) rolarAba(String(h||dest||''));
    return ok;
  };
  window.PA_ir._v436=true;
  if(location.hash) window.PA_ir(location.hash);
  return true;
}
(function(){
  if(!instalarPaIr()){
    const t=setInterval(()=>{if(instalarPaIr())clearInterval(t)},20);
    setTimeout(()=>clearInterval(t),15000);
  }
  window.addEventListener('hashchange',()=>{if(window.PA_ir)window.PA_ir(location.hash);else rolarAba(location.hash)});
})();

/* 16 — REDS de <mês> ainda não disponível */
PA.redsIndisponivel=function(){
  const raw=PA.raw||{};
  const vazia=k=>{const v=raw[k];return !v||(Array.isArray(v)&&v.length<=1)};
  return vazia('reds_reg')&&vazia('reds_prod')&&vazia('reds_metas')&&vazia('reds_crimes');
};
PA.msgReds=function(){return 'REDS de '+nomeMes()+' ainda não disponível'};
function trocarAguardandoReds(){
  if(!(window.dash&&typeof dash.draw==='function'))return;
  if(PA._avisoRedsHook) {
    if(!PA.redsIndisponivel())return;
    const msg=PA.msgReds();
    document.querySelectorAll("[data-draw='aviso']").forEach(el=>{
      const t=String(el.textContent||'');
      if(t && t!==msg && (/Aguardando/i.test(t)||/planilha de análise do REDS/i.test(t))){el.textContent=msg;el.hidden=false;el.classList.add('aviso-reds')}
    });
    return;
  }
  dash.draw('aviso',el=>{
    const ks=String(el.dataset.k||'').split(',');
    const vazio=k=>{const d=dash.data(k);return d.status!=='ok'||!d.data||!d.data.length};
    const v=ks.some(vazio);
    el.hidden=!v;
    el.textContent=v?(PA.redsIndisponivel()?PA.msgReds():'Sem dados desta seção no REDS do mês.'):'';
    if(v)el.classList.add('aviso-reds');
  });
  PA._avisoRedsHook=true;
}

/* 17 — carta com mais de 7 dias */
function cartaRefIso(){
  const c=PA.raw&&PA.raw.carta; if(!c)return '';
  return paraIso(c.ref||c.dataCarta||c.atualizadaEm||'');
}
function cartaAtrasada(){
  const ref=cartaRefIso(); if(!ref)return null;
  const n=diasEntre(ref,hojeISO());
  return (n!=null&&n>7)?{ref,dias:n}:null;
}
function avisoCarta(){
  const a=cartaAtrasada();
  let box=document.getElementById('aviso-carta-velha');
  if(!a){if(box)box.remove();return}
  if(!box){
    box=E('div','aviso-faixa aviso-carta');box.id='aviso-carta-velha';box.setAttribute('role','status');
    const bar=document.getElementById('statusbar');
    if(bar&&bar.parentNode)bar.insertAdjacentElement('afterend',box);
    else document.body.insertBefore(box,document.body.firstChild);
  }
  const txt='Carta situacional desatualizada: última atualização em '+isoBr(a.ref)+' (há '+a.dias+' dias). A rotina é às sextas, depois das 18h.';
  if(box.textContent!==txt) box.textContent=txt;
}

/* 25 — lista do teto dividida; 24 — Situação individual sem militar */
function listasTeto(){
  const d=dash.data&&dash.data('atencao_dia');
  const teto=(d&&d.status==='ok'&&d.data&&d.data.teto)||[];
  const acima=teto.filter(x=>x.acima||x.projecao>x.limite).sort((a,b)=>b.projecao-a.projecao);
  const atencao=teto.filter(x=>!(x.acima||x.projecao>x.limite)).sort((a,b)=>b.projecao-a.projecao);
  return {acima,atencao};
}
function blocoTeto(titulo, itens, vazio){
  const box=E('div','aten-bloco');
  box.appendChild(E('h3',null,titulo));
  if(!itens.length){box.appendChild(E('p','sub',vazio));return box}
  const ul=E('ul');
  itens.forEach(x=>{
    const li=E('li',null,x.militar+' · projeção '+PA.fmtN(x.projecao,1)+' h de '+PA.fmtN(x.limite,1)+' h');
    ul.appendChild(li);
  });
  box.appendChild(ul);
  return box;
}
function pintarListasTeto(el){
  const L=listasTeto();
  /* substitui o bloco único "próximos ou acima" se existir */
  const hs=[...el.querySelectorAll('h3')].filter(h=>/próximos ou acima/i.test(h.textContent));
  if(hs.length){
    const antigo=hs[0].parentNode;
    const frag=document.createDocumentFragment();
    frag.appendChild(blocoTeto('Acima do limite',L.acima,'Nenhum militar com projeção acima do limite.'));
    frag.appendChild(blocoTeto('Atenção (90%+)',L.atencao,'Nenhum militar com projeção em 90% ou mais do limite, ainda abaixo do teto.'));
    antigo.parentNode.insertBefore(frag, antigo);
    antigo.remove();
  }
}
const _atencao=dash.draw;
/* reforça depois do desenho original */
(function(){
  const orig=dash.draws&&dash.draws['atencao-dia'];
  const prev=dash.draw;
})();
function hookDraw(id,fn){
  const old=dash.draw;
  /* dash.draw(id, fn) registers; dash.draw(id, el=>) later. We wrap after register by intercepting when el is painted. */
  const map=PA._hooksDraw||(PA._hooksDraw={});
  map[id]=(map[id]||[]).concat([fn]);
}
const _drawReg=dash.draw.bind(dash);
/* We can't easily wrap internal registry. Use MutationObserver on #atencao-dia and #meu */
function quandoPronto(fn){const t=setInterval(()=>{if(window.dash&&dash.data){clearInterval(t);fn()}},200);setTimeout(()=>clearInterval(t),30000)}

quandoPronto(()=>{
  const el=document.getElementById('atencao-dia');
  if(el){
    const obs=new MutationObserver(()=>pintarListasTeto(el));
    obs.observe(el,{childList:true,subtree:true});
    pintarListasTeto(el);
  }
  const meu=document.getElementById('meu')||document.querySelector("[data-draw='meu']");
  const pintarMeu=()=>{
    const alvo=document.querySelector("[data-draw='meu']")||document.getElementById('meu');
    if(!alvo)return;
    if(PA.selMil){alvo.querySelectorAll('.teto-vazio').forEach(x=>x.remove());return}
    if(alvo.querySelector('.teto-vazio'))return;
    const intro=[...alvo.querySelectorAll('p.sub')].find(p=>/Selecione o militar/i.test(p.textContent));
    const L=listasTeto();
    const box=E('div','teto-vazio');
    box.appendChild(E('p','sub','Sem militar escolhido. Abaixo, quem já passou do limite e quem está em atenção (projeção em 90% ou mais). A seleção no campo Militar também filtra as demais visões.'));
    box.appendChild(blocoTeto('Acima do limite',L.acima,'Nenhum militar com projeção acima do limite.'));
    box.appendChild(blocoTeto('Atenção (90%+)',L.atencao,'Nenhum militar em atenção (90% ou mais, ainda abaixo do teto).'));
    if(intro) intro.replaceWith(box);
    else if(!alvo.childElementCount||alvo.textContent.trim()) alvo.appendChild(box);
    else alvo.appendChild(box);
  };
  const alvo=document.querySelector("[data-draw='meu']");
  if(alvo){new MutationObserver(pintarMeu).observe(alvo,{childList:true,subtree:true});pintarMeu()}
});

/* 30 — Resumo por militar com 5 colunas + detalhes */
function compactarResumo(){
  /* Pedido do Matheus (19/11/2026): retirar o “Ver detalhes” em todas as telas. */
  return;
  const table=document.querySelector("#t-resumo, [data-draw='t-resumo']")?.closest('table')||document.querySelector("table:has([data-draw='t-resumo'])");
  const tb=document.querySelector("[data-draw='t-resumo']");
  if(!tb||!tb.rows.length)return;
  const tableEl=tb.closest('table'); if(!tableEl)return;
  if(tableEl.dataset.compacto==='1')return;
  const thead=tableEl.querySelector('thead tr');
  if(!thead)return;
  const heads=[...thead.children].map(th=>th.textContent.trim());
  const keepNomes=['Militar','Previsto da escala','Horas lançadas','Total','Projeção do mês','Projeção','Saldo sobre o limite','Saldo'];
  /* map by header keywords */
  const idxDe=fn=>heads.findIndex(h=>fn(h.toLowerCase()));
  const iMil=0;
  const iPrev=idxDe(h=>/previsto/.test(h));
  const iTot=idxDe(h=>h==='total'||h.startsWith('total '));
  const iProj=idxDe(h=>h==='projeção do mês'||h==='projeção'||h==='projecao');
  const iSaldo=idxDe(h=>h==='saldo sobre o limite'||h==='saldo');
  const keep=[iMil,iPrev>=0?iPrev:1,iTot>=0?iTot:2,iProj>=0?iProj:3,iSaldo>=0?iSaldo:4].filter((v,i,a)=>v>=0&&a.indexOf(v)===i);
  if(keep.length<3)return;
  const ocultar=[...heads.keys()].filter(i=>!keep.includes(i));
  const aplicar=()=>{
    [...tableEl.querySelectorAll('tr')].forEach(tr=>{
      [...tr.children].forEach((c,i)=>{c.hidden=ocultar.includes(i)});
    });
    if(!tableEl.querySelector('th.det-col')){
      const th=E('th',null,''); th.className='det-col'; th.textContent='Detalhes';
      thead.appendChild(th);
      [...tb.rows].forEach((tr,ri)=>{
        const td=E('td','det-col');
        const b=E('button','btn-det','Ver detalhes'); b.type='button';
        b.addEventListener('click',()=>{
          const aberto=tr.classList.contains('aberto-det');
          tableEl.querySelectorAll('tr.extra-det, tr.aberto-det').forEach(x=>{if(x!==tr)x.classList.remove('aberto-det')});
          tableEl.querySelectorAll('tr.extra-det').forEach(x=>x.remove());
          if(aberto){tr.classList.remove('aberto-det');return}
          tr.classList.add('aberto-det');
          const extra=E('tr','extra-det');
          const cell=E('td'); cell.colSpan=keep.length+1;
          const dl=E('dl','res-det');
          heads.forEach((h,i)=>{
            if(keep.includes(i))return;
            const v=(tr.children[i]&&tr.children[i].textContent||'').trim();
            dl.append(E('dt',null,h),E('dd',null,v||'—'));
          });
          cell.appendChild(dl); extra.appendChild(cell);
          tr.after(extra);
        });
        td.appendChild(b); tr.appendChild(td);
      });
    }
    tableEl.dataset.compacto='1';
    tableEl.classList.add('resumo-compacto');
  };
  aplicar();
  new MutationObserver(()=>{
    if(!tb.rows.length)return;
    if(!tb.rows[0]||tb.rows[0].querySelector('td.det-col'))return;
    tableEl.dataset.compacto='';
    compactarResumo();
  }).observe(tb,{childList:true});
}

/* 31 — explicações técnicas em "Como ler" */
function recolherComoLer(){
  document.querySelectorAll('section .sub, .card > p.sub').forEach(p=>{
    if(p.dataset.comoLer)return;
    const t=p.textContent||'';
    if(t.length<180)return;
    if(/Horários: 2\/3|CPR|pré-turno|Res\.|Lei |art\.|projeção = realizado/i.test(t) || t.length>220){
      const d=E('details','como-ler');
      d.appendChild(E('summary',null,'Como ler'));
      p.dataset.comoLer='1';
      p.parentNode.insertBefore(d,p);
      d.appendChild(p);
    }
  });
}

/* 32 — filtro só divergentes */
function botaoDivergentes(table, testa){
  if(!table||table.dataset.filtroDiv)return;
  table.dataset.filtroDiv='1';
  const bar=E('div','fbar filtro-div');
  const b=E('button','pbtn','Só divergentes'); b.type='button'; b.setAttribute('aria-pressed','false');
  let on=false;
  b.addEventListener('click',()=>{
    on=!on; b.setAttribute('aria-pressed',String(on));
    const tb=table.tBodies[0]||table.querySelector('tbody');
    if(!tb)return;
    [...tb.rows].forEach(tr=>{
      if(tr.classList.contains('extra-det'))return;
      tr.hidden=on&&!testa(tr);
    });
  });
  table.parentNode.insertBefore(bar, table);
  bar.appendChild(b);
}
function ligarFiltrosDiv(){
  document.querySelectorAll('table').forEach(tb=>{
    const cap=(tb.querySelector('thead')?tb.closest('.card'):null);
    const id=(tb.querySelector('[data-draw]')||{}).getAttribute?.('data-draw')||'';
    if(id==='t-conf'||/abastec|confer/i.test((cap&&cap.querySelector('h2')||{}).textContent||'')){
      botaoDivergentes(tb, tr=>/divergente|verificar/i.test(tr.textContent));
    }
    if(id==='t-cp-todos'||id==='t-cp'){
      botaoDivergentes(tb, tr=>/não registrado|parcial|código divergente|divergente/i.test(tr.textContent));
    }
  });
}

/* 27 — Divergências abrem com a lista (sem exigir área) */
function listaDivTodas(){
  if(!(window.dash&&typeof dash.draw==='function'))return;
  if(PA._tDivHook){
    /* o draw já lista tudo; só ajusta o texto de orientação */
    const d=dash.data('div');
    const all=(d&&d.status==='ok'&&d.data)||[];
    const L=all.filter(x=>PA.divBaixas||x.gravidade!=='Baixa');
    document.querySelectorAll("[data-draw='div-leg'], [data-draw='div-txt']").forEach(el=>{
      if(/Selecione a área/.test(el.textContent)){
        const ar=[...new Set(L.map(x=>x.area))].length;
        const nxt=L.length?('Há '+PA.acertaPlural(L.length+' item(ns)')+' para conferir em '+PA.acertaPlural(ar+' área(s)')+'. Toque numa área para filtrar, ou veja a lista completa abaixo.'):el.textContent;
        if(el.textContent!==nxt) el.textContent=nxt;
      }
    });
    return;
  }
  dash.draw('t-div',tb=>{
    tb.replaceChildren();
    const d=dash.data('div');
    const all=(d&&d.status==='ok'&&d.data)||[];
    const L=all.filter(x=> (PA.selDivCat?x.area===PA.selDivCat:true) && (PA.divBaixas||x.gravidade!=='Baixa'));
    const HS=['Área','Gravidade','Descrição'];
    L.forEach(r=>{
      const tr=E('tr');
      [[r.area],[r.gravidade,r.gravidade==='Alta'?'bad':r.gravidade==='Média'?'warn':''],[r.descricao]].forEach(([v,c],i)=>{const td=E('td',c||null,v||'—');td.setAttribute('data-label',HS[i]);tr.appendChild(td)});
      tb.appendChild(tr);
    });
  });
  PA._tDivHook=true;
}

/* 24 — bloco Hoje no topo da inicial; 25 — recorte de divergências abaixo da barra */
function blocoHoje(){
  if(document.getElementById('bloco-hoje'))return;
  const ini=document.getElementById('inicio'); if(!ini)return;
  const box=E('div','card bloco-hoje'); box.id='bloco-hoje';
  box.appendChild(E('h2',null,'Hoje'));
  const ul=E('ul','hoje-lista'); box.appendChild(ul);
  const ban=ini.querySelector('.banner-teste');
  if(ban) ban.insertAdjacentElement('afterend',box);
  else ini.insertBefore(box, ini.firstChild);
  const preencher=()=>{
    ul.replaceChildren();
    const hj=hojeISO();
    const item=(t,s)=>{const li=E('li');li.append(E('b',null,t+': '),document.createTextNode(s));ul.appendChild(li)};
    try{
      const he=document.querySelector("[data-draw='esc-hoje']");
      item('Serviço', he&&he.textContent.trim()?he.textContent.trim().slice(0,240):'Consulte a Escala (serviço de hoje).');
    }catch(e){item('Serviço','Consulte a Escala.')}
    try{
      const {itens}= (typeof cpItens==='function'?cpItens(hj):{itens:[]});
      item('Cartão programa', itens&&itens.length?itens.map(i=>i.atividade).join('; '):'Sem atividade prevista para hoje nas fontes do painel.');
    }catch(e){item('Cartão programa','Consulte o Cartão programa do dia.')}
    const L=listasTeto();
    item('Carga horária', L.acima.length? (plural(L.acima.length,'%s militar acima do limite','%s militares acima do limite')) : 'Ninguém acima do limite neste momento.');
    const ev=eventosSemPlano();
    if(ev.length) item('Eventos', ev.length+' evento(s) nos próximos 7 dias sem risco ou policiamento definidos.');
  };
  PA._preencherHoje=preencher;
  setTimeout(preencher,800);
}
function faixaDivergencias(){
  /* a faixa da home foi para o rodapé (atuarFaixaDiv em addon_v436_fix.js) */
  if(PA._atuFaixaDiv) setTimeout(PA._atuFaixaDiv,800);
}

/* 26 — naturezas só na tela */
const NAT_MAP={
  'ATEND. DENUNCIA INFRACOES CONTRA MULHER(VIOLENCIA DOMESTICA)':'ATENDIMENTO DE DENUNCIA DE INFRACOES CONTRA A MULHER (VIOLENCIA DOMESTICA)',
  'ATEND. DENUNCIA INFRACOES CONTRA MULHER (VIOLENCIA DOMESTICA)':'ATENDIMENTO DE DENUNCIA DE INFRACOES CONTRA A MULHER (VIOLENCIA DOMESTICA)'
};
PA.normNat=function(s){
  let t=String(s||'').replace(/\s+/g,' ').trim();
  const k=t.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(NAT_MAP[t]||NAT_MAP[k]) return NAT_MAP[t]||NAT_MAP[k];
  t=t.replace(/^ATEND\.\s+/i,'ATENDIMENTO DE ');
  return t;
};
function padronizarNaturezas(){
  document.querySelectorAll('[data-draw="g-cr-nat"] text, [data-draw="g-cr-nat"] .tick, [data-draw="t-crimes"] td, [data-draw="hot"] td, [data-draw="t-hot"] td').forEach(el=>{
    if(el.childElementCount)return;
    const n=PA.normNat(el.textContent); if(n!==el.textContent) el.textContent=n;
  });
  /* eixos de gráfico e tooltips */
  document.querySelectorAll('#crimes text, section#crimes td, section#crimes .tip, section#crimes li').forEach(el=>{
    if(el.childElementCount>1)return;
    const t=el.textContent; if(/DENUNCIA|ATEND/i.test(t)){const n=PA.normNat(t); if(n!==t)el.textContent=n}
  });
}

/* 27 — evento em até 7 dias sem risco/policiamento ou "A definir" */
function eventosSemPlano(){
  const ev=PA.raw&&PA.raw.eventos; const itens=(ev&&ev.itens)||[];
  const hj=hojeISO();
  return itens.filter(e=>{
    const d=paraIso(e.dataInicio||e.data||''); if(!d)return false;
    const n=diasEntre(hj,d); if(n==null||n<0||n>7)return false;
    const risco=String(e.risco||'').trim();
    const pol=String(e.policiamento||e.efetivoPm||'').trim();
    const falta=v=>!v||/^a definir$/i.test(v)||v==='—'||v==='-';
    return falta(risco)||falta(pol);
  });
}
function avisoEventos(){
  const ev=eventosSemPlano();
  let box=document.getElementById('aviso-evt-plano');
  const sec=document.getElementById('eventos')||document.querySelector("[data-pane='eventos']")||document.querySelector("[data-draw='evt-proximos']");
  if(!ev.length){if(box)box.remove();return ev}
  if(!box){
    box=E('div','aviso-faixa aviso-evt'); box.id='aviso-evt-plano'; box.setAttribute('role','status');
    const alvo=document.querySelector("[data-draw='evt-proximos']")||sec;
    if(alvo) alvo.parentNode.insertBefore(box, alvo);
    else if(sec) sec.insertBefore(box, sec.firstChild);
  }
  const nomes=ev.map(e=>(e.nome||'Evento')+' em '+isoBr(paraIso(e.dataInicio||e.data))).join('; ');
  box.textContent='Evento em até 7 dias sem classificação de risco ou policiamento previsto (ou com “A definir”): '+nomes+'. Responsável pelo preenchimento: o militar que recebeu o ofício no formulário.';
  return ev;
}

/* 28 — legenda 3/4* também na escala */
function legendaEscala(){
  const txt='Horários: 2/3 e PR1 08–18 · 3/4* 15–01 · 3/4 16–02 · PR2 13–23 · C1 07–15 · C2 15–23 · C3 23–07 · 2 08–14 · 3 14–20 · 4* 20–02 · F folga. O asterisco em 3/4* e 4* marca a variante que começa uma hora mais cedo (3/4* 15–01, 10 h; 3/4 16–02, 10 h).';
  ['esc-atual-grade','prox-escala','esc-hoje'].forEach(id=>{
    const el=document.getElementById(id)||document.querySelector("[data-draw='"+id+"']");
    if(!el)return;
    const card=el.closest('.card')||el.parentNode;
    if(!card||card.querySelector('.leg-escala-cod'))return;
    const p=E('p','sub leg-escala-cod',txt);
    card.appendChild(p);
  });
}

function passagemDados(){
  if(PA._passando)return;
  PA._passando=true;
  try{
    trocarAguardandoReds();
    avisoCarta();
    recolherComoLer();
    ligarFiltrosDiv();
    listaDivTodas();
    compactarResumo();
    padronizarNaturezas();
    avisoEventos();
    legendaEscala();
    if(PA._preencherHoje)PA._preencherHoje();
    if(PA._atuFaixaDiv)PA._atuFaixaDiv();
    varrerPlural(document.body);
  }finally{PA._passando=false}
}

blocoHoje();
faixaDivergencias();

quandoPronto(()=>{
  passagemDados();
  const raiz=document.getElementById('app')||document.body;
  let ag=null;
  new MutationObserver(()=>{clearTimeout(ag);ag=setTimeout(passagemDados,120)}).observe(raiz,{childList:true,subtree:true});
});
})();
