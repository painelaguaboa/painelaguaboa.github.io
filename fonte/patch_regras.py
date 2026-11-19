# Regras de divergência (pedido de 18/11, 20h01) — aplicado só na versão de teste.
def aplicar(s, rep):
    # --- grade: DP como afastamento; sem registro só após fim + 30 min (noturno: dia seguinte)
    rep("const corte=d3.max(turnos,t=>t.dia)||0;const T=d3.group(turnos,t=>t.chave+'|'+t.dia);",
        "const corte=d3.max(turnos,t=>t.dia)||0;const T=d3.group(turnos,t=>t.chave+'|'+t.dia);const FIM={'2/3':18,'3/4':26,'3/4*':25,'PR1':18,'PR2':23,'C1':15,'C2':23,'C3':31,'2':14,'3':20,'4*':26,'SOU':23};const agoraMs=Date.now();const passou=(dia,c)=>{const f=FIM[c];if(f==null)return dia<=corte;return agoraMs>=Date.UTC(PA.M.ano,PA.M.mes-1,dia,f+3,30)};")
    rep("if(hh){sit=r.dia>corte?'Previsto':(reg.length?'Cumprido':'Sem registro')}else if(reg.length){sit='Registrado fora da escala'}else if(c==='RH'){sit='Reposição'}else if(c==='Férias'){sit='Férias'}else if(c==='L'){sit='Licença'}else{sit='Folga'}",
        "if(hh){sit=reg.length?'Cumprido':(passou(r.dia,c)?'Sem registro':'Previsto')}else if(reg.length){sit='Registrado fora da escala'}else if(c==='RH'){sit='Reposição'}else if(c==='Férias'){sit='Férias'}else if(c==='L'){sit='Licença'}else if(c==='DP'){sit='Dispensa'}else{sit='Folga'}")
    # --- resumo: projeção = real + previstos (+0,5 h cada); extra = real − (escala + 0,5 h); DP no afastamento
    rep("const ex=d3.sum(cumpr,x=>x.horas_reais-x.horas_escala);const ept=cumpr.length?ex/cumpr.length:0;const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'),x=>x.horas_escala);",
        "const ex=d3.sum(cumpr,x=>x.horas_reais-(x.horas_escala+0.5));const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'),x=>x.horas_escala+0.5);")
    rep("const proj=Math.round((hr+rest*(1+Math.max(0,ept)/10))*10)/10;const hpend=d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala);const projC=Math.round((hr+(rest+hpend)*(1+Math.max(0,ept)/10))*10)/10;",
        "const proj=Math.round((hr+rest)*10)/10;const hpend=d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala);const projC=Math.round((hr+rest+d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala+0.5))*10)/10;")
    rep("const af=a.filter(x=>x.situacao==='Férias'||x.situacao==='Licença').length;",
        "const af=a.filter(x=>x.situacao==='Férias'||x.situacao==='Licença'||x.situacao==='Dispensa').length;")
    # --- div: viaturas (duas equipes só com odômetros sobrepostos; odômetro inconsistente agrupado)
    rep("const sh=d3.groups(turnos.filter(t=>/^[0-9]{5}$/.test(t.viatura)&&t.viatura!=='28305'),t=>t.viatura+'|'+t.dia);sh.forEach(([k,a])=>{const eq=d3.groups(a,t=>t.hi).map(([hi,b])=>({hi,fim:hi+b[0].horas}));for(let i=0;i<eq.length;i++)for(let j=i+1;j<eq.length;j++){const x=eq[i],y=eq[j];if(Math.max(x.hi,y.hi)<Math.min(x.fim,y.fim)-0.6){",
        "const sh=d3.groups(turnos.filter(t=>/^[0-9]{5}$/.test(t.viatura)&&t.viatura!=='28305'),t=>t.viatura+'|'+t.dia);sh.forEach(([k,a])=>{const eq=d3.groups(a,t=>t.hi).map(([hi,b])=>({hi,fim:hi+b[0].horas,oi:b[0].odo_ini,of:b[0].odo_fim}));for(let i=0;i<eq.length;i++)for(let j=i+1;j<eq.length;j++){const x=eq[i],y=eq[j];const odoOk=x.oi>0&&x.of>0&&y.oi>0&&y.of>0;const mesma=odoOk&&x.oi===y.oi&&x.of===y.of;const sobrep=odoOk&&!mesma&&Math.max(x.oi,y.oi)<Math.min(x.of,y.of);if(Math.max(x.hi,y.hi)<Math.min(x.fim,y.fim)-0.6&&sobrep){")
    rep("turnos.filter(t=>t.viatura!=='28305'&&t.odo_ini>0&&t.odo_fim>0&&(t.odo_fim<t.odo_ini||t.odo_fim-t.odo_ini>800)).forEach(t=>add(",
        "d3.groups(turnos.filter(t=>t.viatura!=='28305'&&t.odo_ini>0&&t.odo_fim>0&&(t.odo_fim<t.odo_ini||t.odo_fim-t.odo_ini>800)),t=>t.viatura+'|'+t.dia+'|'+t.inicio).map(([k,g])=>g[0]).forEach(t=>add(")
    # --- div_ops
    rep("const opR=reg.filter(r=>/^operação/i.test(r.categoria||'')&&r.municipio!=='POCOS DE CALDAS'&&r.codigo!=='Y10003');",
        "const opR=reg.filter(r=>/^operação/i.test(r.categoria||'')&&r.municipio!=='POCOS DE CALDAS'&&r.codigo!=='Y10003'&&r.codigo!=='A05000');const nomeEq=e=>{const g=[...String(e||'').matchAll(/\\(([^)]*)\\)/g)].map(x=>x[1]).filter(x=>!/^\\s*(dia|noite)\\s*$/i.test(x));return g[0]||''};")
    rep(" cp.filter(c=>c.op&&!VER.has(c.reds)&&c.status!=='Dia em andamento'&&c.data<=new Date().toISOString().slice(0,10)).forEach(c=>{const prev=String(c.cod||'').split('/').map(x=>x.trim());\n  if(prev[0]==='Y15099')add(c.data,c.reds,'Código previsto incorreto','Média','cartão/nota da escala prevê Y15099 para '+c.op+'; Patrulha Rural é Y15010','');\n  if(c.reds){const ok=(prev.includes(c.codr)&&c.codr!=='Y15099')||(c.codr==='Y15010'&&/rural/i.test(c.op));if(!ok)add(c.data,c.reds,'Código diferente do previsto','Média','previsto '+c.cod+' ('+c.op+') x registrado '+c.codr,c.militar);\n   if(c.min&&c.dur!=null&&c.dur<c.min)",
        " const VCP={p:0,f:0};\n cp.filter(c=>c.op&&!VER.has(c.reds)&&c.status!=='Dia em andamento'&&c.data<=new Date().toISOString().slice(0,10)).forEach(c=>{const prev=String(c.cod||'').split('/').map(x=>x.trim());const rural=prev.includes('Y15010')||/patrulha rural|presen[cç]a rural/i.test(c.op||'');const vcp=prev.includes('A21007');\n  if(vcp){VCP.p++;if(c.reds)VCP.f++}\n  if(c.reds){const ok=prev.includes(c.codr)||(c.codr==='Y15010'&&rural);if(!ok)add(c.data,c.reds,'Código diferente do previsto','Média','previsto '+c.cod+' ('+c.op+') x registrado '+c.codr,c.militar)}\n  if(c.reds){\n   if(c.min&&c.dur!=null&&c.dur<c.min*0.95)")
    rep("   const m=String(c.equipe||'').match(/\\(([^)]*)\\)/);if(m&&c.militar){",
        "   const m=vcp?null:(nomeEq(c.equipe)?[0,nomeEq(c.equipe)]:null);if(m&&c.militar){")
    rep("  else add(c.data,'','Previsto e não registrado','Alta',c.op+' ('+c.cod+') sem REDS no dia'+(c.equipe?' – previsto: '+c.equipe:''),(String(c.equipe||'').match(/\\(([^)]*)\\)/)||[])[1]||'')});",
        "  else if(!vcp)add(c.data,'','Previsto e não registrado','Alta',c.op+' ('+c.cod+') sem REDS no dia'+(c.equipe?' – previsto: '+c.equipe:''),nomeEq(c.equipe))});\n if(VCP.p)add(PA.M.ym+'-01','','Visitas comunitárias preventivas do cartão (mês)',VCP.f<VCP.p?'Média':'Baixa','Visita Comunitária Preventiva (A21007): '+VCP.f+' de '+VCP.p+' feitas no cartão programa do mês','');")
    # consolidar uma linha por REDS
    rep(" }catch(e){console.error('div_ops',e)}\n return out.sort(",
        " }catch(e){console.error('div_ops',e)}\n {const G=['Alta','Média','Baixa'];const por=new Map();const outras=[];out.forEach(o=>{if(!o.reds){outras.push(o);return}const x=por.get(o.reds);if(!x){por.set(o.reds,Object.assign({},o,{motivos:[o.tipo]}));return}x.motivos.push(o.tipo);x.det+=' | '+o.det;if(G.indexOf(o.grav)<G.indexOf(x.grav))x.grav=o.grav;if(!x.militar&&o.militar)x.militar=o.militar});const cons=[...por.values()].map(x=>Object.assign(x,{tipo:x.motivos.length>1?x.motivos.join('; '):x.tipo}));out.length=0;cons.concat(outras).forEach((o,i)=>{o.id=i;if(window.PA_FIX_Y99){o.det=window.PA_FIX_Y99(o.det);o.tipo=window.PA_FIX_Y99(o.tipo)}out.push(o)})}\n return out.sort(")
    rep("const k=KEY(p);const id=k+'|'+(+m[1])+'|'+hi;if(seen.has(id))return;seen.add(id);out.push({id,linha:r.i,chave:k,nome:p,",
        "const k=KEY(p);const id=k+'|'+(+m[1])+'|'+hi;if(seen.has(id))return;seen.add(id);out.push({id,linha:r.i,chave:k,npm:(window.PA_MIL_NPM||{})[k]||'',nome:p,")
    rep("return {id:k+'-'+r.dia,militar:r.militar,matricula:r.matricula,chave:k,",
        "return {id:k+'-'+r.dia,militar:r.militar,matricula:r.matricula||(window.PA_MIL_NPM||{})[k]||'',npm:(window.PA_MIL_NPM||{})[k]||'',chave:k,")
    # --- pré-turno (30 min por turno ESCALADO) e compensação noturna 23h–5h (Res. 4.285/2013, art. 11, § 5º), separados e sem dupla contagem
    rep("horario:HOR[c]||'',horas_escala:hh,horas_reais:reg.length?Math.round(hr*10)/10:null,",
        "horario:HOR[c]||'',...(()=>{const PT=window.PA_PRE_TURNO||0.5;const CN=window.PA_COMP_NOT;const ini=parseInt(HOR[c]||'0',10);const dIni=(()=>{if(!hh||!reg.length)return 0;let d=ini-d3.min(reg,x=>x.hi);if(d>12)d-=24;if(d<-12)d+=24;return Math.max(0,Math.min(PT,Math.round(d*100)/100))})();const incl=dIni;const cred=hh&&reg.length?Math.round((PT-dIni)*100)/100:0;const cm=d3.sum(reg,x=>CN(x.hi,x.horas).comp_min);const fe=String(HOR[c]||'').split('–');const durE=fe.length===2?((parseInt(fe[1],10)-ini+24)%24||24):0;const cmPrev=hh?CN(ini,durE).comp_min:0;return {horas_turno:hh,pre_turno:hh?PT:0,pre_incluido:incl?PT:0,pre_creditado:cred,comp_min:cm,comp_prev_min:cmPrev,horas_escala:hh?hh+PT:0,horas_registradas:reg.length?Math.round(hr*100)/100:null,horas_reais:reg.length?Math.round((hr+cred+cm/60)*100)/100:null}})(),")
    rep("const ex=d3.sum(cumpr,x=>x.horas_reais-(x.horas_escala+0.5));const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'),x=>x.horas_escala+0.5);",
        "const ex=d3.sum(cumpr,x=>x.horas_reais-x.horas_escala);const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'),x=>x.horas_escala+x.comp_prev_min/60);")
    rep("const projC=Math.round((hr+rest+d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala+0.5))*10)/10;",
        "const projC=Math.round((hr+rest+d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala+x.comp_prev_min/60))*10)/10;")
    rep("const fe=d3.sum(fora_escala.filter(f=>f.chave&&f.chave===a[0].chave),f=>f.horas);",
        "const feL=fora_escala.filter(f=>f.chave&&f.chave===a[0].chave);const fe=d3.sum(feL,f=>f.horas+(f.comp_min||0)/60);")
    rep("horas_escala:d3.sum(te,x=>x.horas_escala),rh:",
        "horas_escala:d3.sum(te,x=>x.horas_escala),horas_turno:d3.sum(te,x=>x.horas_turno),pre_previsto:d3.sum(te,x=>x.pre_turno),horas_lancadas:Math.round((d3.sum(cumpr.concat(fora),x=>x.horas_registradas||0)+d3.sum(feL,f=>f.horas))*10)/10,pre_turnos:cumpr.length,pre_incluido:d3.sum(cumpr,x=>x.pre_incluido),pre_creditado:d3.sum(cumpr,x=>x.pre_creditado),comp_min:d3.sum(cumpr.concat(fora),x=>x.comp_min||0)+d3.sum(feL,f=>f.comp_min||0),rh:")
    # atividades fora da escala: compensação noturna também
    rep("fim:String(x.termino||'').slice(0,5),horas:Math.round(du*100)/100}))});",
        "fim:String(x.termino||'').slice(0,5),horas:Math.round(du*100)/100,comp_min:(window.PA_COMP_NOT?window.PA_COMP_NOT(hi,du).comp_min:0)}))});")
    # tabela "Resumo por militar": colunas separadas
    rep("<th class='n'>Horas da escala</th>", "<th class='n'>Previsto da escala (com pré-turno)</th>")
    rep("<th class='n'>Registradas</th>", "<th class='n'>Horas lançadas</th><th class='n'>Pré-turno (30 min)</th><th class='n'>Compensação noturna 23h–5h (min)</th><th class='n'>Compensação noturna 23h–5h (h)</th><th class='n'>Total</th>")
    rep("{k:'horas_escala',n:1},{k:'rh',n:1}", "{k:'horas_escala',n:1,f:r=>PA.fmtN(r.horas_escala,1)},{k:'rh',n:1}")
    rep("{k:'horas_reais',n:1,f:r=>PA.fmtN(r.horas_reais,1)},{k:'extra'",
        "{k:'horas_lancadas',n:1,f:r=>PA.fmtN(r.horas_lancadas,1)},{k:'pre_creditado',n:1,f:r=>r.pre_turnos?PA.preTxt(r.militar).curto:'—'},{k:'comp_min',n:1,f:r=>r.comp_min?'+'+r.comp_min+' min ('+(r.comp_min/10)+(r.comp_min===10?' hora cheia':' horas cheias')+')':'0'},{k:'comp_h',n:1,f:r=>r.comp_min?'+'+PA.fmtN(r.comp_min/60,1)+' h':'0'},{k:'horas_reais',n:1,f:r=>PA.fmtN(r.horas_reais,1)},{k:'extra'")
    rep("Além da escala é a diferença entre as horas registradas e as horas dos mesmos turnos na escala.",
        "Total = horas lançadas + Pré-turno (30 min) ainda não incluído no lançamento + Compensação noturna 23h–5h (Res. 4.285/2013, art. 11, § 5º: 10 min por hora completa cumprida entre 23h e 5h). Previsto da escala = horas do turno + 30 min de pré-turno por turno escalado (não há pré-turno em folga, férias, licença, DP ou RH). Além da escala = total − previsto dos mesmos turnos. A projeção soma aos turnos futuros o pré-turno e a compensação noturna prevista pelo horário da escala.")
    rep("['meu','grade','t-resumo','t-fora-res','t-fora','t-conf','t-kmt','t-kmmil'].forEach(n=>dash.draw(n))}", "['meu','ext-sel','ext-horas','grade','t-resumo','t-fora-res','t-fora','t-conf','t-kmt','t-kmmil'].forEach(n=>dash.draw(n))}")

    # --- CPR (18/11, Matheus): escala extraordinária, 8 h/dia, sem pré-turno; não duplicar se lançado
    rep("const H={'2/3':10,'3/4':10,'3/4*':10,'PR1':10,'PR2':10,'C1':8,'C2':8,'C3':8,'2':6,'3':6,'4*':6,'SOU':10};",
        "const H={'2/3':10,'3/4':10,'3/4*':10,'PR1':10,'PR2':10,'C1':8,'C2':8,'C3':8,'2':6,'3':6,'4*':6,'SOU':10,'CPR':8};")
    rep("const HPAD={'2/3':10,'3/4':10,'3/4*':10,'PR1':10,'PR2':10,'C1':8,'C2':8,'C3':8,'2':6,'3':6,'4*':6,'SOU':10};",
        "const HPAD={'2/3':10,'3/4':10,'3/4*':10,'PR1':10,'PR2':10,'C1':8,'C2':8,'C3':8,'2':6,'3':6,'4*':6,'SOU':10,'CPR':8};")
    rep("if(!k||k==='F')return {k,h:0,cat:'folga'};if(k==='Férias'||k==='L')return {k,h:0,cat:'afast'};if(k==='RH')return {k,h:0,cat:'rh'};",
        "if(!k||k==='F')return {k,h:0,cat:'folga'};if(k==='Férias'||k==='L')return {k,h:0,cat:'afast'};if(k==='RH')return {k,h:0,cat:'rh'};if(k==='CPR')return {k,h:8,cat:'outro'};")
    rep("Horários: 2/3 e PR1 08–18 · 3/4* 15–01 · 3/4 16–02 · PR2 13–23 · C1 07–15 · C2 15–23 · C3 23–07 · 2 08–14 · 3 14–20 · 4* 20–02 · F folga.",
        "Horários: 2/3 e PR1 08–18 · 3/4* 15–01 · 3/4 16–02 · PR2 13–23 · C1 07–15 · C2 15–23 · C3 23–07 · 2 08–14 · 3 14–20 · 4* 20–02 · F folga · CPR 8 h (escala extraordinária, sem horário fixo e sem pré-turno).")
    rep("const PT=window.PA_PRE_TURNO||0.5;",
        "const PT=(c==='CPR')?0:(window.PA_PRE_TURNO||0.5);")
    rep("const ex=d3.sum(cumpr,x=>x.horas_reais-x.horas_escala);const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'),x=>x.horas_escala+x.comp_prev_min/60);\n  const proj=Math.round((hr+rest)*10)/10;const hpend=d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala);const projC=Math.round((hr+rest+d3.sum(pass.filter(x=>x.situacao==='Sem registro'),x=>x.horas_escala+x.comp_prev_min/60))*10)/10;",
        "const diasCprFe=new Set(feL.filter(f=>f.dia!=null).map(f=>+f.dia));const cprCoberto=x=>String(x.codigo||'').toUpperCase()==='CPR'&&diasCprFe.has(+x.dia);const ex=d3.sum(cumpr,x=>x.horas_reais-x.horas_escala);const rest=d3.sum(te.filter(x=>x.situacao==='Previsto'&&!cprCoberto(x)),x=>x.horas_escala+x.comp_prev_min/60);\n  const proj=Math.round((hr+rest)*10)/10;const hpend=d3.sum(pass.filter(x=>x.situacao==='Sem registro'&&!cprCoberto(x)),x=>x.horas_escala);const projC=Math.round((hr+rest+d3.sum(pass.filter(x=>x.situacao==='Sem registro'&&!cprCoberto(x)),x=>x.horas_escala+x.comp_prev_min/60))*10)/10;")
    rep("Previsto da escala = horas do turno + 30 min de pré-turno por turno escalado (não há pré-turno em folga, férias, licença, DP ou RH). Além da escala = total − previsto dos mesmos turnos. A projeção soma aos turnos futuros o pré-turno e a compensação noturna prevista pelo horário da escala.",
        "Previsto da escala = horas do turno + 30 min de pré-turno por turno escalado (não há pré-turno em folga, férias, licença, DP, RH ou CPR). CPR é escala extraordinária e soma 8 h por dia, sem pré-turno; entra no previsto, na projeção e no limite. Se o dia de CPR for lançado no CONTROLE, valem as horas lançadas e o previsto de 8 h não é somado de novo. Além da escala = total − previsto dos mesmos turnos. A projeção soma aos turnos futuros o pré-turno e a compensação noturna prevista pelo horário da escala.")

    # --- CPR: legenda "Curso de Patrulha Rural" e observação no card (18/11, Matheus)
    rep("CPR 8 h (escala extraordinária, sem horário fixo e sem pré-turno).",
        "CPR 8 h — Curso de Patrulha Rural (escala extraordinária, sem horário fixo e sem pré-turno).")
    rep("CPR é escala extraordinária e soma 8 h por dia, sem pré-turno; entra no previsto, na projeção e no limite.",
        "CPR (Curso de Patrulha Rural) é escala extraordinária e soma 8 h por dia, sem pré-turno; entra no previsto, na projeção e no limite (situação excepcional).")
    return s
