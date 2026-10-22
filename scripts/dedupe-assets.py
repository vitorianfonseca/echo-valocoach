import pathlib,hashlib,json
root=pathlib.Path(__file__).resolve().parents[1];assets=root/'public/assets';mapping={};unique={}
for p in assets.iterdir():
 if not p.is_file() or not p.stat().st_size:continue
 digest=hashlib.sha256(p.read_bytes()).hexdigest();name=digest[:24]+p.suffix;mapping[p.name]=name
 if name not in unique:unique[name]=p.read_bytes()
for p in [*(root/'src/screens').glob('*.tsx'),root/'src/assets.json']:
 s=p.read_text()
 for before,after in mapping.items():s=s.replace('./assets/'+before,'./assets/'+after)
 p.write_text(s)
for p in assets.iterdir():
 if p.is_file():p.unlink()
for name,data in unique.items():(assets/name).write_bytes(data)
(root/'design/asset-integrity.json').write_text(json.dumps([{'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for name,data in unique.items()],indent=2))
print('Unique assets:',len(unique))
