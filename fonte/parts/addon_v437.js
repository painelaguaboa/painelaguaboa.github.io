/* v4.3.7 — card Informações de Militares (credenciamento + carga nominal) */
(function(){
  const rotSit=s=>s==='fixa'?'Carga fixa':s==='intendencia'?'Na intendência':s==='recolhida'?'Recolhida':(s||'—');
  const rotGrad=g=>String(g||'').replace(/\s*PM\s*$/i,'').replace(/SGT/ig,'Sgt').replace(/\bSD\b/ig,'Sd').replace(/\bCB\b/ig,'Cb').replace(/\s+/g,' ').trim();
  function infoMil(){return (window.PA&&PA.raw&&PA.raw.info_militares)||null}
  function txt(el,s){el.replaceChildren();el.appendChild(document.createTextNode(s||''))}
  dash.draw('im-resumo',el=>{
    const d=infoMil();
    if(!d){txt(el,PA&&PA.raw&&PA.raw._v?'O servidor ainda não envia este card (é preciso o Code.gs v4.3.7).':'Carregando informações dos militares…');return}
    if(!d.ok){txt(el,d.erro||'Não foi possível montar as informações dos militares.');return}
    const r=d.resumo||{};
    const n60=r.coletes60||0, nf=r.armasFixas||0, ni=r.armasIntendencia||0;
    let s=n60+' colete'+(n60===1?'':'s')+' com validade em 60 dias; '+
      nf+' arma'+(nf===1?'':'s')+' em carga fixa; '+ni+' na intendência.';
    if(d.aviso)s+=' '+d.aviso;
    txt(el,s);
  });
  dash.draw('im-lista',el=>{
    el.replaceChildren();
    const d=infoMil();
    if(!d){el.appendChild(E('p','sub',PA&&PA.raw&&PA.raw._v?'O servidor ainda não envia este card (é preciso o Code.gs v4.3.7).':'Carregando…'));return}
    if(!d.ok){el.appendChild(E('p','sub',d.erro||'Não foi possível montar o card.'));return}
    const L=d.militares||[];
    if(!L.length){el.appendChild(E('p','sub','Nenhum militar encontrado nas fontes.'));return}
    const tb=E('table','cards im-tabela');
    tb.innerHTML='<thead><tr><th>Militar</th><th>Carteira</th><th>Publicado</th><th>Arma</th><th>Colete</th><th>Munição .40</th></tr></thead>';
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
      const cart=[];
      if(m.cat||m.cred)cart.push('CAT '+(m.cat||'—')+' / CRED '+(m.cred||'—'));
      if(m.validadeCnh)cart.push('val. '+m.validadeCnh);
      td('Carteira',cart.join(' · ')||'—');
      td('Publicado',m.publicado||'—','im-pub');
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
