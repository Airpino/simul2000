#!/usr/bin/env python3
"""Prepara l’indice della guida con i nuovi moduli e aggiorna le pagine esistenti:
menu iniziale, guida generale, indici di tutte le guide, colori e icone."""
import re, sys, pathlib

B = pathlib.Path(__file__).parent; P = B / 'parts'

SVG = lambda inner, cls, var: f'<svg class="{cls}" style="color:var({var})" viewBox="0 0 64 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{inner}</svg>'
ICONS = {
    'ic':  '<path d="M33 3v38" stroke-dasharray="3 3" opacity=".6"/><path d="M14 8h30M20 15h28M8 22h22M18 29h26"/><path d="M38 36h20" stroke-width="2.8"/><g fill="currentColor" stroke="none"><circle cx="29" cy="8" r="2"/><circle cx="34" cy="15" r="2"/><circle cx="19" cy="22" r="2"/><circle cx="31" cy="29" r="2"/><circle cx="48" cy="36" r="2.4"/></g>',
    'bay': '<path d="M6 40h52" opacity=".5"/><path d="M6 38c10-2 14-16 24-16s14 14 26 16" stroke-dasharray="3 3" opacity=".75"/><path d="M24 39c6-1 8-34 14-34s8 33 14 34" stroke-width="2.4"/>',
    'np':  '<path d="M6 40h52" opacity=".5"/><g fill="currentColor" stroke="none" opacity=".35"><rect x="9" y="34" width="6" height="6"/><rect x="17" y="29" width="6" height="11"/><rect x="25" y="24" width="6" height="16"/><rect x="33" y="19" width="6" height="21"/><rect x="41" y="14" width="6" height="26"/><rect x="49" y="9" width="6" height="31"/></g><path d="M10 6c8-4 16-4 22 2" /><path d="M32 8l-1-5M32 8l-5 0"/><g fill="currentColor" stroke="none"><circle cx="40" cy="5" r="2"/><circle cx="47" cy="5" r="2"/><circle cx="54" cy="5" r="2"/></g>'
}
# colori delle nuove piastrelle e icone, chiari e scuri
VARS_L = '--t13:#DCF0EC;--t14:#F3E8DC;--t15:#E3EAF2;--i13:#0E7C6B;--i14:#8B5A2B;--i15:#476A8A;'
VARS_D = '--t13:#17302B;--t14:#30261C;--t15:#1F2832;--i13:#63D3BF;--i14:#E0A872;--i15:#9FC1E0;'
STYLE = ('<style id="newmods">:root{' + VARS_L + '}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){' + VARS_D +
         '}}:root[data-theme="dark"]{' + VARS_D + '}#inf a.tile b{padding-right:4.2rem}</style>\n')
MODS = [  # file del modulo, guida, icona, variabile colore, titolo, descrizione per la guida generale
    ('simul_intervalli.html', 'aiuto_intervalli.html', 'ic', '--i13', ('Intervalli di confidenza e test', 'Confidence intervals and tests'),
     ('copertura, errori di I e II tipo, potenza', 'coverage, type I and II errors, power')),
    ('simul_bayes.html', 'aiuto_bayes.html', 'bay', '--i14', ('Inferenza bayesiana', 'Bayesian inference'),
     ('prior, verosimiglianza e posterior', 'prior, likelihood and posterior')),
    ('simul_nonparametrica.html', 'aiuto_nonparametrica.html', 'np', '--i15', ('Inferenza non parametrica', 'Nonparametric inference'),
     ('bootstrap, permutazioni, ranghi', 'bootstrap, permutations, ranks')),
]

def add_style(s):
    s = re.sub(r'<style id="newmods">.*?</style>\n', '', s, flags=re.S)
    return s.replace('</head>', STYLE + '</head>', 1)

def toc_items(lang):
    i = 0 if lang == 'it' else 1
    return ''.join(f'<li><a href="{h}">{SVG(ICONS[ic], "ni", v)}{t[i]}</a></li>' for _, h, ic, v, t, _d in MODS)

def clean_toc(t):
    t = t.replace(' aria-current="page"', '')
    return re.sub(r'<li class="sub">.*?</li>', '', t)

