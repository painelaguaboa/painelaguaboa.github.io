/* ===== v4.3.9: Crimes agrupados pelo Código Penal e leis especiais =====
   Tabela de mapeamento documentada em CRIMES_GRUPOS.md.
   Fonte: código/natureza DIAO e categoria da aba CRIMES E VISITAS TRANQUILIZADORAS.
   Violência Doméstica (Lei Maria da Penha) é marcador e tem prioridade sobre o título do CP.
   O card do BO não exibe nomes de envolvidos, CPF, telefone nem endereço completo. */
(function(){
const E=PA.E||function(t,c,tx){const n=document.createElement(t);if(c)n.className=c;if(tx!=null&&tx!=='')n.textContent=tx;return n};
PA.E=E;

PA.CRIMES_GRUPOS=[
  {id:'pessoa',   titulo:'Contra a Pessoa',             sub:'Vida, lesão, ameaça e liberdade (Título I do Código Penal).'},
  {id:'patrimonio',titulo:'Contra o Patrimônio',        sub:'Furto, roubo, dano, estelionato e receptação (Título II do CP).'},
  {id:'sexual',   titulo:'Contra a Dignidade Sexual',   sub:'Título VI do Código Penal.'},
  {id:'admin',    titulo:'Contra a Administração Pública',sub:'Desobediência, desacato, resistência e administração da justiça.'},
  {id:'domestica',titulo:'Violência Doméstica',         sub:'Lei Maria da Penha — marcador, quando o fato se enquadra.'},
  {id:'drogas',   titulo:'Drogas',                      sub:'Lei 11.343/2006.'},
  {id:'armas',    titulo:'Armas',                       sub:'Estatuto do Desarmamento (Lei 10.826/2003).'},
  {id:'transito', titulo:'Trânsito',                    sub:'Código de Trânsito Brasileiro.'},
  {id:'outros',   titulo:'Outros',                      sub:'Demais naturezas, inclusive fé pública, ambiental e atendimentos.'}
];

const RX={
  domestica: /viol[eê]ncia\s*dom[eé]stica|maria\s*da\s*penha|lei\s*11\.?340/i,
  sexual: /estupro|atentado\s*violento|importuna[cç][aã]o\s*sexual|ass[eé]dio\s*sexual|explora[cç][aã]o\s*sexual|pornografia|favorecimento\s*da\s*prostitui[cç][aã]o|casa\s*de\s*prostitui[cç][aã]o|ato\s*obsceno|satisfa[cç][aã]o\s*sexual|vulne?r[aá]vel/i,
  drogas: /tr[aá]fico|entorpecente|droga|lei\s*11\.?343|poss?e\s*.*entorpec/i,
  armas: /arma\s*de\s*fogo|estatuto\s*do\s*desarmamento|lei\s*10\.?826|muni[cç][aã]o|acess[oó]rio\s*de\s*arma|disparo\s*de\s*arma/i,
  transito: /tr[aâ]nsito|sinistro\s*de\s*tr[aâ]nsito|\bctb\b|dire[cç][aã]o\s*perigosa|artigo\s*269/i,
  admin: /desobedi[eê]ncia|desacato|resist[eê]ncia|comunica[cç][aã]o\s*falsa|corrup[cç][aã]o|peculato|concuss[aã]o|prevarica[cç][aã]o|advocacia\s*administrativa|condescend[eê]ncia/i,
  pessoa: /homic[ií]dio|les[aã]o\s*corporal|amea[cç]a|seq[uü]estro|c[aá]rcere\s*privado|rixa|persegui[cç][aã]o|constrangimento\s*ilegal|invas[aã]o\s*de\s*domic[ií]lio|inviolabilidade/i,
  patrimonio: /furto|roubo|extors[aã]o|dano|estelionato|recepta[cç][aã]o|apropria[cç][aã]o\s*ind[eé]bita|altera[cç][aã]o\s*de\s*limites|latroc[ií]nio|saque|duplicata/i
};

function normCod(c){return String(c||'').trim().toUpperCase().replace(/\s+/g,'')}
function letra(cod){const m=normCod(cod).match(/^([A-Z])/);return m?m[1]:''}
function numCod(cod){const m=normCod(cod).match(/^[A-Z](\d+)/);return m?+m[1]:0}

/* Classifica um fato. Ordem: marcador Maria da Penha, depois leis especiais e títulos do CP. */
PA.classificaCrime=function(cod,nat,cat,vd){
  const c=normCod(cod), n=String(nat||''), k=String(cat||''), ck=(n+' '+k+' '+c);
  const vdFlag=vd===true||/^s(im)?$/i.test(String(vd||''))||RX.domestica.test(ck)||c==='U33004';
  if(vdFlag) return 'domestica';
  if(RX.sexual.test(ck)||(letra(c)==='B'&&numCod(c)>=1310&&numCod(c)<=1499)) return 'sexual';
  if(RX.drogas.test(ck)||c.indexOf('I04')===0||c==='U33010') return 'drogas';
  if(RX.armas.test(ck)||c.indexOf('E03')===0||k.toLowerCase()==='armas') return 'armas';
  if(RX.transito.test(ck)||letra(c)==='T'||c.indexOf('E0803')===0) return 'transito';
  if(RX.admin.test(ck)||(letra(c)==='G'&&numCod(c)>=1330&&numCod(c)<=1360)) return 'admin';
  if(RX.pessoa.test(ck)||letra(c)==='B') return 'pessoa';
  if(RX.patrimonio.test(ck)||letra(c)==='C'||/patrim[oô]nio/i.test(k)) return 'patrimonio';
  return 'outros';
};

PA.sanitizaTextoPublico=function(s){
  let t=String(s||'');
  t=t.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,'[CPF]');
  t=t.replace(/\b\d{2}\.?\d{3}\.?\d{3}-?\d\b/g,'[RG]');
  t=t.replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}\b/g,'[telefone]');
  t=t.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig,'[e-mail]');
  t=t.replace(/\b(rua|r\.|av\.|avenida|travessa|alameda|praça|praca|rodovia|estrada)\b[^,;.]{0,80}\d{1,5}\b/ig,'[endereço]');
  t=t.replace(/\s{2,}/g,' ').trim();
  return t;
};

