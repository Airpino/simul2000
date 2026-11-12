// ================= funzioni comuni ai moduli di inferenza =================
const $ = id => document.getElementById(id);
const LOC = '{{it-IT|en-US}}';
const fmt = (x, d) => Number.isFinite(x) ? x.toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−') : '–';
const fmtp = x => Number.isFinite(x) ? x.toLocaleString(LOC, { maximumFractionDigits: 4 }).replace('-', '−') : '–';
const fmtn = x => x.toLocaleString(LOC);
const fmtpct = (x, d = 1) => Number.isFinite(x) ? fmt(100 * x, d) + '%' : '–';
const num = id => parseFloat(String($(id).value).replace(',', '.'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function readNum(id, lo, hi, label, integer) {
  const x = integer ? Math.round(num(id)) : num(id);
  if (!Number.isFinite(x) || x < lo || x > hi) throw `${label}: {{scegli un valore fra|choose a value between}} ${fmtp(lo)} {{e|and}} ${fmtp(hi)}.`;
  return x;
}

// ---------- funzioni speciali ----------
function lgamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
// funzione di ripartizione della normale standard (erfc di W. J. Cody, errore relativo < 1e-14 circa)
function pnorm(z) {
  const x = Math.abs(z) / Math.SQRT2;
  let r;
  if (x < 0.5) {
    const t = x * x;
    const p = ((((0.185777706184603153 * t + 3.16112374387056560) * t + 113.864154151050156) * t + 377.485237685302021) * t + 3209.37758913846947);
    const q = ((((t + 23.6012909523441209) * t + 244.024637934444173) * t + 1282.61652607737228) * t + 2844.23683343917062);
    r = 1 - x * p / q;
  } else if (x < 4) {
    const P = [2.15311535474403846e-8, 0.564188496988670089, 8.88314979438837594, 66.1191906371416295, 298.635138197400131, 881.952221241769090, 1712.04761263407058, 2051.07837782607147, 1230.33935479799725];
    const Q = [1, 15.7449261107098347, 117.693950891312499, 537.181101862009858, 1621.38957456669019, 3290.79923573345963, 4362.61909014324716, 3439.36767414372164, 1230.33935480374942];
    let p = 0, q = 0; for (let i = 0; i < 9; i++) { p = p * x + P[i]; q = q * x + Q[i]; }
    r = Math.exp(-x * x) * p / q;
  } else {
    const t = 1 / (x * x);
    const P = [0.0163153871373020978, 0.305326634961232344, 0.360344899949804439, 0.125781726111229246, 0.0160837851487422766, 6.58749161529837803e-4];
    const Q = [1, 2.56852019228982242, 1.87295284992346725, 0.527905102951428412, 0.0605183413124413191, 0.00233520497626869185];
    let p = 0, q = 0; for (let i = 0; i < 6; i++) { p = p * t + P[i]; q = q * t + Q[i]; }
    r = Math.exp(-x * x) / x * (0.564189583547756287 - t * p / q);
  }
  return z >= 0 ? 1 - r / 2 : r / 2;
}
const dnorm = z => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
// quantile della normale standard (Acklam, con un passo di Newton)
function qnorm(p) {
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  let x;
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else if (p > 1 - 0.02425) { const q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  else { const q = p - 0.5, r = q * q; x = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
  const e = pnorm(x) - p; return x - e / dnorm(x);
}
// beta incompleta regolarizzata I_x(a, b): frazione continua (Numerical Recipes)
function betacf(a, b, x) {
  const FP = 1e-300; let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-15) break;
  }
  return h;
}
function pbeta(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
const dbeta = (x, a, b) => (x > 0 && x < 1) ? Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lgamma(a) - lgamma(b) + lgamma(a + b)) : 0;
function bisect(f, lo, hi, it = 100) { for (let i = 0; i < it; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; if (hi - lo < 1e-13 * (1 + Math.abs(m))) break; } return (lo + hi) / 2; }
function qbeta(p, a, b) { if (p <= 0) return 0; if (p >= 1) return 1; return bisect(x => pbeta(x, a, b) - p, 0, 1, 80); }
// t di Student
function pt(t, df) {
  if (!Number.isFinite(df) || df > 1e7) return pnorm(t);
  const x = df / (df + t * t), tail = 0.5 * pbeta(x, df / 2, 0.5);
  return t > 0 ? 1 - tail : tail;
}
const dt = (t, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + t * t / df));
function qt(p, df) {
  if (!Number.isFinite(df) || df > 1e7) return qnorm(p);
  if (p === 0.5) return 0;
  let hi = Math.max(1, Math.abs(qnorm(p)) * 2); while (pt(hi, df) < Math.max(p, 1 - p)) hi *= 2;
  const x = bisect(t => pt(t, df) - Math.max(p, 1 - p), 0, hi);
  return p > 0.5 ? x : -x;
}
// gamma incompleta regolarizzata P(a, x)
function pgamma(x, a) {
  if (x <= 0) return 0;
  const gl = lgamma(a);
  if (x < a + 1) { let ap = a, sum = 1 / a, del = sum; for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; } return sum * Math.exp(-x + a * Math.log(x) - gl); }
  const FP = 1e-300; let b = x + 1 - a, c = 1 / FP, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < FP) d = FP; c = b + an / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - gl) * h;
}
const dgamma = (x, a, rate) => x > 0 ? Math.exp(a * Math.log(rate) + (a - 1) * Math.log(x) - rate * x - lgamma(a)) : 0;
function qgamma(p, a, rate) {
  if (p <= 0) return 0; let hi = (a + 10 * Math.sqrt(a) + 10); while (pgamma(hi, a) < p) hi *= 2;
  return bisect(x => pgamma(x, a) - p, 0, hi) / rate;
}

