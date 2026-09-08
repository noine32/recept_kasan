"""Download the exact source snapshot listed in the manifest, then extract text."""
import json, subprocess, urllib.request
from pathlib import Path

root=Path(__file__).parent
source=root/'sources'
source.mkdir(exist_ok=True)
for record in json.loads((source/'manifest.json').read_text()):
    name=Path(record['path']).name
    target=source/name
    if not target.exists():
        target.write_bytes(urllib.request.urlopen(record['url'],timeout=90).read())
    subprocess.run(['pdftotext','-layout',str(target),str(target.with_suffix('.txt'))],check=True)
    print(name)
(source/'notice.txt').write_bytes((source/'001713883.txt').read_bytes())