function pick(o, names){
  if(!o) return '';
  for(const n of names){
    if(o[n]!=null&&String(o[n]).trim()!=='') return String(o[n]).trim();
  }
  const keys=Object.keys(o);
  for(const n of names){
    const hit=keys.find(k=>k.trim().toUpperCase()===n.trim().toUpperCase());
    if(hit&&String(o[hit]).trim()!=='') return String(o[hit]).trim();
  }
  return '';
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
  return m?m[3]+'/'+m[2]:s||'—';
}
function simNao(v){
  const t=String(v||'').trim().toUpperCase();
  if(t==='S'||t==='SIM') return 'Sim';
  if(t==='N'||t==='NÃO'||t==='NAO') return 'Não';
  return t||'—';
}

function tabela(name){
  const d=dash.data(name);
  return (d&&d.status==='ok'&&Array.isArray(d.data))?d.data:[];
}
function rowsFromRaw(arr){
  if(!Array.isArray(arr)||arr.length<2) return [];
  const h=(arr[0]||[]).map(x=>String(x||'').trim());
  return arr.slice(1).filter(r=>r&&r.some(c=>String(c||'').trim())).map(r=>{
    const o={};
    h.forEach((k,i)=>{if(k)o[k]=r[i]});
    return o;
  });
}

PA.listaCrimesMes=function(){
  const cr=tabela('reds_crimes');
  const apr=tabela('reds_apr');
  const base=tabela('reds_base');
  const boRaw=rowsFromRaw((PA.raw&&PA.raw.reds_bo)||[]);
  const boBy={};
  boRaw.forEach(r=>{const k=pick(r,['Nº REDS','N. REDS','REDS']);if(k)boBy[k]=r});
  const aprBy={};
  apr.forEach(r=>{const k=pick(r,['Nº REDS']);if(!k)return;(aprBy[k]=aprBy[k]||[]).push(r)});
  const fracBy={};
  base.forEach(r=>{
    const k=pick(r,['Nº REDS']);if(!k)return;
    const f=pick(r,['FRAÇÃO','FRACAO']);
    if(f&&!fracBy[k])fracBy[k]=f;
  });
  const munOk=window.METAS&&METAS.municipio?String(METAS.municipio).toUpperCase():'AGUA BOA';
  const normMun=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  return cr.map(c=>{
    const reds=pick(c,['Nº REDS']);
    const extra=boBy[reds]||{};
    const cod=pick(c,['CÓDIGO','CODIGO'])||pick(extra,['CÓDIGO','CODIGO']);
    const nat=pick(c,['NATUREZA'])||pick(extra,['NATUREZA']);
    const cat=pick(c,['CATEGORIA'])||pick(extra,['CATEGORIA']);
    const vd=pick(extra,['VIOLÊNCIA DOMÉSTICA (S/N)','VIOLENCIA DOMESTICA (S/N)'])||(/maria\s*da\s*penha|viol[eê]ncia\s*dom/i.test(cat)?'S':'');
    const mun=pick(c,['MUNICÍPIO','MUNICIPIO']);
    const itens=(aprBy[reds]||[]).map(a=>{
      const tipo=pick(a,['TIPO DE ITEM']);
      const qtd=pick(a,['QUANTIDADE']);
      const un=pick(a,['UNIDADE']);
      const droga=pick(a,['PESO/QTD DE DROGA']);
      return [tipo, qtd?(qtd+(un?' '+un:'')):'', droga?('peso '+droga):''].filter(Boolean).join(' · ');
    }).filter(Boolean);
    const situ=pick(c,['TENTADO/CONSUMADO']);
    const bairro=pick(c,['BAIRRO/COMUNIDADE']);
    const qv=pick(c,['QTD VÍTIMAS','QTD VITIMAS']);
    const qa=pick(c,['QTD AUTORES']);
    const prisao=pick(c,['PRISÃO (S/N)','PRISAO (S/N)'])||pick(extra,['PRISÃO/APREENSÃO (S/N)']);
    const tipoPrisao=pick(extra,['TIPO DE PRISÃO','TIPO DE PRISAO']);
    const mat=itens.length?itens.join('; '):pick(extra,['MATERIAIS APREENDIDOS']);
    const veic=pick(extra,['VEÍCULO REMOVIDO/MEDIDA CTB','VEICULO REMOVIDO/MEDIDA CTB']);
    const vtr=pick(extra,['VIATURA(S)','VIATURA']);
    const frac=pick(extra,['FRAÇÃO DO RESPONSÁVEL','FRACAO DO RESPONSAVEL'])||fracBy[reds]||'';
    const hora=pick(c,['HORA'])||pick(extra,['INÍCIO','INICIO']);
    const data=isoData(pick(c,['DATA']));
    const grupo=PA.classificaCrime(cod,nat,cat,vd);
    const partes=[];
    if(nat) partes.push(nat+(cod?' ('+cod+')':''));
    if(situ) partes.push(situ.toLowerCase());
    if(bairro) partes.push('em '+bairro);
    if(qv||qa) partes.push((qv||'0')+' vítima(s), '+(qa||'0')+' autor(es)');
    if(prisao&&/^s/i.test(prisao)) partes.push(tipoPrisao?('prisão: '+tipoPrisao):'com prisão');
    if(mat) partes.push('apreensão: '+PA.sanitizaTextoPublico(mat));
    const resumo=partes.join('. ')+(partes.length?'.':'');
    return {
      reds, data, hora, cod, nat, cat, situacao:situ, bairro, municipio:mun,
      fora: mun && normMun(mun)!==normMun(munOk) && !/AGUA BOA/.test(normMun(mun)),
      qtdVitimas:qv, qtdAutores:qa, prisao, tipoPrisao,
      apreensoes:PA.sanitizaTextoPublico(mat||''), veiculo:PA.sanitizaTextoPublico(veic||''),
      viatura:vtr, fracao:frac, grupo, vd:/^s/i.test(vd)||grupo==='domestica',
      tipoLocal:'', instrumento:'',
      resumo
    };
  }).filter(c=>c.reds);
};