// ---------- generatore di base ----------
// congruenziale moltiplicativo di Park e Miller: a = 48271, m = 2^31 − 1
let state = 1, spare = null;
function setSeed(s) { state = (Math.abs(Math.floor(s)) % 2147483646) + 1; spare = null; }
function unif() { state = (state * 48271) % 2147483647; return state / 2147483647; }
function upos() { let u; do u = unif(); while (u <= 0 || u >= 1); return u; }
function rnorm() { // Box-Muller
  if (spare !== null) { const z = spare; spare = null; return z; }
  const r = Math.sqrt(-2 * Math.log(upos())), t = 2 * Math.PI * unif();
  spare = r * Math.sin(t); return r * Math.cos(t);
}
function rgamma1(a) { // gamma di forma a e scala 1: Marsaglia e Tsang (2000)
  if (a < 1) return rgamma1(a + 1) * Math.pow(upos(), 1 / a);
  const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = rnorm(); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = upos();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function rpois(l) { // inversione per λ piccolo, normale arrotondata a passi per λ grande
  if (l < 50) { const u = unif(); let k = 0, p = Math.exp(-l), F = p; while (u > F && k < 5000) { k++; p *= l / k; F += p; } return k; }
  // somma di Poisson più piccole: resta esatta
  let s = 0, r = l; while (r > 40) { s += rpois(40); r -= 40; } return s + rpois(r);
}

// ---------- forme standardizzate (media 0 e varianza 1; la Cauchy ha mediana 0 e scala 1) ----------
const E = Math.E;
const SHAPES = [
  { id: 'norm', name: '{{Normale|Normal}}', r: rnorm, d: dnorm, med: 0 },
  { id: 'unif', name: '{{Uniforme|Uniform}}', r: () => (unif() - 0.5) * Math.sqrt(12), d: x => Math.abs(x) <= Math.sqrt(3) ? 1 / Math.sqrt(12) : 0, med: 0 },
  { id: 'exp', name: '{{Esponenziale (asimmetrica)|Exponential (skewed)}}', r: () => -Math.log(upos()) - 1, d: x => x >= -1 ? Math.exp(-(x + 1)) : 0, med: Math.log(2) - 1 },
  { id: 'lnorm', name: '{{Lognormale (molto asimmetrica)|Lognormal (very skewed)}}', r: () => (Math.exp(rnorm()) - Math.sqrt(E)) / Math.sqrt((E - 1) * E),
    d: x => { const y = x * Math.sqrt((E - 1) * E) + Math.sqrt(E); return y > 0 ? dnorm(Math.log(y)) / y * Math.sqrt((E - 1) * E) : 0; }, med: (1 - Math.sqrt(E)) / Math.sqrt((E - 1) * E) },
  { id: 'lap', name: '{{Laplace (code pesanti)|Laplace (heavy tails)}}', r: () => { const e = -Math.log(upos()) / Math.SQRT2; return unif() < 0.5 ? -e : e; }, d: x => Math.exp(-Math.SQRT2 * Math.abs(x)) / Math.SQRT2, med: 0 },
  { id: 't3', name: '{{t di Student con 3 g.d.l. (code molto pesanti)|Student’s t, 3 d.f. (very heavy tails)}}', r: () => rnorm() / Math.sqrt(2 * rgamma1(1.5) / 3) / Math.sqrt(3), d: x => dt(x * Math.sqrt(3), 3) * Math.sqrt(3), med: 0 },
  { id: 'cauchy', name: '{{Cauchy (senza media né varianza)|Cauchy (no mean, no variance)}}', r: () => Math.tan(Math.PI * (upos() - 0.5)), d: x => 1 / (Math.PI * (1 + x * x)), med: 0, noMoments: true }
];

// ---------- numeri tondi per gli assi ----------
function nice(x) { const p = 10 ** Math.floor(Math.log10(x)), f = x / p; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; }
function niceStep(span, k = 5) { const raw = span / k, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p; }
const dec = st => Math.max(0, -Math.floor(Math.log10(st) + 1e-9));

// ---------- colori ----------
const OKABE = [['#000000','{{nero|black}}'],['#0072B2','{{blu|blue}}'],['#56B4E9','{{azzurro|sky blue}}'],['#009E73','{{verde|bluish green}}'],['#F0E442','{{giallo|yellow}}'],['#E69F00','{{arancio|orange}}'],['#D55E00','{{vermiglio|vermilion}}'],['#CC79A7','{{porpora|reddish purple}}']];
const PRESETS = { cb: { bar: '#56B4E9', curve: '#D55E00', strip: '#0072B2' } };
let colors = { palette: 'orig', bar: '#E69F00', curve: '#D55E00', strip: '#0072B2' };
try { const s = JSON.parse(localStorage.getItem('simul2000-colori') || 'null'); if (s && s.palette) colors = Object.assign(colors, s); } catch (e) {}
const C = {};
let onColors = () => {};
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  ['grid','muted','rule','accent','ink','surface','bg'].forEach(nm => C[nm] = cs.getPropertyValue('--' + nm).trim());
  if (colors.palette === 'orig') ['bar','curve','strip'].forEach(nm => C[nm] = cs.getPropertyValue('--' + nm).trim());
  else if (colors.palette === 'cb') Object.assign(C, PRESETS.cb);
  else Object.assign(C, { bar: colors.bar, curve: colors.curve, strip: colors.strip });
  onColors();
}
function initColors() {
  const save = () => { try { localStorage.setItem('simul2000-colori', JSON.stringify(colors)); } catch (e) {} };
  const paint = () => {
    document.querySelectorAll('.swatches').forEach(box => box.querySelectorAll('.sw').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hex === colors[box.dataset.target]))));
    $('palette').value = colors.palette; $('custom').hidden = colors.palette !== 'custom';
  };
  document.querySelectorAll('.swatches').forEach(box => {
    const t = box.dataset.target;
    OKABE.forEach(([hex, nm]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.background = hex;
      b.title = nm; b.setAttribute('aria-label', `${nm} {{per|for}} ${box.previousElementSibling.textContent.toLowerCase()}`);
      b.onclick = () => { colors[t] = hex; save(); paint(); readColors(); };
      b.dataset.hex = hex; box.appendChild(b);
    });
  });
  $('palette').onchange = () => { colors.palette = $('palette').value; save(); paint(); readColors(); };
  paint(); readColors();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
}

