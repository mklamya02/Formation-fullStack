# Rapport d'Activités : Express.js et APIs REST

**Date :** 2/11/2025
**Nom et prénom :** MAKEA Lamya
**Durée totale :** Environ 3 heures

---

## 1. Introduction

Ces activités ont comme objectifs de renforcer la compréhension et la mise en pratique des concepts fondamentaux d’Express.js :
- La création d'un serveur Express basique
- Le système de routing pour les APIs REST
- Le concept et l'utilisation des middlewares
- La gestion des erreurs
- Le service de fichiers statiques et la manipulation de JSON



---

## 2. Activité 1 : Hello Express!

**Objectif :** Découvrir le fonctionnement de base d'un serveur Express.js

**1. Création du fichier `server.js` :**
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express');
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));
```

**2. Lancement du serveur :**
```bash
node server.js
```

**Sortie console :**
```
Serveur en écoute sur http://localhost:3000
```

**3. Test dans le navigateur :**
- URL : `http://localhost:3000`
- **Résultat :** La page affiche "Bienvenue sur mon premier serveur Express"

### Réponses aux Questions

**Quelle différence avec ton serveur Node.js natif (Semaine 1) ?**

Je trouve que créer un serveur avec Express est beaucoup plus simple qu’avec le module HTTP natif de Node.js, surtout pour gérer les routes et les réponses.
Express s’occupe automatiquement de beaucoup de choses comme les en-têtes, les codes de statut ou les erreurs, ce qui évite d’écrire du code supplémentaire.

---

## 3. Activité 2 : Premières routes REST

**Objectif :** Créer plusieurs routes REST pour représenter des ressources produits

### Code Implémenté

**Fichier `server.js` (mis à jour) :**
```javascript
const express = require('express');
const app = express();

// Route d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express');
});

// Route pour obtenir tous les produits
app.get('/api/products', (req, res) => {
    res.json([
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Phone' }
    ]);
});

// Route pour obtenir un produit spécifique par son ID
app.get('/api/products/:id', (req, res) => {
    res.json({ message: `Produit ${req.params.id}` });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));
```

### Tests Effectués

**1. Test de la liste des produits :**
```bash
curl http://localhost:3000/api/products
```

**Résultat :**
```json
[
  {"id":1,"name":"Laptop"},
  {"id":2,"name":"Phone"}
]
```

**2. Test d'un produit spécifique :**
```bash
curl http://localhost:3000/api/products/2
```

**Résultat :**
```json
{"message":"Produit 2"}
```


### Réponses aux Questions

**Qu'apporte le format JSON ?**
Le format JSON permet d’échanger des données facilement entre le serveur et le client. Les informations sont mieux organisées et peuvent être utilisées directement sans avoir à tout analyser manuellement.

**Pourquoi chaque ressource a-t-elle sa propre route (/api/products/:id) ?**

Chaque ressource a sa propre route pour que l’API soit claire et bien organisée. Par exemple, `/api/products` permet d’obtenir tous les produits, et `/api/products/:id` donne les détails d’un produit spécifique. Donc le paramètre `:id` rend la route dynamique, ce qui évite de créer une route différente pour chaque produit.

---

## 4. Activité 3 : Introduction aux Middlewares

**Objectif :** Comprendre le rôle des middlewares dans la chaîne de traitement des requêtes

### Code Implémenté

**Fichier `server.js` (mis à jour avec middlewares) :**
```javascript
const express = require('express');
const app = express();

// middleware 1 : Logger global
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// middleware 2 : Ajouter le temps de début
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express');
});

app.get('/api/products', (req, res) => {
    res.json([
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Phone' }
    ]);
});

app.get('/api/products/:id', (req, res) => {
    res.json({ message: `Produit ${req.params.id}` });
});

// Route pour tester la durée
app.get('/ping', (req, res) => {
    const duration = Date.now() - req.startTime;
    res.json({
        message: 'pong',
        duration: `${duration}ms`
    });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));
```

### Observations lors des Tests

** Test de la route `/ping` :**
```bash
curl http://localhost:3000/ping
```

**Réponse :**
```json
{"message":"pong","duration":"2ms"}
```

### Réponses aux Questions

**Que fait `next()` ?**
`next()` permet à Express de passer d’un middleware à un autre ou à la route suivante.

**Différence entre un middleware global et spécifique à une route**
Un middleware global créé avec `app.use()` s’exécute pour toutes les routes. On l’utilise par exemple pour afficher des logs, vérifier une authentification ou gérer les erreurs.
Mais un middleware spécifique s’applique seulement à une ou plusieurs routes précises.

**Pourquoi les middlewares sont essentiels dans Express ?**
Les middlewares permettent de réutiliser le code, d’organiser le serveur et de séparer les différentes tâches (authentification, logs, gestion d’erreurs).


### Donc ce que j’ai appris

* `next()` permet de continuer vers la suite du traitement.
* `app.use()` sert à créer un middleware global.
* Les middlewares peuvent ajouter des informations à `req` ou modifier la réponse.



---

## 5. Activité 4 : Gestion d'erreurs Express

**Objectif :** Mettre en place un middleware de gestion d'erreurs

### Code Implémenté

