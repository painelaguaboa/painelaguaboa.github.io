#!/usr/bin/env python3
"""Conferência automática do Painel Água Boa — planilhas x servidor (/exec ?api=dados) x site.

Portão de publicação (regra do Matheus, 27/11/2026): só publica se o resultado for 100% OK (código de saída 0).

Uso:
  python3 conferir_painel.py --planilhas DIR [--site URL] [--exec URL] [--atualizar] [--saida DIR]
DIR contém as exportações CSV que a rotina grava a partir das planilhas (conector Sheets, aba inteira, com cabeçalho):
  REGISTROS.csv      (REDS <MÊS> <ANO> - M0876 - ANÁLISE, aba REGISTROS)
  CONFERENCIA.csv    (mesma planilha, aba CONFERÊNCIA)
  CARTAO.csv         (mesma planilha, aba CARTÃO PROGRAMA x REDS)
  METAS.csv          (mesma planilha, aba METAS)
  D_NATUREZAS_CV.csv (mesma planilha, aba D_NATUREZAS_CV — rol taxativo de crimes violentos)
  OPERACOES.csv      (CONTROLE OPERAÇÕES POG <ANO>, aba do mês)
Sem DIR, confere só servidor x site (as linhas "planilha" ficam como NÃO CONFERIDO e o resultado não é 100%).
Saída: relatório .md e .json em --saida (padrão /workspace/painel/conferencia). Código 0 = 100% OK; 1 = divergência; 2 = erro.
Nenhum dado pessoal vai para o relatório (só nº de REDS, datas, códigos e contagens).
"""
import argparse, csv, json, os, re, sys, subprocess, urllib.request, datetime, collections, unicodedata

EXEC = 'https://script.google.com/macros/s/AKfycbzBssR5U-_pbV3mCg8w9UjuK_HhmtgQJ6svbqVzh_jQZ9hIKHwyha5ZDYb2RTQ4GdATBQ/exec'
SITE = 'https://painelaguaboa.github.io/'
BRT = datetime.timezone(datetime.timedelta(hours=-3))

def norm(s): return unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().upper().strip()
def dbr(s):
    m = re.match(r'^\s*(\d{1,2})/(\d{1,2})/(\d{4})', str(s or ''))
    return f'{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}' if m else ''
def tab(rows):
    if not rows: return []
    h = [str(x).strip() for x in rows[0]]
    return [dict(zip(h, [str(c).strip() for c in r] + [''] * (len(h) - len(r)))) for r in rows[1:] if any(str(c).strip() for c in r)]
def col(d, *pref):
    for k in d:
        if any(norm(k).startswith(norm(p)) for p in pref): return d[k]
    return ''
def lecsv(dirp, nome):
    p = os.path.join(dirp, nome)
    if not os.path.exists(p): return None
    with open(p, encoding='utf-8') as f: return tab(list(csv.reader(f)))

class Rel:
    def __init__(s): s.itens = []
    def ok(s, area, item, a, b, obs=''): s.itens.append(dict(area=area, item=item, esperado=a, obtido=b, ok=(a == b), obs=obs))
    def nc(s, area, item, obs): s.itens.append(dict(area=area, item=item, esperado='—', obtido='—', ok=None, obs=obs))

def baixar_exec(url, atualizar):
    u = url + ('?api=dados&atualizar=1' if atualizar else '?api=dados')
    with urllib.request.urlopen(u, timeout=240) as r: return json.loads(r.read().decode('utf-8'))

JS_SITE = r"""async()=>{const g=n=>{try{const d=dash.data(n);return d&&d.status==='ok'?d.data:null}catch(e){return null}};
 const cal=(g('calendario')||[]).map(r=>({data:r.data,sit:r.sit,np:r.np,nf:r.nf}));
 const reg=(g('reds_reg')||[]).map(r=>({reds:r.reds,data:r.data,mun:r.municipio,codigo:r.codigo}));
 const ops=(g('ops')||[]).map(o=>({data:o.data,verificar:!!o.verificar}));
 const metas=(g('metas')||[]).map(m=>({sigla:m.sigla,real:m.real,meta:m.meta,proj:m.proj}));
 const fx=document.getElementById('aviso-reds-ate');
 return {versao:(document.querySelector('.rodape')||{}).innerText||'',cal,reg,ops,metas,faixa:fx?{txt:fx.textContent,atrasado:fx.classList.contains('atrasado'),visivel:fx.getClientRects().length>0}:null,
   embutido:{opd:!!window.PA_OPD_TESTE,conf:!!window.PA_REDS_CONF_TESTE,npm_fixo:false}}}"""

