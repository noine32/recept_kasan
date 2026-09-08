"""Build static search data from the supplied XLSX and downloaded MHLW notices.
Read-only XLSX extraction; no third-party Python packages required.
"""
import json, re, sys, unicodedata, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).parent
S = ROOT / 'sources'
def norm(s): return re.sub(r'\s+', '', unicodedata.normalize('NFKC', s))
def clean(s):
    return '\n'.join(line.rstrip() for line in s.splitlines() if not re.fullmatch(r'\s*-\s*\d+\s*-\s*', line)).strip()

def read_xlsx(path):
    ns = {'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', ns)]
        out = []
        for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//m:sheetData/m:row', ns)[2:]:
            vals = [''] * 6
            for c in row:
                col = ord(re.match('[A-Z]+', c.get('r')).group()) - 65
                if col > 5: continue
                v, inline = c.find('m:v',ns), c.find('m:is',ns)
                val = v.text if v is not None else ''.join(inline.itertext()) if inline is not None else ''
                vals[col] = strings[int(val)] if c.get('t') == 's' else val
            out.append(dict(zip(['abbr','code','name','division','description','points'],vals)))
        return out

manifest = json.loads((S/'manifest.json').read_text())
docs, pages = [], []
for i,m in enumerate(manifest):
    file = Path(m['path']).stem
    raw = (S/(file+'.txt')).read_text()
    kind = '疑義解釈' if '疑義解釈' in m['title'] else '施設基準' if '特掲診療料' in m['title'] else '留意事項' if file == '001713883' else '点数表' if file == '001665294' else '給付調整等'
    doc = {'id':file, 'title':m['title'], 'url':m['url'], 'kind':kind, 'pages':0}
    docs.append(doc)
    # Keep full documents other than the 1000+ page facility compilation.
    # Facility selection includes pharmacy chapters 88–103 and pages mentioning pharmacy.
    active = False
    for p,txt in enumerate(raw.split('\f'),1):
        if not txt.strip(): continue
        if kind == '施設基準':
            if re.search(r'第\s*88\s+調剤基本料１',txt): active = True
            if re.search(r'第\s*104\s+看護職員',txt): active = False
            if not active and not any(k in norm(txt) for k in ['保険薬局','調剤ベースアップ','調剤基本料']): continue
        text = clean(txt)
        headings = re.findall(r'【([^】]+)】',text)
        title = f"{m['title']} ／ PDF {p}ページ"
        pages.append({'id':f'{file}-p{p}','doc':file,'page':p,'title':title,'text':text,'kind':kind,'url':m['url']+f'#page={p}'})
        doc['pages'] += 1

raw = (S/'notice.txt').read_text()
# Continuous sections preserve complete text, including page continuations.
lines = []
for p,t in enumerate(raw.split('\f'),1):
    for line in t.splitlines(): lines.append((p,line))
starts = []
parent = '通則'
for i,(p,line) in enumerate(lines):
    t=line.strip()
    if p > 66: continue
    if re.match(r'^区分[０-９]+',t): parent=t
    match = re.match(r'^(?:区分[０-９]+(?:の[０-９]+)?\s+.+|[０-９0-9]{1,2}\s+[^\s].{0,70})$',t)
    # Only standalone headings, not sentence items.
    if match and not any(x in t for x in ['。','、','こと','場合','する。']) and len(t)<85 and (p>2 or t.startswith('区分') or t=='１    受付回数等'):
        starts.append((i,p,t,parent))
if not starts or starts[0][0] != 0: starts.insert(0,(0,1,'通則','通則'))
table_start=next(i for i,(p,t) in enumerate(lines) if p==67)
starts.append((table_start,67,'別表１ 併算定の可否・別表２ 特定保険医療材料','別表'))
rules=[]
for k,(i,p,title,parent) in enumerate(starts):
    end=starts[k+1][0] if k+1<len(starts) else len(lines)
    text=clean('\n'.join(t for _,t in lines[i:end]))
    if len(text)<45: continue
    rules.append({'id':f'rule-{k+1}','title':re.sub(r'\s+',' ',title),'parent':re.sub(r'\s+',' ',parent),'text':text,'page':p,'url':f'https://www.mhlw.go.jp/content/12400000/001713883.pdf#page={p}'})

