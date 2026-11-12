#!/usr/bin/env python3
"""Genera le versioni italiana e inglese dei nuovi moduli a partire da un unico sorgente.
Nei sorgenti {{testo italiano|English text}} viene sostituito con la lingua giusta;
@@NOME@@ include una parte comune."""
import re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))

B = pathlib.Path(__file__).parent
REPO = pathlib.Path(sys.argv[1])
P = B / 'parts'

def lang_split(s, lang):
    for m in re.finditer(r'\{\{(.*?)\}\}', s, flags=re.S):
        assert m.group(1).count('|') == 1, 'separatore ambiguo: ' + m.group(0)[:120]
    i = 0 if lang == 'it' else 1
    return re.sub(r'\{\{(.*?)\|(.*?)\}\}', lambda m: m.group(1 + i), s, flags=re.S)

def topbar(module, help_, lang):
    if lang == 'it':
        return (f'<div class="topbar"><a class="home" id="homelink" href="index.html">← Menu iniziale</a>'
                f'<a class="langlink" id="langlink" href="en/{module}" hreflang="en" lang="en">English</a>'
                f'<a class="helpbtn" id="helplink" href="{help_}">? Guida</a>'
                '<button type="button" class="savebtn" id="saveimg" title="Salva un’immagine PNG con i grafici, i parametri e i risultati della simulazione">Salva immagine</button>'
                '<div class="themesel" role="group" aria-label="Sfondo della pagina"><span>Sfondo</span><button type="button" data-t="auto">automatico</button><button type="button" data-t="light">chiaro</button><button type="button" data-t="dark">scuro</button></div></div>')
    return (f'<div class="topbar"><a class="home" id="homelink" href="index.html">← Main menu</a>'
            f'<a class="langlink" id="langlink" href="../{module}" hreflang="it" lang="it">Italiano</a>'
            f'<a class="helpbtn" id="helplink" href="{help_}">? Help</a>'
            '<button type="button" class="savebtn" id="saveimg" title="Save a PNG image with the charts, the parameters and the results of the simulation">Save image</button>'
            '<div class="themesel" role="group" aria-label="Page background"><span>Background</span><button type="button" data-t="auto">automatic</button><button type="button" data-t="light">light</button><button type="button" data-t="dark">dark</button></div></div>')

COLORS = '''<div class="panel">
      <h2>{{Colori|Colours}}</h2>
      <select id="palette" aria-label="{{Combinazione di colori|Colour scheme}}">
        <option value="orig">{{Originale di Simul2000 (giallo e rosso)|Simul2000 original (yellow and red)}}</option>
        <option value="cb">{{Adatta ai daltonici (azzurro e arancio)|Colour-blind friendly (sky blue and orange)}}</option>
        <option value="custom">{{Personalizzata|Custom}}</option>
      </select>
      <div id="custom" hidden>
        <div class="swrow"><span>{{Barre|Bars}}</span><div class="swatches" data-target="bar"></div></div>
        <div class="swrow"><span>{{Curve|Curves}}</span><div class="swatches" data-target="curve"></div></div>
        <div class="swrow"><span>{{Valori|Values}}</span><div class="swatches" data-target="strip"></div></div>
      </div>
    </div>'''

SEED = '''<div class="panel">
      <h2>{{Generatore|Generator}}</h2>
      <div class="row">
        <div><label class="f" for="seed">{{Seme iniziale|Initial seed}}</label><input type="number" id="seed" value="552691563"></div>
        <div style="flex:0 0 auto"><button id="newseed" type="button">{{Nuovo seme|New seed}}</button></div>
      </div>
    </div>'''

def build_module(src, lang):
    s = src.read_text(encoding='utf8')
    def inc(m):
        name, *args = m.group(1).split(':')
        if name == 'THEME':
            return (P / 'theme.html').read_text(encoding='utf8').replace('<html lang="it">', f'<html lang="{lang}">')
        if name == 'CSS': return (P / 'css.html').read_text(encoding='utf8')
        if name == 'CORE': return (P / 'core.js').read_text(encoding='utf8')
        if name == 'TAIL': return (P / f'tail_{lang}.html').read_text(encoding='utf8')
        if name == 'TOPBAR': return topbar(args[0], args[1], lang)
        if name == 'COLORS': return COLORS
        if name == 'SEED': return SEED
        if name == 'HELP': return (P / f'helphead_{lang}.html').read_text(encoding='utf8')
        if name == 'TOC': return toc(args[0], args[1:], lang)
        if name == 'HELPTOP':
            t = (P / f'helptop_{lang}.html').read_text(encoding='utf8').strip()
            return t.replace('aiuto_medie.html', args[0])
        if name == 'ICON':
            import patch_existing as pe
            ic, var = args
            return pe.SVG(pe.ICONS[ic], 'ti', var)
        if name == 'HELPTAIL': return (P / f'helptail_{lang}.html').read_text(encoding='utf8')
        raise KeyError(name)
    for _ in range(2):
        s = re.sub(r'@@([A-Z]+(?::[^@]*)?)@@', inc, s)
    out = lang_split(s, lang)
    assert '{{' not in out and '@@' not in out, (src, lang, out[out.find('{{') - 80: out.find('{{') + 80])
    dest = REPO / src.name if lang == 'it' else REPO / 'en' / src.name
    dest.write_text(out, encoding='utf8')
    print('scritto', dest)

def toc(current, subs, lang):
    """indice della guida: quello esistente, con le nuove voci e la pagina corrente evidenziata"""
    t = (P / f'toc_{lang}.html').read_text(encoding='utf8')
    href = f'href="{current}"'
    t = t.replace(href + '>', href + ' aria-current="page">', 1)
    if subs:
        pairs = [x.split('=', 1) for x in subs]
        lis = ''.join(f'<li class="sub"><a href="#{a}">{lang_split(b, lang)}</a></li>' for a, b in pairs)
        i = t.find(href); j = t.find('</li>', i) + 5
        t = t[:j] + lis + t[j:]
    return t

if __name__ == '__main__':
    for f in sorted((B / 'src').glob('*.html')):
        for lang in ('it', 'en'):
            build_module(f, lang)
