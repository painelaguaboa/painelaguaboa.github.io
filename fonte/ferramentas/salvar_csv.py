#!/usr/bin/env python3
"""Converte o resultado do read_range (conector Google Sheets, gravado com write_to_file) em CSVs para a conferência.
Uso: python3 salvar_csv.py ARQUIVO_RESULTADO DIR NOME1 [NOME2 ...]   (um nome por intervalo, na ordem lida)
Ex.: salvar_csv.py resultado.txt /workspace/painel/conferencia/planilhas CARTAO CONFERENCIA METAS REGISTROS"""
import json, sys, os
t = open(sys.argv[1], encoding='utf-8').read(); i = t.find('{"spreadsheetId'); d = json.loads(t[i:t.rfind('}') + 1], strict=False)
os.makedirs(sys.argv[2], exist_ok=True)
for nome, r in zip(sys.argv[3:], d['ranges']):
    open(os.path.join(sys.argv[2], nome + '.csv'), 'w', encoding='utf-8').write(r['content'] + '\n'); print(nome, r['range'], r['content'].count('\n'))
