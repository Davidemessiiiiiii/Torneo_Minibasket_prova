const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const ADMIN_PASSWORD = "$2b$10$zRHdMX7ns0LnlZd2U1Wzqer1vngYt8K47/UL4ryVf45OvxffnV6mS";

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Funzione di utilità per leggere i dati
function leggiDati() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Funzione di utilità per salvare i dati
function salvaDati(dati) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dati, null, 2));
}

// LOGIN
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: "ok-admin" });
  }

  res.status(401).json({ success: false });
});

// GET - tutte le partite
app.get('/api/partite', (req, res) => {
  const dati = leggiDati();
  res.json(dati.partite);
});

// GET - tutti i gironi
app.get('/api/gironi', (req, res) => {
  const dati = leggiDati();
  res.json(dati.gironi);
});

// PUT - aggiorna risultato di una partita
app.put('/api/partite/:id', (req, res) => {
  const dati = leggiDati();
  const id = parseInt(req.params.id);
  const { puntiCasa, puntiOspiti, quarti, giocata, live, quartoAttuale } = req.body;

  const partita = dati.partite.find(p => p.id === id);
  if (!partita) {
    return res.status(404).json({ errore: 'Partita non trovata' });
  }

  partita.puntiCasa = Number.isFinite(puntiCasa) ? puntiCasa : null;
  partita.puntiOspiti = Number.isFinite(puntiOspiti) ? puntiOspiti : null;
  partita.quarti = quarti ?? partita.quarti;
  partita.giocata = giocata ?? partita.giocata;
  partita.live = live ?? partita.live;
  partita.quartoAttuale = quartoAttuale ?? partita.quartoAttuale;

  salvaDati(dati);
  res.json(partita);
});

//PER RESETTARE TUTTO INDEX.HTML IN CASO DI ERRORE
app.post('/api/reset', (req, res) => {
  const dati = leggiDati();

  dati.partite.forEach(p => {
    p.puntiCasa = null;
    p.puntiOspiti = null;
    p.quarti = [null, null, null, null, null, null];
    p.giocata = false;
    p.live = false;
    p.quartoAttuale = 1;
  });

  salvaDati(dati);
  res.json({ ok: true, message: "Torneo resettato" });
});

app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

