"""Run real Chromium against the production server, with all cloud settings disabled.
Requires Python >=3.11 and requirements.txt. No paid/external service is used by the app.
"""
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import unittest
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
Path('test-results').mkdir(exist_ok=True)
env = os.environ.copy()
config_files = ['.env', '.env.local', '.env.production', '.env.production.local']
if any((ROOT / name).exists() for name in config_files) or any(
        value and key.startswith(('SUPABASE_', 'NEXT_PUBLIC_SUPABASE_', 'OPENAI_'))
        for key, value in env.items()):
    raise RuntimeError('E2E requires a clean local-only checkout/build without service environment files or variables. No server was started.')
for key in tuple(env):
    if key.startswith(('SUPABASE_', 'NEXT_PUBLIC_SUPABASE_', 'OPENAI_')):
        env.pop(key)
env['NEXT_TELEMETRY_DISABLED'] = '1'
# The browser and readiness check contact loopback only, never the Internet proxy.
env['NO_PROXY'] = '127.0.0.1,localhost'
os.environ['NO_PROXY'] = env['NO_PROXY']
os.environ['SLP_E2E_URL'] = 'http://127.0.0.1:3100'
log = open('test-results/server.log', 'w')
server = subprocess.Popen(['npm', 'run', 'start', '--', '--hostname', '127.0.0.1', '--port', '3100'],
                          env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
try:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for _ in range(60):
        if server.poll() is not None:
            raise RuntimeError('Production server exited: see test-results/server.log')
        try:
            with opener.open(os.environ['SLP_E2E_URL'], timeout=1) as response:
                if response.status == 200:
                    break
        except (OSError, urllib.error.URLError):
            time.sleep(0.5)
    else:
        raise RuntimeError('Production server did not become ready')
    suite = unittest.defaultTestLoader.discover(str(ROOT / 'e2e'), pattern='*_test.py')
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
finally:
    if server.poll() is None:
        os.killpg(server.pid, signal.SIGTERM)
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(server.pid, signal.SIGKILL)
    log.close()