function grupoPorId(id){return PA.CRIMES_GRUPOS.find(g=>g.id===id)}

function redesenhaCrimes(){
  document.querySelectorAll("[data-draw='cr-grupo-lista'],[data-draw='cr-bo']").forEach(el=>{el.hidden=false});
  ['cr-grupos','cr-grupo-lista','cr-bo'].forEach(n=>{try{dash.draw(n)}catch(e){}});
  const alvo=document.querySelector(PA.selCrimeReds?"[data-draw='cr-bo']":PA.selCrimeGrupo?"[data-draw='cr-grupo-lista']":'#cr-grupos-card');
  if(alvo) try{alvo.scrollIntoView({block:'start',behavior:'auto'})}catch(e){}
}

dash.draw('cr-grupos',el=>{
  el.replaceChildren();
  const L=PA.listaCrimesMes().filter(c=>!c.fora);
  const por={};
  L.forEach(c=>{por[c.grupo]=(por[c.grupo]||0)+1});
  const grid=E('div','cr-g-grid');
  PA.CRIMES_GRUPOS.forEach(g=>{
    const n=por[g.id]||0;
    const b=E('button','cr-grupo'+(n?'':' cr-grupo-vazio')+(PA.selCrimeGrupo===g.id?' cr-grupo-on':''));
    b.type='button';
    b.setAttribute('aria-pressed', PA.selCrimeGrupo===g.id?'true':'false');
    b.appendChild(E('span','cr-g-tit',g.titulo));
    b.appendChild(E('span','cr-g-sub',g.sub));
    const nv=E('span','cr-g-n');
    const strong=E('b',null,String(n));
    nv.appendChild(strong);
    nv.appendChild(document.createTextNode(n===1?' crime no mês':' crimes no mês'));
    b.appendChild(nv);
    b.addEventListener('click',()=>{
      PA.selCrimeGrupo=PA.selCrimeGrupo===g.id?null:g.id;
      PA.selCrimeReds=null;
      redesenhaCrimes();
    });
    grid.appendChild(b);
  });
  el.appendChild(grid);
  const fora=PA.listaCrimesMes().filter(c=>c.fora).length;
  if(fora){
    el.appendChild(E('p','sub',fora+' crime(s) registrado(s) pelo destacamento fora de Água Boa não entram nestes totais.'));
  }
});

