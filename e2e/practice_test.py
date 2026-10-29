"""Browser QA with synthetic text and a fake microphone. NOT physical PC/iPhone QA."""
import os
from pathlib import Path
import re
import unittest
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('SLP_E2E_URL', 'http://127.0.0.1:3100')
TEXT = 'Public services should remain accessible. Online tools save time, but people also need practical support and a reliable alternative.'

class PracticeBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(
            headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or None,
            args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()

    def setUp(self):
        self.errors = []
        self.external = []
        self.context = self.browser.new_context(permissions=['microphone'], service_workers='block')
        def guard(route):
            if urlparse(route.request.url).netloc != urlparse(BASE).netloc:
                self.external.append(route.request.url)
                route.abort()
            else:
                route.continue_()
        self.context.route('http://**/*', guard)
        self.context.route('https://**/*', guard)
        self.page = self.context.new_page()
        self.watch(self.page)

    def watch(self, page):
        page.set_default_timeout(15000)
        page.on('pageerror', lambda error: self.errors.append(str(error)))
        page.on('console', lambda message: self.errors.append(message.text)
                if message.type == 'error' and ('hydration' in message.text.lower() or 'react error' in message.text.lower()) else None)
        page.on('response', lambda r: self.errors.append(f'HTTP {r.status} {r.url}')
                if r.status >= 400 and urlparse(r.url).path not in ['/api/drafts', '/favicon.ico'] else None)

    def tearDown(self):
        # Artifacts contain synthetic fixtures only; no microphone file/video is recorded.
        if not self.page.is_closed():
            self.page.screenshot(path=f'test-results/{self._testMethodName}.png', full_page=True)
        self.context.close()
        self.assertEqual(self.external, [], 'Unexpected external/cloud request')
        self.assertEqual(self.errors, [], 'Browser/runtime/hydration error')

    def open(self, path):
        self.page.goto(BASE + path)

    def records(self, kind):
        return self.page.evaluate('''kind => Object.keys(localStorage).filter(k=>k.startsWith('slp:practice:v1:guest:')).map(k=>JSON.parse(localStorage.getItem(k))).filter(r=>r.record.kind===kind).map(r=>r.record.data)''', kind)

    def answer(self, section, values):
        for i, value in enumerate(values):
            section.locator('fieldset').nth(i).get_by_role('radio').nth(value).check()

    def test_home_and_recommended_navigation(self):
        self.open('/')
        expect(self.page.get_by_role('heading', name='Completa tu muestra de reading')).to_be_visible()
        expect(self.page.get_by_text('Tu primera semana · plan provisional')).to_be_visible()
        self.page.get_by_role('link', name='Empezar este ejercicio →').click()
        expect(self.page.locator('#reading').get_by_role('heading', name='Warnings are only the beginning')).to_be_visible()
        expect(self.page.locator('#reading').get_by_role('radio').first).to_be_enabled()

    def test_reading_reload_route_change_delivery_and_repetition(self):
        self.open('/diagnostic')
        r = self.page.locator('#reading')
        r.get_by_role('radio').first.check()
        self.page.reload()
        expect(r.get_by_role('radio').first).to_be_checked()
        self.page.get_by_role('link', name='Plan', exact=False).first.click()
        self.open('/diagnostic')
        expect(r.get_by_role('radio').first).to_be_checked()
        self.answer(r, [0, 1, 2, 1])
        r.get_by_role('button', name='Entregar muestra de Reading').click()
        expect(r.get_by_text('Última entrega: 4 / 4')).to_be_visible()
        self.assertIsNone(self.page.evaluate("localStorage.getItem('slp:task-draft:v1:guest:reading:sensors-v1')"))
        self.assertEqual(self.records('submission')[0]['priorExposure'], 'none')
        r.get_by_role('button', name='Repetir como práctica', exact=True).click()
        self.answer(r, [0, 1, 2, 1])
        r.get_by_role('button', name='Entregar muestra de Reading').click()
        expect(r.get_by_text(re.compile('Práctica o exposición previa desconocida'))).to_be_visible()
        samples = self.records('submission')
        self.assertEqual(len(samples), 2)
        self.assertEqual(sum(s['priorExposure'] == 'none' for s in samples), 1)
        expect(self.page.locator('#summary').get_by_text(re.compile('1 material'))).to_be_visible()

    def test_drafts_survive_tab_close_and_stay_separate_by_task(self):
        self.open('/diagnostic')
        self.page.locator('#reading').get_by_role('radio').first.check()
        self.page.locator('#reading').get_by_label('Tarea de reading').select_option('training-time-v1')
        expect(self.page.locator('#reading').get_by_role('heading', name='Learning that fits the working day')).to_be_visible()
        expect(self.page.locator('#reading').get_by_role('radio').first).not_to_be_checked()
        self.page.locator('#reading').get_by_role('radio').nth(1).check()
        self.page.close()
        self.page = self.context.new_page()
        self.watch(self.page)
        self.open('/diagnostic')
        expect(self.page.locator('#reading').get_by_role('radio').first).to_be_checked()
        self.open('/diagnostic?reading=training-time-v1#reading')
        expect(self.page.locator('#reading').get_by_role('radio').nth(1)).to_be_checked()

    def test_listening_answers_restore_but_player_restarts(self):
        self.open('/listening')
        self.page.get_by_role('radio').first.check()
        self.page.reload()
        expect(self.page.get_by_role('radio').first).to_be_checked()
        self.answer(self.page, [0, 1, 2, 1, 2])
        button = self.page.get_by_role('button', name='Entregar respuestas', exact=True)
        expect(button).to_be_disabled()
        self.page.wait_for_function("document.querySelector('audio').duration > 30")
        self.page.evaluate("async()=>{const a=document.querySelector('audio');a.playbackRate=16;await a.play();}")
        expect(button).to_be_enabled(timeout=20000)
        button.click()
        expect(self.page.get_by_text('Última entrega: 5 / 5')).to_be_visible()
        self.assertIsNone(self.page.evaluate("localStorage.getItem('slp:task-draft:v1:guest:listening:library-evenings-v1')"))
        self.page.get_by_text('Consultar transcripción después de entregar', exact=True).click()
        expect(self.page.get_by_text(re.compile('Last month, our community library'))).to_be_visible()
        for version, title in [('energy-meeting-v1','Savings that need explaining'), ('mentoring-v1','Making room for questions')]:
            self.page.get_by_label('Tarea de listening').select_option(version)
            expect(self.page.get_by_role('heading', name=title)).to_be_visible()
            self.page.wait_for_function("document.querySelector('audio').duration > 30")

    def test_writing_lab_recovery_and_export_are_unchanged(self):
        self.open('/writing')
        editor = self.page.get_by_role('textbox', name='Tu texto en inglés')
        editor.fill(TEXT)
        self.page.reload()
        expect(editor).to_have_value(TEXT)
        with self.page.expect_download() as download:
            self.page.get_by_role('button', name='Descargar copia').click()
        self.assertEqual(Path(download.value.path()).read_text(), TEXT)

    def test_diagnostic_writing_keeps_each_task_and_closes_delivery(self):
        self.open('/diagnostic#writing')
        editor = self.page.get_by_role('textbox', name='Muestra escrita del diagnóstico')
        editor.fill(TEXT)
        self.page.locator('#writing').get_by_label('Tarea de writing').select_option('learning-budget-v1')
        expect(editor).to_have_value('')
        editor.fill('Training places should be allocated according to needs, while all staff should have access to shared materials.')
        self.page.reload()
        expect(editor).to_have_value(re.compile('Training places'))
        self.page.locator('#writing').get_by_label('Tarea de writing').select_option('public-services-v1')
        expect(editor).to_have_value(TEXT)
        self.page.get_by_role('button', name='Entregar muestra cerrada').click()
        expect(self.page.get_by_text('Muestra cerrada: no se edita', exact=True)).to_be_visible()
        expect(editor).to_be_disabled()
        self.page.reload()
        expect(editor).to_have_value(TEXT)
        expect(editor).to_be_disabled()

    def test_speaking_notes_restore_and_fake_microphone_audio_is_ephemeral(self):
        self.open('/diagnostic#speaking')
        section = self.page.locator('#speaking')
        notes = section.get_by_role('textbox', name='Observaciones personales (no evaluación)')
        notes.fill('I need to develop my response to the objection.')
        self.page.reload()
        expect(notes).to_have_value('I need to develop my response to the objection.')
        expect(section.locator('audio')).to_have_count(0)
        section.get_by_role('button', name='Iniciar grabación efímera').click()
        expect(section.get_by_role('button', name='Detener grabación')).to_be_visible()
        self.page.wait_for_timeout(1200)  # Intentional capture interval with a synthetic device.
        section.get_by_role('button', name='Detener grabación').click()
        expect(section.locator('audio')).to_be_visible()
        self.page.evaluate("async()=>{await document.querySelector('#speaking audio').play();}")
        section.get_by_role('checkbox', name=re.compile('He realizado la tarea')).check()
        section.get_by_role('button', name='Registrar realización sin conservar audio').click()
        expect(section.get_by_text(re.compile('Realización y notas guardadas'))).to_be_visible()
        s = [s for s in self.records('submission') if s['kind']=='speaking'][0]
        self.assertFalse(s['audioRetained'])
        self.assertIn('objection', s['notes'])
        self.assertFalse(self.page.evaluate("JSON.stringify(localStorage).includes('blob:')"))
        self.page.reload()
        expect(section.locator('audio')).to_have_count(0)
        expect(section.get_by_role('button', name='Registrar realización sin conservar audio')).to_be_disabled()

    def test_microphone_denial_preserves_notes(self):
        self.context.add_init_script("Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('Permission denied (simulated)','NotAllowedError')}})")
        self.open('/diagnostic#speaking')
        s=self.page.locator('#speaking')
        s.get_by_role('textbox').fill('Keep these notes despite a denied microphone.')
        s.get_by_role('button',name='Iniciar grabación efímera').click()
        expect(s.get_by_text('Permission denied (simulated)')).to_be_visible()
        self.page.reload()
        expect(s.get_by_role('textbox')).to_have_value('Keep these notes despite a denied microphone.')
        self.assertEqual(self.records('submission'), [])

    def test_error_bank_plan_and_manual_activity_persist(self):
        self.open('/errors')
        self.page.locator('[name=pattern]').fill('Past tense after yesterday')
        self.page.locator('[name=category]').select_option('grammar')
        self.page.locator('[name=skill]').select_option('speaking')
        self.page.locator('[name=session_ref]').fill('browser-session')
        self.page.locator('[name=example]').fill('Yesterday I go to the meeting.')
        self.page.get_by_role('button', name='Guardar observación').click()
        self.page.get_by_text('Ver ejemplos y oportunidades', exact=True).click()
        expect(self.page.get_by_text('Yesterday I go to the meeting.', exact=True)).to_be_visible()
        self.page.reload()
        self.page.get_by_text('Ver ejemplos y oportunidades', exact=True).click()
        expect(self.page.get_by_text('Yesterday I go to the meeting.', exact=True)).to_be_visible()
        self.open('/plan')
        self.page.locator('[name=weekly_minutes]').select_option('390')
        self.page.locator('form').first.get_by_role('button').click()
        expect(self.page.get_by_text('Plan guardado en este navegador.', exact=True)).to_be_visible()
        self.page.locator('[name=skill]').select_option('speaking')
        self.page.locator('[name=minutes]').fill('15')
        self.page.locator('[name=note]').fill('Independent practice from browser QA')
        self.page.get_by_role('button',name='Registrar actividad').click()
        expect(self.page.get_by_text('Independent practice from browser QA', exact=False)).to_be_visible()
        self.page.reload()
        expect(self.page.get_by_text('Independent practice from browser QA', exact=False)).to_be_visible()
        self.assertEqual(len(self.records('plan')),1)
        self.assertEqual(len(self.records('activity')),1)
        self.open('/')
        with self.page.expect_download() as download:
            self.page.get_by_role('button',name='Descargar historial local').click()
        self.assertIn('Independent practice from browser QA',Path(download.value.path()).read_text())

    def test_guest_cannot_open_another_identity_draft_and_session_change_locks(self):
        self.open('/diagnostic')
        self.page.evaluate('''()=>{localStorage.setItem('slp:writing:active-user','alice');localStorage.setItem('slp:task-draft:v1:alice:reading:sensors-v1',JSON.stringify({schema:1,owner:'alice',kind:'reading',version:'sensors-v1',id:crypto.randomUUID(),updatedAt:new Date().toISOString(),answers:{0:2},notes:'',assisted:false}));}''')
        self.page.reload()
        expect(self.page.locator('#reading').get_by_role('radio').nth(2)).not_to_be_checked()
        self.page.locator('#reading').get_by_role('radio').first.check()
        self.assertIn('"0":2',self.page.evaluate("localStorage.getItem('slp:task-draft:v1:alice:reading:sensors-v1')"))
        self.page.evaluate("window.dispatchEvent(new Event('slp-diagnostic-identity-change'))")
        expect(self.page.get_by_role('button',name='Verificar sesión de nuevo')).to_be_visible()
        expect(self.page.locator('#reading')).to_have_count(0)

    def test_storage_failure_does_not_claim_success(self):
        self.open('/diagnostic')
        r=self.page.locator('#reading')
        expect(r.get_by_role('radio').first).to_be_enabled()
        self.page.evaluate("()=>{Storage.prototype.setItem=function(k,v){throw new DOMException('No space','QuotaExceededError')};}")
        r.get_by_role('radio').first.check()
        expect(r.get_by_text(re.compile('No se pudo guardar. Mantén esta pestaña abierta'))).to_be_visible()
        self.assertIsNone(self.page.evaluate("localStorage.getItem('slp:task-draft:v1:guest:reading:sensors-v1')"))

    def test_second_tab_change_blocks_stale_answers(self):
        self.open('/diagnostic')
        r=self.page.locator('#reading')
        r.get_by_role('radio').first.check()
        other=self.context.new_page()
        self.watch(other)
        other.goto(BASE+'/diagnostic')
        other.locator('#reading').get_by_role('radio').nth(1).check()
        expect(r.get_by_text(re.compile('Este trabajo cambió en otra pestaña'))).to_be_visible()
        expect(r.get_by_role('radio').first).to_be_disabled()
        self.page.reload()
        expect(r.get_by_role('radio').nth(1)).to_be_checked()
        other.close()
