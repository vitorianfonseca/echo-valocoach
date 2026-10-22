import pathlib,json,subprocess,concurrent.futures,hashlib
root=pathlib.Path(__file__).resolve().parents[1];out=root/'public/assets';out.mkdir(exist_ok=True)
assets=json.loads((root/'design/asset-downloads.json').read_text())
def download(a):
 p=out/a['file']
 if p.exists() and p.stat().st_size:return None
 r=subprocess.run(['curl','--fail','--silent','--show-error','-L','--retry','3','--max-time','90',a['url'],'-o',str(p)],capture_output=True)
 if r.returncode or not p.exists() or not p.stat().st_size:return {'file':a['file'],'error':r.stderr.decode()[-200:]}
 return None
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
 errors=[r for r in pool.map(download,assets) if r]
(root/'design/asset-errors.json').write_text(json.dumps(errors,indent=2));print(json.dumps({'assets':len(assets),'errors':errors[:10],'failed':len(errors)}),flush=True)
