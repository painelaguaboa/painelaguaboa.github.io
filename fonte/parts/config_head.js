/* ===== CONFIGURAÇÃO ÚNICA DA VERSÃO DE TESTE v4.3.5 =====
   1) Código Y15099 — definição oficial (DIAO) e do Matheus em 18/11/2026:
      Y15099 = "Outros tipos de ações/operações de prevenção ativa" (código residual).
      No painel ele recebe o rótulo "Atividade rural" e NUNCA conta como Patrulha Rural.
      Patrulha Rural é somente o Y15010. Para mudar o rótulo, altere só PA_ROTULO_Y15099. */
window.PA_ROTULO_Y15099='Atividade rural';
/* 2) Tabela fixa nome → Nº PM (referência principal = NOME do militar, coluna C / Equipe do formulário).
      O Nº PM digitado no CONTROLE (coluna Q, "Responsável por Preencher") não é usado para identificar o militar. */
window.PA_MIL_NPM={TRINDADE:'1633114',FONTES:'1459825',DUARTE:'1753151',JUNIO:'1811124',IAGO:'1794585',QUEIROZ:'1810431',SOUZA:'1920172',VASCONCELOS:'1930577',EDUARDA:'1925072',MACEDO:'1928209',REIS:'1928266',OLIMAR:'1927680',ADAILTON:'1502574',AMARAL:'1829365'};
window.PA_MIL_EX=['ADAILTON','AMARAL'];
/* Normaliza os textos do raw: Y15099 nunca aparece como Patrulha Rural/PR. Só altera rótulos e textos de exibição. */
window.PA_NORM_Y99=function(raw){
  if(!raw||typeof raw!=='object'||raw._normY99)return raw;
  if(raw.mil_npm&&typeof raw.mil_npm==='object')window.PA_MIL_NPM=raw.mil_npm; /* Code.gs v4.3.5 envia a mesma tabela */
  var R=window.PA_ROTULO_Y15099||'Atividade rural',RC=R+' (Y15099)',RU=R.toUpperCase();
  var txt=function(s){if(typeof s!=='string'||s.indexOf('15099')<0)return s;
    return s.replace(/Patrulha Rural \(Y15099\)/gi,RC)
      .replace(/Y15099,? que não é Patrulha Rural/gi,RC)
      .replace(/Y15099 não é Patrulha Rural/gi,RC+' – Patrulha Rural é só o Y15010')
      .replace(/Y15099 \((\d+) RAT\)/g,RC.replace(')','')+', $1 RAT)')
      .replace(/prevê Y15099(?! \()/g,'prevê '+RC)
      .replace(/previa Y15099(?! \()/g,'previa '+RC)
      .replace(/registrado como Y15099(?! \()/g,'registrado como '+RC);};
  var NAT=/^OUTROS TIPOS DE A[CÇ][OÕ]ES ?\/ ?OPERA[CÇ][OÕ]ES DE PREVEN[CÇ][AÃ]O ATIVA$/i;
  var linha=function(r){if(!Array.isArray(r))return r;var y=r.some(function(x){return String(x).trim()==='Y15099'});
    return r.map(function(x){if(typeof x!=='string')return x;if(y&&NAT.test(x.trim()))return RU;return txt(x)})};
  if(Array.isArray(raw.ops))raw.ops=raw.ops.map(function(r){if(Array.isArray(r)&&String(r[3]||'').trim()==='Y15099'&&String(r[1]||'').trim().toUpperCase()==='Y15099'){r=r.slice();r[1]=R.toUpperCase()}return r});
  ['ops','reds_reg','reds_metas','reds_div','reds_base','reds_res','reds_apr'].forEach(function(k){if(Array.isArray(raw[k]))raw[k]=raw[k].map(linha)});
  if(Array.isArray(raw.reds_cp)&&raw.reds_cp.length){var h=raw.reds_cp[0].map(function(x){return String(x).trim()});
    var iO=h.indexOf('OPERAÇÃO PREVISTA'),iC=h.indexOf('CÓDIGO PREVISTO'),iE=h.indexOf('EQUIPE/TURNO PREVISTO');
    raw.reds_cp=[raw.reds_cp[0]].concat(raw.reds_cp.slice(1).map(function(r){if(!Array.isArray(r))return r;r=r.slice();
      var cod=String(r[iC]||'').split('/').map(function(x){return x.trim()}).filter(Boolean);
      if(cod.indexOf('Y15099')>=0){
        if(cod.indexOf('Y15010')>=0){r[iC]=cod.filter(function(x){return x!=='Y15099'}).join('/')} /* previsão de PR fica só Y15010 */
        else{r[iO]=R;if(iE>=0)r[iE]=String(r[iE]||'').replace(/^PR\d?\s+/,'Turno ')}}
      return linha(r)}))}
  ['prural','comparativo','eventos'].forEach(function(k){if(raw[k]!=null){try{raw[k]=JSON.parse(JSON.stringify(raw[k]),function(_,v){return txt(v)})}catch(e){}}});
  raw._normY99=1;return raw};
/* Ajusta textos montados pelo painel (divergências): sempre "Atividade rural (Y15099)". */
window.PA_FIX_Y99=function(t){if(typeof t!=='string'||t.indexOf('Y15099')<0)return t;var R=window.PA_ROTULO_Y15099||'Atividade rural',RC=R+' (Y15099)';
  return t.replace(new RegExp('Y15099 '+R.toUpperCase(),'g'),RC).replace(new RegExp('Y15099 \\('+R+'\\)','g'),RC).replace(/registrado Y15099\b(?! \()/g,'registrado '+RC).replace(/\(Y15099\) \(Y15099\)/g,'(Y15099)')};
/* 3) Compensação noturna — Res. 4.285/2013, art. 11, § 5º: 10 min por HORA COMPLETA cumprida entre 23h e 5h.
      Conta só as horas completas dentro da faixa, por turno, com a virada da meia-noite tratada.
      ini = hora de início em horas decimais (ex.: 15.5), dur = duração em horas. Retorna {min_faixa, horas_completas, comp_min}. */
window.PA_COMP_NOT=function(ini,dur){if(ini==null||!(dur>0))return {min_faixa:0,horas_completas:0,comp_min:0};var a=ini*60,b=(ini+dur)*60,m=0;
  for(var k=-1;k<=2;k++){var s=(k*24+23)*60,e=(k*24+29)*60;m+=Math.max(0,Math.min(b,e)-Math.max(a,s))}
  m=Math.round(m);var h=Math.floor(m/60);return {min_faixa:m,horas_completas:h,comp_min:h*10}};
window.PA_PRE_TURNO=0.5; /* Pré-turno (30 min) por turno escalado */
