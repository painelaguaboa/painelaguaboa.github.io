/* ===== v4.4.3 (26/11/2026) — navegação dos cards Registros e Crimes, ordem por data, REDS conferido, DSP ===== */
(function(){
if(!window.PA)window.PA={};
const $=s=>document.querySelector(s);

/* N1–N3 e N6 — o desenho ignora elemento oculto; a lista é reaberta e redesenhada depois do toque no grupo */
function abrirListaCrimes(rolar){
  const corpo=document.getElementById('cr-bos-corpo'),bt=document.getElementById('cr-bos-toggle'),dica=document.getElementById('cr-bos-dica');
  const l=$("[data-draw='cr-grupo-lista']");
  if(PA.selCrimeGrupo){if(corpo)corpo.hidden=false;if(bt)bt.setAttribute('aria-expanded','true');if(dica)dica.hidden=true}
  if(l&&(!corpo||!corpo.hidden)){l.hidden=false;try{dash.draw('cr-grupo-lista')}catch(e){}}
  if(rolar&&PA.selCrimeGrupo){const c=document.getElementById('cr-bos-card')||l;if(c&&c.scrollIntoView)c.scrollIntoView({block:'start',behavior:'smooth'})}
}
function abrirListaReg(rolar){
  const l=$("[data-draw='rg-lista']");if(!l)return;
  l.hidden=false;try{dash.draw('rg-lista')}catch(e){}
  if(rolar&&!l.hidden&&l.scrollIntoView)l.scrollIntoView({block:'start',behavior:'smooth'});
}
/* fase de captura: o botão do grupo é redesenhado pelo próprio clique, então a tela é lida antes */
document.addEventListener('click',ev=>{
  const t=ev.target;if(!t||!t.closest)return;
  if(t.closest('#cr-bos-toggle')){setTimeout(()=>abrirListaCrimes(false),0);return}
  const b=t.closest('button.cr-grupo');if(!b||b.classList.contains('cr-subcard'))return;
  const pane=b.closest('[data-pane]');const id=pane&&pane.getAttribute('data-pane');
  setTimeout(()=>{if(id==='registros-reds')abrirListaReg(true);else if(id==='crimes')abrirListaCrimes(true)},0);
},true);
PA._abrirListaCrimes=abrirListaCrimes;PA._abrirListaReg=abrirListaReg;

/* Ordem por data — padrão: mais recentes primeiro; a escolha fica guardada no aparelho */
const ORD=['t-fora','t-conf','t-kmt','t-ops','t-res','t-apr','t-cp','t-cp-todos','t-cal-sem','t-div-ops'];
const OK='pa_ordem_v1';
let pref={};try{pref=JSON.parse(localStorage.getItem(OK)||'{}')||{}}catch(e){pref={}}
const ordem=n=>pref[n]==='asc'?'asc':'desc';
function salvar(){try{localStorage.setItem(OK,JSON.stringify(pref))}catch(e){}}
function colunas(table){
  const th=[...(table.tHead?table.tHead.rows[0].cells:[])].map(c=>(c.textContent||'').trim().toLowerCase());
  return {d:th.findIndex(x=>/^data\b|^dia\b/.test(x)),h:th.findIndex(x=>/^(hora|horário|início|inicio)\b/.test(x))};
}
function chave(tr,cl){
  const cel=i=>i>=0&&tr.cells[i]?(tr.cells[i].textContent||''):'';
  const ano=(PA.M&&PA.M.ano)||new Date().getFullYear();
  let tx=cel(cl.d);if(cl.d<0)tx=tr.textContent||'';
  const m=tx.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);if(!m)return null;
  let a=m[3]?(+m[3]<100?2000+(+m[3]):+m[3]):ano;
  const hm=(cel(cl.h)||tx.slice(m.index+m[0].length)).match(/(\d{1,2})[:h](\d{2})/);
  return a+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0')+' '+(hm?hm[1].padStart(2,'0')+':'+hm[2]:'00:00');
}
let ordenando=false;
function ordenar(tb){
  const n=tb.getAttribute('data-draw');const table=tb.closest('table');if(!table)return;
  const cl=colunas(table);if(cl.d<0)return;
  const rows=[...tb.rows];if(rows.length<2)return;
  /* linhas de detalhe acompanham a linha anterior */
  const grupos=[];rows.forEach(tr=>{if(tr.classList.contains('extra-det')&&grupos.length)grupos[grupos.length-1].push(tr);else grupos.push([tr])});
  const ord=ordem(n);
  const it=grupos.map((g,i)=>{if(g[0]._paIdx==null)g[0]._paIdx=i;return {g,k:chave(g[0],cl),i:g[0]._paIdx}});
  if(it.every(x=>x.k==null))return;
  const s=it.slice().sort((a,b)=>{if(a.k==null&&b.k==null)return a.i-b.i;if(a.k==null)return 1;if(b.k==null)return -1;
    const c=a.k<b.k?-1:a.k>b.k?1:a.i-b.i;return ord==='asc'?c:-c});
  const atual=it.map(x=>x.i).join(','),novo=s.map(x=>x.i).join(',');
  if(atual===novo)return;
  ordenando=true;const fr=document.createDocumentFragment();s.forEach(x=>x.g.forEach(tr=>fr.appendChild(tr)));tb.appendChild(fr);
  Promise.resolve().then(()=>{ordenando=false});
}
function rotulo(b,n){const d=ordem(n)==='desc';b.textContent=d?'Mais recentes primeiro ⇅':'Mais antigas primeiro ⇅';
  b.setAttribute('aria-pressed',String(!d));b.setAttribute('aria-label','Ordem por data: '+(d?'mais recentes primeiro':'mais antigas primeiro')+'. Toque para inverter.');b.title='Toque para inverter a ordem por data'}
function botao(tb){
  const n=tb.getAttribute('data-draw');const table=tb.closest('table');if(!table||table._paOrdBtn)return;
  if(colunas(table).d<0)return;
  const alvo=table.closest('.tw')||table;const pai=alvo.parentNode;if(!pai)return;
  const bar=document.createElement('div');bar.className='fbar pa-ordem';
  const b=document.createElement('button');b.type='button';b.className='pbtn';rotulo(b,n);
  b.addEventListener('click',()=>{pref[n]=ordem(n)==='desc'?'asc':'desc';salvar();rotulo(b,n);
    tb.querySelectorAll('tr').forEach(tr=>{delete tr._paIdx});ordenarIdx(tb);ordenar(tb)});
  bar.appendChild(b);
  const fd=pai.querySelector(':scope > .filtro-div');
  if(fd&&fd.nextElementSibling===alvo)fd.appendChild(b);else pai.insertBefore(bar,alvo);
  table._paOrdBtn=b;
}
/* índice original = ordem em que o desenho entregou as linhas (planilha) */
function ordenarIdx(tb){const g=[];[...tb.rows].forEach(tr=>{if(!tr.classList.contains('extra-det'))g.push(tr)});
  if(tb._paBase&&tb._paBase.length===g.length&&g.every(tr=>tb._paBase.includes(tr))){tb._paBase.forEach((tr,i)=>tr._paIdx=i);return}
  tb._paBase=g;g.forEach((tr,i)=>tr._paIdx=i)}
function passar(){
  try{linhaReds()}catch(e){}
  ORD.forEach(n=>{document.querySelectorAll("tbody[data-draw='"+n+"']").forEach(tb=>{
    if(!tb.rows.length)return;botao(tb);
    if(!tb._paBase||!tb._paBase.every(tr=>tr.parentNode===tb)){tb._paBase=null;ordenarIdx(tb)}
    ordenar(tb);
  })});
}
/* REDS — aviso único: em dia (até 1 dia), uma linha em "Hoje e alertas"; com atraso maior, só a faixa de aviso */
function linhaReds(){
  const ul=document.querySelector('#bloco-hoje .hoje-lista');if(!ul||typeof PA._textoRedsAte!=='function')return;
  let r=null;try{r=PA._textoRedsAte()}catch(e){}
  ul.querySelectorAll('li:not(.pa-reds)').forEach(x=>{const b=x.querySelector('b');if(b&&/^REDS:/.test(b.textContent.trim()))x.remove()});
  let li=ul.querySelector('li.pa-reds');
  if(r&&!r.atrasado){
    if(!li){li=document.createElement('li');li.className='pa-reds';ul.appendChild(li)}
    const tx=String(r.texto).replace(/^REDS /,'');
    if(li.textContent!=='REDS: '+tx){const b=document.createElement('b');b.textContent='REDS: ';li.replaceChildren(b,document.createTextNode(tx))}
  }else if(li)li.remove();
}
PA.ordenarPorData=passar;
let tm=null;
const mo=new MutationObserver(()=>{if(ordenando)return;clearTimeout(tm);tm=setTimeout(passar,60)});
function ligar(){mo.observe(document.body,{childList:true,subtree:true});passar()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ligar);else ligar();

/* REDS — data da última conferência (aba CONFERÊNCIA da planilha REDS do mês) */
const isoBR=x=>{const t=String(x||'').trim();let m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  m=t.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[1]+'-'+m[2]+'-'+m[3]:''};
if(window.dash&&dash.loader)dash.loader('reds_conf',{fn:({answer})=>{const v=(answer&&answer.values)||[];if(!v.length)return [];
  const h=(v[0]||[]).map(x=>String(x).trim().toUpperCase());
  const iD=h.findIndex(x=>/^DATA CONFERIDA/.test(x)),iC=h.findIndex(x=>/CONSULTA/.test(x)),iQ=h.findIndex(x=>/^QTD|QUANTIDADE/.test(x));
  if(iD<0)return [];
  return v.slice(1).map(r=>({data:isoBR(r[iD]),consulta:String(iC>=0?r[iC]||'':'').trim(),qtd:String(iQ>=0?r[iQ]||'':'').trim()})).filter(x=>x.data)}});
function confTeste(){const t=window.PA_REDS_CONF_TESTE;if(!t||!Array.isArray(t.values)||(PA.M&&PA.M.ym&&t.ym!==PA.M.ym))return [];
  const v=t.values;const h=(v[0]||[]).map(x=>String(x).trim().toUpperCase());const iD=h.findIndex(x=>/^DATA CONFERIDA/.test(x));if(iD<0)return [];
  return v.slice(1).map(r=>({data:isoBR(r[iD]),teste:true})).filter(x=>x.data)}
PA.ultimaConferenciaReds=function(){
  const d=window.dash&&dash.data?dash.data('reds_conf'):null;let L=(d&&d.status==='ok'&&Array.isArray(d.data))?d.data:[];
  /* versão de teste: enquanto o servidor não envia reds_conf (Code v4.3.8), usa a cópia da aba CONFERÊNCIA embutida no teste */
  if(!L.length)L=confTeste();
  const n=new Date(),hj=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
  const v=L.filter(x=>x.data<=hj).sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);return v.length?v[v.length-1]:null};

/* DSP — Diligência de Segurança Pública: serviço (soma na carga horária; não é afastamento) */
PA.DSP_NOME='Diligência de Segurança Pública';
const rot0=PA.codRotulo;
PA.codRotulo=function(c){const s=String(c||'');if(s.trim().toUpperCase()==='DSP')return s.trim()+' · '+PA.DSP_NOME;return typeof rot0==='function'?rot0(c):s};
PA.dspHorasDia=function(){const h=+window.PA_DSP_HORAS_DIA;return h>0?h:null};
})();