def main(REPO):
    # ---------- parti per le nuove guide ----------
    for lang in ('it', 'en'):
        t = clean_toc((P / f'toc_raw_{lang}.html').read_text(encoding='utf8')).strip()
        t = t.replace('</ol></nav>', toc_items(lang) + '</ol></nav>')
        (P / f'toc_{lang}.html').write_text(t, encoding='utf8')
        h = add_style((P / f'helphead_{lang}.html').read_text(encoding='utf8'))
        (P / f'helphead_{lang}.html').write_text(h, encoding='utf8')

    # ---------- pagine esistenti ----------
    def patch(path, fn):
        s = path.read_text(encoding='utf8'); s2 = fn(s)
        if s2 != s: path.write_text(s2, encoding='utf8'); print('aggiornato', path.relative_to(REPO))


    for lang, base in (('it', REPO), ('en', REPO / 'en')):
        i = 0 if lang == 'it' else 1
        # indici delle guide esistenti
        for f in sorted(base.glob('aiuto*.html')):
            if f.name in [m[1] for m in MODS]: continue
            def fn(s):
                s = add_style(s)
                if 'aiuto_intervalli.html' not in s:
                    m = re.search(r'<nav class="toc".*?</ol></nav>', s, flags=re.S)
                    s = s[:m.end() - len('</ol></nav>')] + toc_items(lang) + '</ol></nav>' + s[m.end():]
                return s
            patch(f, fn)
        # elenco dei moduli nella guida generale
        def gen(s):
            if 'aiuto_intervalli.html"><svg class="mi"' in s: return s
            items = ''.join(f'<li><a href="{h}">{SVG(ICONS[ic], "mi", v)}<b>{t[i]}</b><span>{d[i]}</span></a></li>\n' for _, h, ic, v, t, d in MODS)
            j = s.find('</ul>', s.find('<ul class="modlist">'))
            s = s[:j] + items + s[j:]
            s = s.replace('uno dei dieci moduli; i primi nove erano già presenti, nello stesso ordine, nel vecchio Simul2000',
                          'uno dei tredici moduli; i primi nove erano già presenti, nello stesso ordine, nel vecchio Simul2000, gli ultimi tre sono stati aggiunti nel 2026 per l’inferenza')
            s = s.replace('one of the ten modules; the first nine were already in the old Simul2000, in the same order',
                          'one of the thirteen modules; the first nine were already in the old Simul2000, in the same order, and the last three were added in 2026 for inference')
            return s
        patch(base / 'aiuto.html', gen)
        # menu iniziale
        def idx(s):
            s = add_style(s)
            if 'simul_intervalli.html' in s: return s
            h2 = ('<h2>Inferenza</h2>\n<nav class="grid" id="inf" aria-label="Moduli di inferenza"></nav>\n\n' if lang == 'it'
                  else '<h2>Inference</h2>\n<nav class="grid" id="inf" aria-label="Inference modules"></nav>\n\n')
            k = s.find('<h2>', s.find('id="grid"'))
            s = s[:k] + h2 + s[k:]
            icons = ''.join(f"  {ic}: svg('{ICONS[ic]}'),\n" for ic in ICONS)
            s = s.replace("const ICON = {\n", "const ICON = {\n" + icons, 1)
            desc = {'it': ['Cento intervalli uno sotto l’altro: quanti contengono il vero valore? E quante volte un test sbaglia.',
                           'Prior, verosimiglianza e posterior che si aggiornano con i dati; copertura degli intervalli di credibilità.',
                           'Bootstrap, test di permutazione e test di Wilcoxon-Mann-Whitney contro il test t.'],
                    'en': ['A hundred intervals one under the other: how many contain the true value? And how often a test is wrong.',
                           'Prior, likelihood and posterior updating with the data; coverage of credible intervals.',
                           'Bootstrap, permutation tests and the Wilcoxon-Mann-Whitney test against the t test.']}[lang]
            flag = 'nuovo' if lang == 'it' else 'new'
            arr = 'const INF = [\n' + ',\n'.join(f"  ['{f}', null, '{t[i]}', '{desc[j]}', '{ic}', '{flag}']" for j, (f, _h, ic, _v, t, _d) in enumerate(MODS)) + '\n];\n'
            s = s.replace('const MEMO = [', arr + 'const MEMO = [', 1)
            s = s.replace("tiles(EXTRA, document.getElementById('extra'), 10, true);",
                          "tiles(INF, document.getElementById('inf'), 13, true);\ntiles(EXTRA, document.getElementById('extra'), 10, true);", 1)
            return s
        patch(base / 'index.html', idx)


if __name__ == '__main__':
    main(pathlib.Path(sys.argv[1]))