dash.draw('cr-grupo-lista',el=>{
  el.replaceChildren();
  const gid=PA.selCrimeGrupo;
  if(!gid){el.hidden=true;return}
  el.hidden=false;
  const g=grupoPorId(gid);
  const itens=PA.listaCrimesMes().filter(c=>!c.fora&&c.grupo===gid).sort((a,b)=>(b.data||'').localeCompare(a.data||'')||String(b.reds).localeCompare(String(a.reds)));
  const cab=E('div','cr-lista-cab');
  const tit=E('h3',null,g?g.titulo:'Grupo');
  const vol=E('button','pbtn','Voltar aos grupos');
  vol.type='button';
  vol.addEventListener('click',()=>{PA.selCrimeGrupo=null;PA.selCrimeReds=null;redesenhaCrimes()});
  cab.appendChild(tit);
  cab.appendChild(vol);
  el.appendChild(cab);
  el.appendChild(E('p','sub',g?g.sub:''));
  if(!itens.length){el.appendChild(E('p','sub','Nenhum crime deste grupo no mês em Água Boa.'));return}
  const ul=E('ul','cr-bo-lst');
  itens.forEach(c=>{
    const li=E('li');
    const b=E('button','cr-bo-item'+(PA.selCrimeReds===c.reds?' cr-bo-on':''));
    b.type='button';
    b.appendChild(E('span','cr-bo-n',c.reds));
    b.appendChild(E('span','cr-bo-m',dm(c.data)+(c.hora?' · '+c.hora:'')));
    b.appendChild(E('span','cr-bo-t',(c.nat||'Natureza não informada')+(c.cod?' ('+c.cod+')':'')));
    b.appendChild(E('span','cr-bo-b',c.bairro||'Bairro não informado'));
    b.addEventListener('click',()=>{PA.selCrimeReds=c.reds;redesenhaCrimes()});
    li.appendChild(b);
    ul.appendChild(li);
  });
  el.appendChild(ul);
});

