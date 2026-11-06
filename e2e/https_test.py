"""Local TLS launcher integration. Temporary test certificate; no system trust or physical device."""
import json
import os
from pathlib import Path
import signal
import ssl
import subprocess
import tempfile
import time
import unittest
import urllib.request
import urllib.error

ROOT=Path(__file__).resolve().parents[1]
class LocalHttpsTests(unittest.TestCase):
    def test_private_https_launcher_certificate_and_origin_controls(self):
        command="const os=require('os');const p=Object.values(os.networkInterfaces()).flat().find(n=>n.family==='IPv4'&&!n.internal&&(/^(10\\.|192\\.168\\.)/.test(n.address)||(/^172\\./.test(n.address)&&+n.address.split('.')[1]>=16&&+n.address.split('.')[1]<=31)));if(!p)process.exit(1);console.log(p.address)"
        ip=subprocess.check_output(['node','-e',command],text=True).strip()
        with tempfile.TemporaryDirectory(prefix='slp-https-test-') as folder:
            root=Path(folder)
            for name in ['.next','node_modules','public','package.json','next.config.ts']:
                (root/name).symlink_to(ROOT/name,target_is_directory=(ROOT/name).is_dir())
            local=root/'.local-https'
            local.mkdir()
            (local/'config.json').write_text(json.dumps({'version':1,'ip':ip}))
            (local/'build.json').write_text(json.dumps({'buildId':(ROOT/'.next/BUILD_ID').read_text().strip()}))
            subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-keyout',str(local/'server-key.pem'),'-out',str(local/'server.pem'),'-days','1','-subj','/CN=SLP automated test only','-addext',f'subjectAltName=IP:{ip}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
            context=ssl.create_default_context(cafile=str(local/'server.pem'))
            opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),urllib.request.HTTPSHandler(context=context))
            env=os.environ.copy()
            for key in tuple(env):
                if key.startswith(('OPENAI_','SUPABASE_','NEXT_PUBLIC_SUPABASE_')):env.pop(key)
            env['NEXT_TELEMETRY_DISABLED']='1'
            with open(ROOT/'test-results/https-launcher.log','w') as log:
                process=subprocess.Popen(['node',str(ROOT/'scripts/local-pilot.mjs'),'start'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
                try:
                    url=f'https://{ip}:3443'
                    for _ in range(90):
                        if process.poll() is not None:self.fail('HTTPS launcher exited; see https-launcher.log')
                        try:
                            with opener.open(url,timeout=1) as response:
                                if response.status==200:break
                        except (OSError,urllib.error.URLError):time.sleep(.3)
                    else:self.fail('HTTPS launcher did not become ready')
                    with opener.open(url+'/listening',timeout=10) as response:self.assertEqual(response.status,200)
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        opener.open(urllib.request.Request(url,headers={'Origin':'https://other.invalid'}),timeout=5)
                    self.assertEqual(error.exception.code,403)
                    payload=json.dumps({'id':'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','kind':'reading','version':'sensors-v1','answers':[0,1,2,1]}).encode()
                    with opener.open(urllib.request.Request(url+'/api/practice/diagnostic',data=payload,headers={'Content-Type':'application/json','Origin':url}),timeout=10) as response:
                        self.assertEqual(json.load(response)['correct'],4)
                    plain=urllib.request.build_opener(urllib.request.ProxyHandler({}))
                    with plain.open('http://127.0.0.1:3000',timeout=5) as response:self.assertEqual(response.status,200)
                finally:
                    if process.poll() is None:
                        os.killpg(process.pid,signal.SIGTERM)
                        try:process.wait(timeout=10)
                        except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL)