items=read_xlsx(sys.argv[1])
for i,item in enumerate(items):
    item['id']=f'item-{i+1}'
    # Identical abbreviations remain distinct by parent item and original row.
    item['originalRow']=i+3
    name=norm(item['name'].split('を算定')[0])
    def key(r):
        t=re.sub(r'^区分[0-9]+(?:の[0-9]+)?','',norm(r['title'])).lstrip('0123456789')
        return t.split('(')[0].split('（')[0]
    matches=[]
    for r in rules:
        k=key(r)
        if len(k)>3 and k in name:
            # Shared names such as 麻薬管理指導加算 have different parent fees.
            parent=re.sub(r'^区分[0-9]+(?:の[0-9]+)?','',norm(r['parent']))
            if k in ['麻薬管理指導加算','小児特定加算','乳幼児加算','在宅中心静脈栄養法加算'] and parent not in name: continue
            matches.append(r['id'])
    special=[]
    if item['abbr'].startswith(('薬A','薬B')):special=['服薬管理指導料１及び２']
    if item['abbr'] in ['時','休','深','特','夜','調時','調休','調深','調特']:special=['薬剤調製料']
    if item['abbr']=='医麻' and name.startswith('在宅患者訪問'):special=['在宅患者医療用麻薬持続注射療法加算']
    for r in rules:
        if any(key(r)==norm(s) for s in special) and r['id'] not in matches:matches.append(r['id'])
    item['rules']=matches
    item['corrections']=[]
    if item['abbr']=='薬Aロ':
        item['corrections'].append('元表の項目名は「1イ」ですが、区分説明に合わせ「1ロ」と表示しています。制御コードの全件照合は未完了です。')
        item['name']=item['name'].replace('服薬管理指導料1イ','服薬管理指導料1ロ')
    if item['abbr']=='支B':
        item['corrections'].append('42日分以下は一律34点ではなく、7日又は端数ごとに34点。43日分以上は240点です。')
        item['points']='42日分以下：7日又は端数ごと34点／43日分以上：240点'
    if item['abbr']=='剤調B':
        item['corrections'].append('令和8年6月1日〜令和9年5月31日は算定できません。1,000点の開始は令和9年6月1日。研修を修了したかかりつけ薬剤師等の条件があります。')
    if item['abbr']=='吸':
        item['corrections'].append('喘息・COPDの実技指導に加え、インフルエンザ吸入薬を薬剤師の看視下で吸入させる場合も対象。医療機関への文書等の情報提供、同意、依頼又は医師の了解等が必要です。')
    if item['abbr'].startswith('在総B'):
        item['corrections'].append('イは単に「単一建物」という意味ではありません。対象患者・施設区分を含め留意事項9(7)(8)で確認してください。')

cases=json.loads((ROOT/'cases.json').read_text())
for i,c in enumerate(cases):
    c['id']=f'case-{i+1}'
    c['url']=f"https://www.mhlw.go.jp/content/12400000/{c.get('doc','001713883')}.pdf#page={c['page']}"
out={'updated':'2026-09-08','items':items,'rules':rules,'cases':cases,'documents':docs,'pages':pages,'coverage':{'note':'令和8年度の調剤点数表・留意事項は全文を検索対象に収録。疑義解釈その1〜12とその2訂正を収録。施設基準は薬局関連ページを抽出。個別事例の全組合せ、過年度疑義解釈、全コードの照合は未完了。','originalRows':len(items)}}
(ROOT/'dist/data.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print(json.dumps({k:len(out[k]) for k in ['items','rules','cases','documents','pages']}))