dash.draw('cr-bo',el=>{
  el.replaceChildren();
  const id=PA.selCrimeReds;
  if(!id){el.hidden=true;return}
  el.hidden=false;
  const c=PA.listaCrimesMes().find(x=>x.reds===id);
  const vol=E('button','pbtn','Voltar à lista');
  vol.type='button';
  vol.addEventListener('click',()=>{PA.selCrimeReds=null;redesenhaCrimes()});
  const cab=E('div','cr-lista-cab');
  cab.appendChild(E('h3',null,'BO para análise'));
  cab.appendChild(vol);
  el.appendChild(cab);
  if(!c){el.appendChild(E('p','sub','Não encontrei este BO nos crimes do mês.'));return}
  const g=grupoPorId(c.grupo);
  const dl=E('dl','cr-bo-dl');
  function lin(rot,val,cls){
    const v=val&&String(val).trim();
    if(!v||v==='—'){
      /* ainda mostra campos pedidos, com travessão */
    }
    const dt=E('dt',null,rot);
    const dd=E('dd',cls||'',v||'—');
    dl.appendChild(dt);dl.appendChild(dd);
  }
  lin('Nº REDS',c.reds);
  lin('Data e hora do fato',dm(c.data)+(c.hora?' · '+c.hora:''));
  lin('Natureza',(c.nat||'—')+(c.cod?' ('+c.cod+')':''));
  lin('Grupo',g?g.titulo:c.grupo);
  if(c.vd) lin('Marcador','Lei Maria da Penha (violência doméstica)');
  lin('Bairro ou comunidade',c.bairro||'—');
  lin('Tipo de local',c.tipoLocal||'—');
  lin('Meio ou instrumento',c.instrumento||'—');
  lin('Situação',c.situacao||'—');
  lin('Envolvidos',(c.qtdAutores||'0')+' autor(es) · '+(c.qtdVitimas||'0')+' vítima(s)');
  lin('Prisão',simNao(c.prisao)+(c.tipoPrisao&&/^s/i.test(c.prisao)?' · '+c.tipoPrisao:''));
  lin('Apreensões',c.apreensoes||(c.veiculo?('veículo/medida: '+c.veiculo):'—'));
  const guar=[c.fracao,c.viatura?('viatura '+c.viatura):''].filter(Boolean).join(' · ');
  lin('Viatura / guarnição',guar||'—');
  lin('Resumo',c.resumo||'—','cr-bo-resumo');
  el.appendChild(dl);
  el.appendChild(E('p','sub','O resumo é montado só com campos estruturados do REDS. Não são exibidos nomes de envolvidos, CPF, telefone nem endereço completo. Tipo de local e instrumento ainda não existem na planilha de análise.'));
});
})();