def ler_site(url):
    from playwright.sync_api import sync_playwright
    erros = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page()
        pg.on('pageerror', lambda e: erros.append(str(e)[:200]))
        pg.goto(url, wait_until='domcontentloaded')
        pg.wait_for_function("()=>{try{const c=dash.data('calendario');return c&&c.status==='ok'}catch(e){return false}}", timeout=150000)
        pg.wait_for_timeout(4000)
        d = pg.evaluate(JS_SITE); b.close()
    d['erros_js'] = erros
    return d

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--planilhas'); ap.add_argument('--site', default=SITE); ap.add_argument('--exec', default=EXEC)
    ap.add_argument('--atualizar', action='store_true'); ap.add_argument('--saida', default='/workspace/painel/conferencia'); ap.add_argument('--sem-site', action='store_true')
    a = ap.parse_args(); R = Rel(); agora = datetime.datetime.now(BRT)
    raw = baixar_exec(a.exec, a.atualizar)
    R.ok('Servidor', 'sem _erros no /exec', 'nenhum', 'nenhum' if not raw.get('_erros') else json.dumps(raw.get('_erros'))[:200])
    reg = tab(raw.get('reds_reg') or []); cp = tab(raw.get('reds_cp') or []); conf = tab(raw.get('reds_conf') or [])
    ops = tab(raw.get('ops') or []); metas = tab(raw.get('reds_metas') or []); opd = (raw.get('opdiarias') or {}).get('dias') or []
    P = {k: (lecsv(a.planilhas, k + '.csv') if a.planilhas else None) for k in ['REGISTROS', 'CONFERENCIA', 'CARTAO', 'METAS', 'OPERACOES', 'D_NATUREZAS_CV']}
    # 1) REGISTROS planilha x servidor
    sreg = {r['Nº REDS'] for r in reg}
    if P['REGISTROS'] is None: R.nc('REDS', 'REGISTROS planilha x servidor', 'exportação REGISTROS.csv ausente')
    else:
        preg = {r['Nº REDS'] for r in P['REGISTROS']}
        R.ok('REDS', 'total de REDS (planilha x servidor)', len(preg), len(sreg))
        R.ok('REDS', 'REDS na planilha e fora do servidor', '[]', json.dumps(sorted(preg - sreg)))
        R.ok('REDS', 'REDS no servidor e fora da planilha', '[]', json.dumps(sorted(sreg - preg)))
        pd = collections.Counter(dbr(r['DATA']) for r in P['REGISTROS']); sd = collections.Counter(dbr(r['DATA']) for r in reg)
        for d in sorted(set(pd) | set(sd)): R.ok('REDS por dia', d, pd.get(d, 0), sd.get(d, 0))
    # 2) CONFERÊNCIA
    uc = max([dbr(col(r, 'DATA CONFERIDA')) for r in conf] or [''])
    if P['CONFERENCIA'] is not None:
        R.ok('Conferência', 'última data conferida (planilha x servidor)', max([dbr(col(r, 'DATA CONFERIDA')) for r in P['CONFERENCIA']] or ['']), uc)
    else: R.nc('Conferência', 'planilha x servidor', 'CONFERENCIA.csv ausente')
    ontem = (agora - datetime.timedelta(days=1)).date().isoformat()
    R.ok('Conferência', 'REDS conferido até ontem (rotina R1 das 8h)', ontem if agora.hour >= 9 else '≥ anteontem', uc if agora.hour >= 9 else ('≥ anteontem' if uc >= (agora - datetime.timedelta(days=2)).date().isoformat() else uc))
    # 3) CARTÃO PROGRAMA x REDS: cobertura até a data conferida (R2)
    cpd = collections.defaultdict(lambda: [0, 0])
    for r in cp:
        if r.get('OPERAÇÃO PREVISTA'): d = dbr(r['DATA']); cpd[d][0] += 1; cpd[d][1] += 1 if r.get('Nº REDS REGISTRADO') else 0
    for dd in opd:
        d = dd.get('data', '')
        if d and uc and d <= uc and dd.get('itens'):
            R.ok('R2 cartão programa', f'{d}: previsões do Controle de Operações Diárias lançadas na aba CARTÃO PROGRAMA x REDS', 'sim', 'sim' if cpd.get(d, [0])[0] > 0 else 'não (R2 pendente)')
    if P['CARTAO'] is not None:
        pc = collections.defaultdict(lambda: [0, 0])
        for r in P['CARTAO']:
            if r.get('OPERAÇÃO PREVISTA'): d = dbr(r['DATA']); pc[d][0] += 1; pc[d][1] += 1 if r.get('Nº REDS REGISTRADO') else 0
        for d in sorted(set(pc) | set(cpd)): R.ok('Cartão por dia (planilha x servidor)', d, '%d/%d' % (pc[d][1], pc[d][0]), '%d/%d' % (cpd[d][1], cpd[d][0]))
    # 4) Operações
    if P['OPERACOES'] is not None:
        R.ok('Operações', 'linhas da aba do mês (planilha x servidor)', len(P['OPERACOES']), len(ops))
    else: R.nc('Operações', 'planilha x servidor', 'OPERACOES.csv ausente')
    # 5) METAS
    if P['METAS'] is not None:
        pm = {r.get('SIGLA', ''): (col(r, 'META'), col(r, 'REALIZADO')) for r in P['METAS']}
        sm = {r.get('SIGLA', ''): (col(r, 'META'), col(r, 'REALIZADO')) for r in metas}
        for k in sorted(set(pm) | set(sm)):
            if k: R.ok('METAS (planilha x servidor)', k, json.dumps(pm.get(k)), json.dumps(sm.get(k)))
    # 5b) CRIMES VIOLENTOS (rol taxativo DIAO/GDO) pela dimensão D_NATUREZAS_CV — regra do Matheus de 27/11/2026
    if P['D_NATUREZAS_CV'] is None: R.nc('CV (rol taxativo)', 'dimensão D_NATUREZAS_CV', 'exportação D_NATUREZAS_CV.csv ausente')
    else:
        dim = {norm(r.get('COD_NATUREZA')): norm(r.get('E_CV')).startswith('SIM') for r in P['D_NATUREZAS_CV'] if r.get('COD_NATUREZA')}
        ROL = re.compile(r'^(HOMICIDIO|ROUBO|ESTUPRO|EXTORSAO|SEQUESTRO E CARCERE)')
        def e_cv(cod, nat):
            c = norm(cod); n = norm(nat)
            if c in dim: return dim[c]
            return bool(ROL.match(n)) and 'CULPOSO' not in n
        for r in reg:
            c = norm(r.get('CÓDIGO')); n = norm(r.get('NATUREZA'))
            if c not in dim and ROL.match(n) and 'CULPOSO' not in n:
                R.ok('CV (rol taxativo)', f"{r['Nº REDS']}: código {r.get('CÓDIGO')} ({r.get('NATUREZA')}) cadastrado na dimensão", 'sim', 'não', 'incluir o código na aba D_NATUREZAS_CV')
        cvs = sorted(r['Nº REDS'] for r in reg if norm(r.get('MUNICÍPIO')) == 'AGUA BOA' and e_cv(r.get('CÓDIGO'), r.get('NATUREZA')))
        for r in reg:
            lab = norm(r.get('CATEGORIA')) == 'CRIME VIOLENTO'; dimv = e_cv(r.get('CÓDIGO'), r.get('NATUREZA'))
            if lab != dimv:
                R.ok('CV (rol taxativo)', f"{r['Nº REDS']} {r.get('CÓDIGO')} {r.get('NATUREZA')}: CATEGORIA da aba REGISTROS", 'crime violento' if dimv else 'não CV', r.get('CATEGORIA'), 'corrigir a linha com aprovação do Matheus')
        cr = tab(raw.get('reds_crimes') or [])
        for r in cr:
            if 'A20001' in str(r.get('VISITA INDICADA (CÓDIGO)', '')).upper() and not e_cv(r.get('CÓDIGO'), r.get('NATUREZA')):
                R.ok('CV (rol taxativo)', f"{r.get('Nº REDS')} {r.get('NATUREZA')}: visita A20001 (pós-crime violento) indicada", 'só para CV do rol', 'indicada para crime fora do rol', 'decisão do Matheus: a regra local (Bizu) inclui esse crime?')
        if P['METAS'] is not None:
            lm = next((r for r in P['METAS'] if r.get('SIGLA', '').strip().upper() == 'CV_CRIMES'), None)
            if lm is None: R.ok('CV (rol taxativo)', 'linha CV_CRIMES na aba METAS', 'presente', 'ausente')
            else:
                R.ok('CV (rol taxativo)', 'CV de Água Boa: aba METAS (CV_CRIMES) x cálculo pela dimensão', str(len(cvs)), str(col(lm, 'REALIZADO')).strip())
                ref = sorted(x.strip() for x in str(col(lm, 'REDS CONSIDERADOS') or '').split(',') if x.strip())
                R.ok('CV (rol taxativo)', 'REDS CV de Água Boa: aba METAS x dimensão', json.dumps(cvs), json.dumps(ref))
    # 6) Site
    if not a.sem_site:
        try: S = ler_site(a.site)
        except Exception as e: S = None; R.ok('Site', 'abrir o site e ler os dados', 'ok', 'erro: ' + str(e)[:150])
        if S:
            R.ok('Site', 'erros de JavaScript', '[]', json.dumps(S['erros_js']))
            R.ok('Site', 'sem dado embutido (cópia de teste)', 'nenhum', 'nenhum' if not (S['embutido']['opd'] or S['embutido']['conf']) else json.dumps(S['embutido']))
            R.ok('Site', 'total de REDS lidos (servidor x site)', len(sreg), len({x['reds'] for x in S['reg']}))
            ab_srv = sum(1 for r in reg if norm(r.get('MUNICÍPIO')) == 'AGUA BOA'); ab_site = sum(1 for x in S['reg'] if norm(x['mun']) == 'AGUA BOA')
            R.ok('Site', 'REDS de Água Boa (card Registros)', ab_srv, ab_site)
            R.ok('Site', 'operações lidas (servidor x site)', len(ops), len(S['ops']))
            f = S['faixa'] or {}
            R.ok('Site', 'faixa REDS visível', True, bool(f.get('visivel')))
            if uc: R.ok('Site', 'faixa REDS mostra a data conferida', uc[8:10] + '/' + uc[5:7], (re.search(r'conferido até (\d\d/\d\d)', f.get('txt', '')) or [None, '—'])[1])
            for c in S['cal']:
                d = c['data']
                if d in cpd: R.ok('Calendário (servidor x site)', d, '%d/%d' % (cpd[d][1], cpd[d][0]), '%d/%d' % (c['nf'], c['np']))
            sm2 = {r.get('SIGLA', ''): col(r, 'REALIZADO') for r in metas}
            for m in S['metas']:
                v = sm2.get(m['sigla'])
                if v not in (None, ''): R.ok('METAS (servidor x site)', m['sigla'], str(v).replace(',', '.').rstrip('0').rstrip('.') if '.' in str(v).replace(',', '.') else str(v), str(m['real']))
    # relatório
    div = [i for i in R.itens if i['ok'] is False]; nc = [i for i in R.itens if i['ok'] is None]
    os.makedirs(a.saida, exist_ok=True); base = os.path.join(a.saida, agora.strftime('%Y-%m-%d_%H%M%S'))
    st = 'OK 100%' if not div and not nc else ('DIVERGÊNCIA' if div else 'INCOMPLETO')
    L = [f'# Conferência do painel — {agora.strftime("%d/%m/%Y %H:%M")} (horário de Brasília)', '', f'Resultado: **{st}** — {len(R.itens)} verificações, {len(div)} divergência(s), {len(nc)} não conferida(s).',
         f'Servidor: _v {raw.get("_v")}, dados de {raw.get("_atualizado")}. Site: {a.site}', '']
    if div or nc:
        L += ['| Área | Item | Esperado | Obtido | Observação |', '|---|---|---|---|---|']
        L += [f'| {i["area"]} | {i["item"]} | {i["esperado"]} | {i["obtido"]} | {i["obs"] or ("não conferido" if i["ok"] is None else "")} |' for i in div + nc]
    open(base + '.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    json.dump(dict(resultado=st, itens=R.itens), open(base + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)
    print('\n'.join(L)); print('Relatório:', base + '.md')
    sys.exit(0 if st == 'OK 100%' else 1)

if __name__ == '__main__':
    try: main()
    except SystemExit: raise
    except Exception as e: print('ERRO NA CONFERÊNCIA:', e); sys.exit(2)