// ---------- disegno ----------
function fit(cv) {
  const ctx = cv.getContext('2d'), r = cv.getBoundingClientRect(), d = devicePixelRatio || 1;
  const w = Math.round(r.width * d), h = Math.round(r.height * d);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  ctx.setTransform(d, 0, 0, d, 0, 0); return [ctx, r.width, r.height];
}
// assi con griglia: restituisce le funzioni di trasformazione
function axes(ctx, w, h, o) {
  const small = o.small, L = o.L ?? (small ? 40 : 54), R = o.R ?? 12, T = o.T ?? 8, B = o.B ?? (small ? 22 : 30);
  const pw = w - L - R, ph = h - T - B;
  const PX = x => L + (x - o.x0) / (o.x1 - o.x0) * pw, PY = y => T + ph - (y - o.y0) / (o.y1 - o.y0) * ph;
  ctx.clearRect(0, 0, w, h);
  ctx.font = (small ? '10.5px' : '12px') + ' "IBM Plex Sans", Arial, sans-serif'; ctx.fillStyle = C.muted; ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  if (!o.noY) {
    const st = o.yStep || niceStep(o.y1 - o.y0, small ? 3 : 5), dy = o.yDec ?? dec(st);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let y = Math.ceil((o.y0 - 1e-12) / st) * st; y <= o.y1 + 1e-12; y += st) {
      const py = Math.round(PY(y)) + .5; ctx.beginPath(); ctx.moveTo(L, py); ctx.lineTo(L + pw, py); ctx.stroke();
      const yy = Math.abs(y) < 1e-12 ? 0 : y; ctx.fillText(o.yFmt ? o.yFmt(yy) : fmt(yy, dy), L - 5, py);
    }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const sx = o.xStep || niceStep(o.x1 - o.x0, small ? 4 : 8), dx = o.xDec ?? dec(sx);
  for (let x = Math.ceil((o.x0 - 1e-9) / sx) * sx; x <= o.x1 + 1e-9; x += sx) {
    const px = Math.round(PX(x)) + .5; ctx.beginPath(); ctx.moveTo(px, T); ctx.lineTo(px, T + ph); ctx.stroke();
    const xx = Math.abs(x) < 1e-12 ? 0 : x; ctx.fillText(o.xFmt ? o.xFmt(xx) : fmt(xx, dx), px, T + ph + 5);
  }
  if (o.xlab) { ctx.textAlign = 'right'; ctx.fillText(o.xlab, L + pw, T + ph + (small ? 5 : 16) + (small ? 9 : 0)); }
  ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(L, T + ph + .5); ctx.lineTo(L + pw, T + ph + .5); ctx.stroke();
  return { PX, PY, L, R, T, B, pw, ph, clip() { ctx.save(); ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip(); } };
}
function curve(ctx, A, f, x0, x1, n = 400) {
  ctx.beginPath(); let pen = false;
  for (let j = 0; j <= n; j++) { const x = x0 + (x1 - x0) * j / n, y = f(x); if (!Number.isFinite(y)) { pen = false; continue; } const py = Math.max(A.T - 4, A.PY(y)); pen ? ctx.lineTo(A.PX(x), py) : ctx.moveTo(A.PX(x), py); pen = true; }
  ctx.stroke();
}
function vline(ctx, A, x, color, dash, lw = 1.5) {
  const px = Math.round(A.PX(x)) + .5; if (px < A.L - 1 || px > A.L + A.pw + 1) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(px, A.T); ctx.lineTo(px, A.T + A.ph); ctx.stroke(); ctx.restore();
}
function hline(ctx, A, y, color, dash, lw = 1.5) {
  const py = Math.round(A.PY(y)) + .5; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(A.L, py); ctx.lineTo(A.L + A.pw, py); ctx.stroke(); ctx.restore();
}
// piccola legenda in alto a destra: [[colore, testo, tipo]] con tipo 'line' | 'dash' | 'box' | 'dot'
function legend(ctx, A, items, left) {
  ctx.save(); ctx.font = '11.5px "IBM Plex Sans", Arial, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const wmax = Math.max(...items.map(i => ctx.measureText(i[1]).width)) + 30;
  let x = left ? A.L + 10 : A.L + A.pw - wmax - 6, y = A.T + 12;
  ctx.globalAlpha = .82; ctx.fillStyle = C.surface; ctx.fillRect(x - 6, A.T + 3, wmax + 8, items.length * 17 + 4); ctx.globalAlpha = 1;
  for (const [col, txt, kind] of items) {
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.setLineDash(kind === 'dash' ? [5, 4] : kind === 'dot' ? [2, 3] : []);
    if (kind === 'box') { ctx.globalAlpha = .55; ctx.fillRect(x, y - 5, 18, 10); ctx.globalAlpha = 1; }
    else if (kind === 'pt') { ctx.beginPath(); ctx.arc(x + 9, y, 4, 0, 2 * Math.PI); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y); ctx.stroke(); }
    ctx.setLineDash([]); ctx.fillStyle = C.ink; ctx.fillText(txt, x + 24, y); y += 17;
  }
  ctx.restore();
}
// istogramma: conta i valori nelle classi
function makeHist(x0, x1, nb) { return { x0, x1, nb, w: (x1 - x0) / nb, c: new Float64Array(nb), shown: new Float64Array(nb), n: 0, out: 0, yMax: null }; }
function histAdd(H, x) { const b = Math.floor((x - H.x0) / H.w); if (b >= 0 && b < H.nb) H.c[b]++; else if (x === H.x1) H.c[H.nb - 1]++; else H.out++; H.n++; }
function histReset(H) { H.c.fill(0); H.shown.fill(0); H.n = 0; H.out = 0; H.yMax = null; }
// disegna le barre (in densità) che scivolano verso il valore attuale; restituisce gli assi
function drawHistDensity(ctx, w, h, H, o) {
  let hm = 0; const a = o.a ?? 1;
  for (let i = 0; i < H.nb; i++) { const t = H.n ? H.c[i] / (H.n * H.w) : 0; H.shown[i] += (t - H.shown[i]) * a; hm = Math.max(hm, t); }
  const yT = 1.12 * Math.max(hm, o.minTop || 0, 1e-12);
  H.yMax = H.yMax === null ? yT : H.yMax + (yT - H.yMax) * a;
  const A = axes(ctx, w, h, { x0: H.x0, x1: H.x1, y0: 0, y1: H.yMax, small: o.small, xlab: o.xlab, xStep: o.xStep, xFmt: o.xFmt });
  if (o.before) o.before(A);
  const bw = A.pw / H.nb, gap = bw > 5 ? 1 : 0;
  for (let i = 0; i < H.nb; i++) if (H.shown[i] > 0) {
    ctx.fillStyle = o.barColor ? o.barColor(H.x0 + (i + 0.5) * H.w) : C.bar;
    const y0 = Math.max(A.T, A.PY(H.shown[i])); ctx.fillRect(A.L + i * bw + gap / 2, y0, bw - gap, A.T + A.ph - y0);
  }
  return A;
}
function hexA(col, a) { // colore con trasparenza, per riempimenti
  const c = document.createElement('canvas').getContext('2d'); c.fillStyle = col; const s = c.fillStyle;
  if (s.startsWith('#')) { const r = parseInt(s.slice(1, 3), 16), g = parseInt(s.slice(3, 5), 16), b = parseInt(s.slice(5, 7), 16); return `rgba(${r},${g},${b},${a})`; }
  return s.replace(/rgba?\(([^)]+)\)/, (m, v) => `rgba(${v.split(',').slice(0, 3).join(',')},${a})`);
}
