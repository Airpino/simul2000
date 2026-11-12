# Simul2000 · Simulations in Statistics

An interactive teaching program on simulation techniques in statistics, by Marcello Chiodi (Università di Palermo).
The original version, written in Visual Basic, dates from 1995–2003; this is its rewrite for the web browser (2026), in Italian and English.

The simulations show the individual samples and their estimates dynamically, compared with the true values of the parameters, as an intuitive way into sampling distributions, the central limit theorem and inference in regression.

## Opening it

Every page is a single self-contained HTML file: nothing needs to be installed.

- Italian version: open `index.html`.
- English version: open `en/index.html`.

Each page has a button at the top to switch to the same page in the other language, a “? Help” button that opens the help page of the module, a “Main menu” button, a choice of light or dark background, and (in the modules) a “Save image” button that saves the charts together with the parameters and results of the simulation.

The pages also work offline; without a connection the browser simply uses its system fonts.

## Modules

| File | Module |
| --- | --- |
| `simul_univariata.html` | Random number generation from ten univariate distributions, with an X² goodness-of-fit test |
| `simul_medie.html` | Sampling distributions of means |
| `simul_montecarlo.html` | Monte Carlo integration (hit or miss and sample-mean methods) |
| `simul_inversione.html` | Generation methods: inverting the distribution function |
| `simul_regressione.html` | Simulation of regression relationships, with L<sub>p</sub>-norm regression |
| `simul_glm.html` | Simulation of generalised linear models |
| `simul_arma.html` | Simulation of ARMA and ARIMA models |
| `simul_bivariate.html` | Simulation of bivariate distributions, with a three-dimensional histogram |
| `simul_regressione_interattiva.html` | Interactive linear regression |
| `simul_massima_verosimiglianza.html` | New module: the arithmetic mean and the maximum likelihood estimator compared |
| `simul_intervalli.html` | Inference: coverage of confidence intervals (mean and proportion), type I and II errors, power of tests |
| `simul_bayes.html` | Inference: Bayesian updating with conjugate priors (beta, normal, gamma), credible intervals and their frequentist properties |
| `simul_nonparametrica.html` | Inference: bootstrap, permutation tests, Wilcoxon-Mann-Whitney versus t |
| `aiuto.html` | General help |
| `aiuto_*.html` | Help for each module: what it shows, how to use it, teaching suggestions, technical details |
| `simul2000_guida.html` | The original online help, recovered from the WinHelp file |
| `helpsimul2003.pdf` | The 2003 manual (in Italian), with screenshots of the original program |

## Technical notes

- The three inference modules (2026) and their help pages are generated, in Italian and English, from the single-source templates in `build/src/` (`{{italiano|English}}` markers): after editing them run `python3 build/build.py .` from the repository folder. `build/patch_existing.py` adds the new modules to the main menu and to the help index.

- Pseudo-random numbers are generated in the browser with a multiplicative congruential generator (Park and Miller); the same seed repeats the same simulation.
- No data is sent anywhere: all computation happens on the user’s computer.

## Contact

Marcello Chiodi · marcello.chiodi@unipa.it · http://www.marcellochiodi.com
