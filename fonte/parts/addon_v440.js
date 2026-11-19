/* ===== v4.4.0-teste: home padronizada (só a versão de teste até aprovação) ===== */
(function(){
const E=PA.E||function(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
function setNum(el,n){
  if(!el)return;
  const v=(n==null||n==='')?'—':String(n);
  el.replaceChildren();
  el.appendChild(document.createTextNode(v));
}
function hojeISO(){
  try{if(typeof window.hojeISO==='function')return window.hojeISO()}catch(e){}
  const d=new Date();
  const p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
}

/* Número só no <b>; o resumo de uma linha fica no .md do card. */
dash.draw('m-im',el=>{
  const d=(window.PA&&PA.raw&&PA.raw.info_militares)||null;
  if(!d||!d.ok){setNum(el,'—');return}
  setNum(el,(d.militares||[]).length);
  const r=d.resumo||{}, n60=r.coletes60||0, nf=r.armasFixas||0, ni=r.armasIntendencia||0;
  const md=el.closest('.mcard')&&el.closest('.mcard').querySelector('.md');
  if(md) md.textContent=n60+' colete'+(n60===1?'':'s')+' em alerta · '+nf+' arma'+(nf===1?'':'s')+' fixa'+(nf===1?'':'s')+' / '+ni+' na intendência';
});


dash.draw('m-evt',el=>{
  const d=dash.data('evt_prox');
  if(d.status!=='ok'||!d.data||d.data.pendente){setNum(el,'—');return}
  setNum(el,(d.data.itens||[]).length);
});

dash.draw('m-prural',el=>{
  const pend=dash.data('prural_pend');
  const d=dash.data('prural_ok');
  const btn=el.closest('.mcard');
  if(btn)btn.classList.remove('alerta');
  if(pend.status==='ok'&&pend.data){setNum(el,'—');return}
  if(d.status!=='ok'||!d.data){setNum(el,'—');return}
  const p=d.data;
  const md=btn&&btn.querySelector('.md');
  if(p.diasSemNovo>=14){
    setNum(el,p.diasSemNovo);
    if(md) md.textContent='Dias sem cadastro novo';
  }else{
    setNum(el,p.total);
    if(md) md.textContent=(p.cobertosPlano||0)+' de '+(p.metaPlano||0)+' comunidades do plano';
  }
});

dash.draw('m-int',el=>{
  const d=dash.data('conf_int');
  if(d.status!=='ok'||!d.data){setNum(el,'—');return}
  const c=d.data;
  const pend=c.kind==='ok'?0:1;
  setNum(el,pend);
  const md=el.closest('.mcard')&&el.closest('.mcard').querySelector('.md');
  if(md){
    let ult=c.ultima||'';
    const iso=String(ult).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso) ult=iso[3]+'/'+iso[2];
    const quem=(c.responsaveis?c.responsaveis+' em ':'')+ult;
    md.textContent=c.kind==='ok'?'Em dia'+(quem?' · '+quem:''):
      c.kind==='vence'?'A conferir neste mês':
      c.kind==='vencida'?'Conferência vencida':
      c.kind==='serv'?'Aguardando o servidor':'Sem registro de conferência';
  }
});

dash.draw('m-fer',el=>{
  const d=dash.data('ferias_per');
  if(!d||d.status!=='ok'||!d.data||!d.data.ok){setNum(el,'—');return}
  const hoje=hojeISO();
  const n=(d.data.itens||[]).filter(x=>x.ini&&x.fim&&x.ini<=hoje&&hoje<=x.fim).length;
  setNum(el,n);
});

dash.draw('m-vtr',el=>{
  const c=PA.raw&&PA.raw.carta;
  const n=c&&c.itens?c.itens.length:null;
  setNum(el,n==null?'—':n);
});

/* Título do bloco superior, sem mudar o conteúdo. */
function titHoje(){
  const h=document.querySelector('#bloco-hoje>h2');
  if(h) h.textContent='Hoje e alertas';
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',titHoje);
else titHoje();
const _p=PA._preencherHoje;
if(typeof _p==='function'){
  PA._preencherHoje=function(){ _p(); titHoje(); };
}
})();