**Fichier `server.js` (avec gestion d'erreurs) :**
```javascript
const express = require('express');
const app = express();

// Middlewares existants
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Routes normales
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon premier serveur Express');
});

app.get('/api/products', (req, res) => {
    res.json([
        { id: 1, name: 'Laptop' },
        { id: 2, name: 'Phone' }
    ]);
});

// Route qui simule une erreur
app.get('/api/crash', (req, res, next) => {
    const err = new Error('Erreur simulée');
    next(err);  // On passe l'erreur au middleware d'erreur
});

app.get('/ping', (req, res) => {
    const duration = Date.now() - req.startTime;
    res.json({ message: 'pong', duration: `${duration}ms` });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Erreur détectée :', err.message);
    res.status(500).json({ error: err.message });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));
```

### Tests Effectués

**Test de la route qui génère une erreur :**
```bash
curl http://localhost:3000/api/crash
```

**Réponse reçue :**
```json
{
  "error": "Erreur simulée"
}
```

## Réponses aux Questions

**Pourquoi le middleware d’erreur doit-il être placé en dernier ?**
Le middleware d’erreur doit toujours être placé à la fin car Express exécute le code dans l’ordre où il est écrit.
Et puisque les middlewares et routes sont lus de haut en bas, donc le gestionnaire d’erreur ne doit intervenir qu’après tous les autres.


**Quelle est la différence entre `throw new Error()` et `next(err)` ?**
`throw new Error()` provoque une erreur immédiate qui peut faire planter le serveur, alors que `next(err)` envoie l’erreur au middleware d’erreur pour qu’elle soit gérée proprement.


---

## 6. Activité 5 : Fichiers statiques et JSON

**Objectif :** Apprendre à servir des fichiers statiques et à manipuler des fichiers JSON

### Structure du Projet

```
hello-express/
├── node_modules/
├── public/
│   ├── index.html
│   └── logo.png
├── data/
│   └── products.json
├── server.js
└── package.json
```

### Code Implémenté

**1. Fichier `public/index.html` :**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Serveur Express</title>
</head>
<body>
    <h1>Bienvenue sur le serveur Express</h1>
    <p>Ceci est une page HTML servie en tant que fichier statique !</p>
    <img src="logo.png" alt="Logo" width="200">
</body>
</html>
```

**2. Fichier `data/products.json` :**
```json
[
    {
        "id": 1,
        "name": "Laptop"
    },
    {
        "id": 2,
        "name": "Headphones"
    }
]
```

**3. Fichier `server.js`:**
```javascript
const express = require('express');
const fs = require('fs');
const app = express();

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));


app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Route qui lit le fichier JSON
app.get('/api/products', (req, res) => {
    const data = fs.readFileSync('./data/products.json');
    const products = JSON.parse(data);
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const data = fs.readFileSync('./data/products.json');
    const products = JSON.parse(data);
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Produit non trouvé' });
    }
});

// Route qui simule une erreur
app.get('/api/crash', (req, res, next) => {
    const err = new Error('Erreur simulée');
    next(err);
});

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Erreur détectée :', err.message);
    res.status(500).json({ error: err.message });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));
```

### Tests Effectués

**1. Test de la page HTML statique :**
- Navigateur : `http://localhost:3000/index.html`
- **Résultat :** La page HTML s'affiche avec le titre et l'image

**2. Test de l'image :**
- Navigateur : `http://localhost:3000/logo.png`
- **Résultat :** L'image s'affiche directement

**3. Test de l'API products :**
```bash
curl http://localhost:3000/api/products
```

**Résultat :**
```json
[
  {
    "id": 1,
    "name": "Laptop"
  },
  {
    "id": 2,
    "name": "Headphones"
  }
]
```

**4. Test d'un produit spécifique :**
```bash
curl http://localhost:3000/api/products/1
```

**Résultat :**
```json
{
  "id": 1,
  "name": "Laptop"
}
```

**5. Test d'un produit qui n'existe pas :**
```bash
curl http://localhost:3000/api/products/5
```

**Résultat :**
```json
{
  "error": "Produit non trouvé"
}
```

### Réponses aux Questions

**Différence entre servir un fichier statique et lire un fichier JSON**
Servir un fichier statique avec `express.static()` consiste à envoyer un fichier tel quel au client sans le modifier.
Lire un fichier JSON avec `fs.readFile()` ou `fs.readFileSync()` permet d’accéder à son contenu, de le transformer en objet JavaScript, et éventuellement de le filtrer ou modifier avant de l’envoyer au client.
Les fichiers statiques sont donc envoyés directement, tandis que les fichiers JSON sont souvent utilisés comme source de données pour une API.

**Pourquoi `readFileSync` n’est pas recommandé en production**
`readFileSync` bloque l’exécution du serveur tant que le fichier est lu. Si une lecture bloque le serveur, les autres utilisateurs doivent attendre, ce qui ralentit tout le système.
C’est pourquoi on utilise plutôt la version asynchrone `fs.readFile()` ou `fs.promises.readFile()` qui permet de lire les fichiers sans bloquer le reste du serveur.

**Utilisation de `fs.promises` avec `async/await`**
Avec `fs.promises` on peut écrire un code non bloquant grâce à `async/await`.

### Ce que j’ai appris de cette activité

* `express.static()` sert les fichiers sans les modifier.
* `fs.readFileSync()` bloque le serveur, donc à éviter.
* Les versions asynchrones (`fs.readFile` ou `fs.promises`) sont plus performantes.
* On peut combiner fichiers statiques et API dans une même application.
