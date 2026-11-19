/* v4.3.8 — Informações de Militares: card de navegação na home e tela com a tabela completa */
(function(){
  const PA=window.PA||(window.PA={});
  const E=PA.E||((t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e});
  const rotSit=s=>s==='fixa'?'Carga fixa':s==='intendencia'?'Na intendência':s==='recolhida'?'Recolhida':(s||'—');
  const rotGrad=g=>String(g||'').replace(/\s*PM\s*$/i,'').replace(/SGT/ig,'Sgt').replace(/\bSD\b/ig,'Sd').replace(/\bCB\b/ig,'Cb').replace(/\s+/g,' ').trim();
  function infoMil(){return (window.PA&&PA.raw&&PA.raw.info_militares)||null}
  function txt(el,s){el.replaceChildren();el.appendChild(document.createTextNode(s||''))}
  function resumoCurto(d){
    const L=d&&d.militares||[];
    const r=(d&&d.resumo)||{};
    const n=L.length, n60=r.coletes60||0, nf=r.armasFixas||0, ni=r.armasIntendencia||0;
    return n+' militar'+(n===1?'':'es')+' · '+n60+' colete'+(n60===1?'':'s')+' vencendo em 60 dias · '+nf+' arma'+(nf===1?'':'s')+' fixa'+(nf===1?'':'s')+' / '+ni+' na intendência';
  }
  dash.draw('m-im',el=>{
    const d=infoMil();
    if(!d||!d.ok){txt(el,'—');return}
    txt(el,resumoCurto(d));
  });
  dash.draw('im-resumo',el=>{
    const d=infoMil();
    if(!d){txt(el,PA&&PA.raw&&PA.raw._v?'O servidor ainda não envia estes dados (é preciso o Code.gs v4.3.7).':'Carregando informações dos militares…');return}
    if(!d.ok){txt(el,d.erro||'Não foi possível montar as informações dos militares.');return}
    let s=resumoCurto(d)+'.';
    if(d.aviso)s+=' '+d.aviso;
    txt(el,s);
  });
  dash.draw('im-lista',el=>{
    el.replaceChildren();
    const d=infoMil();
    if(!d){el.appendChild(E('p','sub',PA&&PA.raw&&PA.raw._v?'O servidor ainda não envia estes dados (é preciso o Code.gs v4.3.7).':'Carregando…'));return}
    if(!d.ok){el.appendChild(E('p','sub',d.erro||'Não foi possível montar a tabela.'));return}
    const L=d.militares||[];
    if(!L.length){el.appendChild(E('p','sub','Nenhum militar encontrado nas fontes.'));return}
    const tb=E('table','cards im-tabela');
    tb.innerHTML='<thead><tr><th>Militar</th><th>Carteira</th><th>Validade CNH</th><th>Publicação</th><th>Arma</th><th>Colete</th><th>Munição .40</th></tr></thead>';
    const body=E('tbody');
    L.forEach(m=>{
      const tr=E('tr');
      if(m.colete&&m.colete.alerta60)tr.classList.add('im-alerta');
      function td(label,conteudo,cls){
        const c=E('td',cls||'');
        c.setAttribute('data-label',label);
        if(conteudo&&conteudo.nodeType)c.appendChild(conteudo);
        else c.textContent=conteudo||'—';
        tr.appendChild(c);
        return c;
      }
      td('Militar',[rotGrad(m.grad),m.nome].filter(Boolean).join(' '));
      const cart=(m.cat||m.cred)?('CAT '+(m.cat||'—')+' / CRED '+(m.cred||'—')):'—';
      td('Carteira',cart);
      td('Validade CNH',m.validadeCnh||'—');
      td('Publicação',m.publicado||'—','im-pub');
      let arma='—';
      if(m.arma){
        arma=[rotSit(m.arma.situacao),m.arma.marca,m.arma.serie?('série '+m.arma.serie):'',m.arma.patrimonio?('pat. '+m.arma.patrimonio):''].filter(Boolean).join(' · ');
      }
      td('Arma',arma);
      const ctd=E('td');
      ctd.setAttribute('data-label','Colete');
      if(m.colete){
        const txtC=[[m.colete.marca,m.colete.tamanho].filter(Boolean).join(' '),m.colete.numeracao,m.colete.validade?('val. '+m.colete.validade):''].filter(Boolean).join(' · ');
        ctd.textContent=txtC||'—';
        if(m.colete.alerta60){ctd.classList.add('im-val-alerta');ctd.appendChild(E('small','im-aviso',' alerta 60 dias'))}
      }else ctd.textContent='—';
      tr.appendChild(ctd);
      td('Munição .40',m.municao40==null?'—':String(m.municao40));
      body.appendChild(tr);
    });
    tb.appendChild(body);
    const tw=E('div','tw');tw.appendChild(tb);el.appendChild(tw);
  });
})();
