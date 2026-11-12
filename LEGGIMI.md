# Simul2000 · Simulazioni in Statistica

Programma didattico interattivo sulle tecniche di simulazione in statistica, di Marcello Chiodi.
La versione originale, in Visual Basic, risale agli anni 1995–2003; questa è la sua riscrittura per il browser (2026).

È disponibile anche in inglese, nella sottocartella `en`.

Le simulazioni mostrano dinamicamente i singoli campioni e le stime, confrontati con i veri valori dei parametri, per introdurre in modo intuitivo distribuzioni campionarie, teorema limite centrale e inferenza nella regressione.

## Come si apre

Ogni pagina è un unico file HTML autonomo: non serve installare nulla.

1. Scompattare la cartella `Simul2000_webversion2026`.
2. Aprire `index.html` con un browser (Safari, Chrome, Firefox, Edge).
3. Dalla pagina iniziale si sceglie il modulo; da ogni modulo si torna all’indice con il pulsante «Menu iniziale» in alto.
4. In alto in ogni pagina si sceglie lo sfondo: automatico (come il sistema), chiaro o scuro. La scelta vale per tutte le pagine e resta memorizzata.
5. Nei moduli, il pulsante «Salva immagine» crea un file PNG con i grafici visibili, il titolo e i parametri della simulazione, le tabelle dei risultati e la data.
6. Il pulsante «English» in alto apre la stessa pagina in inglese; nella versione inglese, «Italiano» riporta a quella italiana.
7. Il pulsante «? Guida» apre la guida del modulo; dalla pagina iniziale apre la guida generale. Il tasto Invio fa partire la simulazione dal quadro delle scelte, e poi equivale ad «Avvia» / «Pausa».

Funziona anche senza connessione a internet: in quel caso il browser usa i suoi caratteri di sistema al posto di quelli previsti.

## Contenuto della cartella

| File | Contenuto |
| --- | --- |
| `index.html` | Pagina iniziale con il menu dei moduli |
| `simul_univariata.html` | Generazione di numeri casuali da dieci distribuzioni univariate, con test X² |
| `simul_medie.html` | Distribuzioni campionarie di medie |
| `simul_montecarlo.html` | Integrazione con il metodo Montecarlo (hit or miss e metodo della media) |
| `simul_inversione.html` | Metodi di generazione: inversione della funzione di ripartizione |
| `simul_regressione.html` | Simulazione di relazioni di regressione, con la regressione in norma p |
| `simul_glm.html` | Simulazione di modelli lineari generalizzati |
| `simul_arma.html` | Simulazione di modelli ARMA e ARIMA |
| `simul_bivariate.html` | Simulazione di distribuzioni bivariate, con istogramma tridimensionale |
| `simul_regressione_interattiva.html` | Regressione lineare interattiva |
| `simul_massima_verosimiglianza.html` | Nuovo modulo: media e stimatore di massima verosimiglianza a confronto |
| `aiuto.html` | Guida generale del programma |
| `aiuto_*.html` | Guida di ciascun modulo: che cosa mostra, come si usa, suggerimenti per la didattica, dettagli tecnici |
| `simul2000_guida.html` | Testi della guida in linea originale (WinHelp), convertiti per il browser |
| `helpsimul2003.pdf` | Il manuale del 2003, con le schermate della versione originale |
| `en/` | La versione inglese di tutte le pagine, con gli stessi nomi di file |

## Pubblicazione su GitHub Pages

1. Creare un repository pubblico su GitHub e caricarvi il contenuto di questa cartella, con `index.html` nella radice.
2. Nelle impostazioni del repository, sezione *Pages*, scegliere come sorgente il ramo principale e la cartella radice.
3. Dopo qualche minuto il sito è disponibile all’indirizzo `https://NOME-UTENTE.github.io/NOME-REPOSITORY/`.

## Note tecniche

- I numeri pseudo-casuali sono generati nel browser con un generatore congruenziale moltiplicativo (Park e Miller); con lo stesso seme si ripete la stessa simulazione.
- Nessun dato viene inviato altrove: tutto il calcolo avviene sul computer di chi usa la pagina.
- Le scelte dei colori, comprese quelle adatte a chi ha difficoltà a distinguere il rosso dal verde, restano memorizzate nel browser.

## Contatti

Marcello Chiodi · marcello.chiodi@unipa.it · http://www.marcellochiodi.com
