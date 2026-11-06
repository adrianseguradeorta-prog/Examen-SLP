"""Automated Linux WebKit, mobile viewport; NOT physical Safari/iPhone QA."""
import os
import re
import unittest
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect
import practice_test
BASE=practice_test.BASE

class WebKitPilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pw=sync_playwright().start()
        cls.browser=cls.pw.webkit.launch(headless=True)
    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
    def setUp(self):
        self.errors=[]
        self.external=[]
        self.context=self.browser.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
        def guard(route):
            if urlparse(route.request.url).netloc != urlparse(BASE).netloc:
                self.external.append(route.request.url)
                route.abort()
            else: route.continue_()
        self.context.route('http://**/*',guard)
        self.context.route('https://**/*',guard)
        self.page=self.context.new_page()
        practice_test.PracticeBrowserTests.watch(self,self.page)
    def tearDown(self):
        self.page.screenshot(path=f'test-results/webkit-{self._testMethodName}.png',full_page=True)
        self.context.close()
        self.assertEqual(self.errors,[])
        self.assertEqual(self.external,[])
    def test_mobile_layout_keyboard_focus_and_profile(self):
        for path in ['/','/plan','/settings','/vocabulary','/errors','/diagnostic','/listening','/speaking','/writing']:
            self.page.goto(BASE+path)
            self.page.wait_for_load_state('networkidle')
            expect(self.page.locator('main h1')).to_be_visible()
            self.page.wait_for_function("!document.body.innerText.includes('Comprobando el espacio local')")
            self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),path)
        self.page.goto(BASE+'/settings')
        self.page.keyboard.press('Tab')
        expect(self.page.get_by_role('link',name='Saltar al contenido')).to_be_focused()
        self.page.keyboard.press('Enter')
        expect(self.page.locator('#main-content')).to_be_focused()
        self.page.get_by_label('Minutos disponibles por semana').fill('120')
        self.page.get_by_role('button',name='Guardar perfil').click()
        expect(self.page.get_by_text('Perfil guardado en este navegador. Revisa tu propuesta en Plan.')).to_be_visible()
        self.page.reload()
        expect(self.page.get_by_label('Minutos disponibles por semana')).to_have_value('120')
        self.assertGreaterEqual(self.page.get_by_label('Minutos disponibles por semana').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)'),16)
    def test_reading_and_diagnostic_writing_reopen(self):
        self.page.goto(BASE+'/diagnostic')
        reading=self.page.locator('#reading')
        reading.get_by_role('radio').first.check()
        writing=self.page.get_by_role('textbox',name='Muestra escrita del diagnóstico')
        writing.fill(practice_test.TEXT)
        self.page.close()
        self.page=self.context.new_page()
        practice_test.PracticeBrowserTests.watch(self,self.page)
        self.page.goto(BASE+'/diagnostic')
        expect(self.page.locator('#reading').get_by_role('radio').first).to_be_checked()
        expect(self.page.get_by_role('textbox',name='Muestra escrita del diagnóstico')).to_have_value(practice_test.TEXT)
        self.page.get_by_role('button',name='Entregar muestra cerrada').click()
        expect(self.page.get_by_text('Muestra cerrada: no se edita',exact=True)).to_be_visible()
    def test_listening_decode_and_answer_recovery(self):
        self.page.goto(BASE+'/listening')
        self.page.get_by_role('radio').first.check()
        self.page.reload()
        expect(self.page.get_by_role('radio').first).to_be_checked()
        for version in ['library-evenings-v1','energy-meeting-v1','mentoring-v1']:
            self.page.get_by_label('Tarea de listening').select_option(version)
            expect(self.page.locator('audio')).to_have_attribute('src',f'/audio/{version}.mp3')
            self.page.wait_for_function("document.querySelector('audio').duration > 30")
            self.page.locator('audio').evaluate('async a=>{await a.play();}')
            try:
                self.page.wait_for_function("document.querySelector('audio').currentTime > 0.1")
            except Exception:
                state=self.page.locator('audio').evaluate('a=>({src:a.currentSrc,time:a.currentTime,paused:a.paused,ready:a.readyState,error:a.error?.message})')
                self.fail(f'Audio did not progress for {version}: {state}')
            self.page.locator('audio').evaluate('a=>a.pause()')
    def test_microphone_denial_keeps_notes(self):
        # Linux WebKit may omit MediaRecorder; this stub only reaches the denied-permission branch.
        # It must never record or stand in for a physical microphone test.
        self.context.add_init_script("if(!window.MediaRecorder)window.MediaRecorder=class{constructor(){throw Error('Unexpected recording in denial test')}}; Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:async()=>{throw new DOMException('Denied in WebKit simulation','NotAllowedError')}})")
        self.page.goto(BASE+'/diagnostic#speaking')
        s=self.page.locator('#speaking')
        s.get_by_role('textbox').fill('These are my independent notes.')
        s.get_by_role('button',name='Iniciar grabación efímera').click()
        expect(s.get_by_text('Denied in WebKit simulation')).to_be_visible()
        self.page.reload()
        expect(s.get_by_role('textbox')).to_have_value('These are my independent notes.')
    def test_backup_roundtrip_and_corrupt_file(self):
        self.page.goto(BASE+'/settings')
        self.page.get_by_label('Minutos disponibles por semana').fill('90')
        self.page.get_by_role('button',name='Guardar perfil').click()
        expect(self.page.get_by_text('Perfil guardado en este navegador. Revisa tu propuesta en Plan.')).to_be_visible()
        with self.page.expect_download() as download:
            self.page.get_by_role('button',name='Exportar copia completa').click()
        path=download.value.path()
        self.page.get_by_label('Minutos disponibles por semana').fill('120')
        self.page.get_by_role('button',name='Guardar perfil').click()
        self.page.get_by_label('Seleccionar copia para restaurar').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{'})
        expect(self.page.get_by_role('button',name='Reemplazar con esta copia')).to_have_count(0)
        self.page.get_by_label('Seleccionar copia para restaurar').set_input_files(path)
        expect(self.page.get_by_text('Archivo validado; aún no se ha cambiado ningún dato.')).to_be_visible()
        self.page.get_by_role('checkbox',name=re.compile('He cerrado las otras pestañas')).check()
        self.page.get_by_role('button',name='Reemplazar con esta copia').click()
        expect(self.page.get_by_label('Minutos disponibles por semana')).to_have_value('90')
