# Rapport d'Activités : Node.js Partie 2 - Built-in Modules

**Date :** 21/10/2025
**Nom et prénom :** MAKEA Lamya

---

## 1. Introduction

Ce rapport présente les résultats des activités pratiques sur les modules intégrés (built-in) de Node.js. L'objectif principal était de maîtriser l'utilisation des modules natifs de Node.js pour interagir avec le système d'exploitation, le système de fichiers, gérer des événements et créer des serveurs HTTP.

---

## 2. Activité 1 : Diagnostic Machine

**Concept :** Utiliser le module OS pour accéder aux informations système

### Code Implémenté

**Fichier `diagnostic.js` :**

```javascript
const os = require("os");

console.log("Plateforme :", os.platform());
console.log("Architecture :", os.arch());
console.log("CPU :", os.cpus().length, "cœurs");
console.log("Mémoire totale :", os.totalmem());
console.log("Mémoire libre :", os.freemem());
console.log("Uptime (en heures) :", (os.uptime() / 3600).toFixed(2));
```

### Résultat de l'Exécution

```bash
node diagnostic.js
```

**Sortie:**

```
Plateforme : win32
Architecture : x64
CPU : 8 cœurs
Mémoire totale : 17015463936
Mémoire libre : 6310711296
Uptime (en heures) : 46.90
```

**Interprétation de mes résultats :**

- **Système :** Windows 64 bits
- **Processeur :** 8 cœurs disponibles
- **Mémoire totale :** 17015463936 octets ≈ **15.85 GB**
- **Mémoire libre :** 6310711296 octets ≈ **5.88 GB**
- **Temps de fonctionnement :** 46.90 heures ≈ **1.95 jours** sans redémarrage

### Réponses aux Questions de Discussion

**Quelle est la différence entre `os.platform()` et `os.arch()` ?**

La méthode `os.platform()` indique le **système d’exploitation** sur lequel Node.js est exécuté, comme Windows, Linux ou macOS. Elle est utile pour adapter le comportement d’une application selon l’environnement, par exemple pour choisir des chemins de fichiers ou des commandes spécifiques au système.

`os.arch()` renvoie l’**architecture du processeur** utilisée, telle que `x64` pour les systèmes 64 bits ou `arm` pour les processeurs ARM. Cette information permet de s’assurer que l’application charge les bons binaires ou modules natifs compatibles avec la machine.

**À quoi pourrait servir cette information dans une application réelle ?**

Ces informations peuvent être très utiles dans une application réelle, elles permettent par exemple de créer un **tableau de bord de monitoring** affichant l’état du système, comme l’utilisation mémoire, le nombre de processeurs ou le temps d’activité. Elles servent aussi à **optimiser les performances**, en adaptant automatiquement le nombre de processus selon les ressources disponibles. De plus, elles aident à **détecter des ressources insuffisantes**, comme une faible mémoire, pour déclencher des alertes ou nettoyer le cache.

---

## 3. Activité 2 : Explorateur de fichiers

**Concept :** Lire des fichiers de manière asynchrone et comprendre les callbacks

### Code Implémenté

**Fichier `explorateur.js` :**

```javascript
const fs = require("fs");
const path = require("path");

fs.readdir(__dirname, (err, files) => {
  if (err) return console.error("Erreur :", err.message);
  console.log("Contenu du dossier :", files);

  files.forEach((f) => console.log(path.join(__dirname, f)));
});
```

**Variante : Écriture dans un fichier log**

```javascript
const fs = require("fs");
const path = require("path");

fs.readdir(__dirname, (err, files) => {
  if (err) return console.error("Erreur :", err.message);

  const logMessage = `[${new Date().toISOString()}] Nombre de fichiers : ${
    files.length
  }\n`;

  fs.appendFile("log.txt", logMessage, (err) => {
    if (err) return console.error("Erreur d'écriture :", err.message);
    console.log("Log enregistré avec succès !");
  });

  files.forEach((f) => console.log(path.join(__dirname, f)));
});
```

### Résultat de l'Exécution

```bash
node explorateur.js
```

**Sortie:**

```
Contenu du dossier : [
  'app.js',
  'diagnostic.js',
  'eventMonitor.js',
  'explorateur.js',
  'logger.js',
  'server.js'
]
C:\Users\Lamya\Desktop\activité1-2\app.js
C:\Users\Lamya\Desktop\activité1-2\diagnostic.js
C:\Users\Lamya\Desktop\activité1-2\eventMonitor.js
C:\Users\Lamya\Desktop\activité1-2\explorateur.js
C:\Users\Lamya\Desktop\activité1-2\logger.js
C:\Users\Lamya\Desktop\activité1-2\server.js
PS C:\Users\Lamya\Desktop\activité1-2> node explorateur.js
C:\Users\Lamya\Desktop\activité1-2\app.js
C:\Users\Lamya\Desktop\activité1-2\diagnostic.js
C:\Users\Lamya\Desktop\activité1-2\eventMonitor.js
C:\Users\Lamya\Desktop\activité1-2\explorateur.js
C:\Users\Lamya\Desktop\activité1-2\logger.js
C:\Users\Lamya\Desktop\activité1-2\server.js
Log enregistré avec succès !
```

**Contenu de `log.txt` :**

```
[2025-10-21T20:53:08.326Z] Nombre de fichiers : 6
```

---

## 4. Activité 3 : Moniteur d'événements

**Concept :** Créer et écouter des événements avec `EventEmitter`

### Code Implémenté

**Fichier `eventMonitor.js` :**

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

// Enregistrement d'un listener
emitter.on("utilisateurConnecté", (data) => {
  console.log(`Nouvelle connexion : ${data.nom} (${data.id})`);
});

// Émission d'un événement
emitter.emit("utilisateurConnecté", { id: 1, nom: "Asma" });
```

### Résultat de l'Exécution

```bash
node eventMonitor.js
```

**Sortie :**

```
Nouvelle connexion : Asma (1)
```

### Réponses aux Questions de Discussion

**Que se passe-t-il si l’écouteur est enregistré après l’émission de l’événement ?**

Si l’écouteur est ajouté après l’émission de l’événement, celui-ci est perdu, car les événements en Node.js ne sont pas mis en file d’attente ni rejoués. Il faut donc toujours enregistrer les écouteurs avant d’émettre un événement.

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

// emission avant l'enregistrement
emitter.emit("utilisateurConnecté", { id: 1, nom: "Asma" });

// Écouteur enregistré après
emitter.on("utilisateurConnecté", (data) => {
  console.log(`Nouvelle connexion : ${data.nom}`);
});
```

---

**Peut-on avoir plusieurs écouteurs pour un même événement ?**

Oui, un même événement peut avoir plusieurs écouteurs, exécutés dans l’ordre d’enregistrement. Ce qui permet de séparer les différentes actions comme la journalisation, la notification ou l’analyse.

```javascript
const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("utilisateurConnecté", (data) => {
  console.log(`[LOG] Connexion de ${data.nom}`);
});

emitter.on("utilisateurConnecté", (data) => {
  console.log(`[NOTIFICATION] Bienvenue ${data.nom} !`);
});

emitter.on("utilisateurConnecté", (data) => {
  console.log(`[ANALYTICS] User ${data.id} logged in`);
});

emitter.emit("utilisateurConnecté", { id: 1, nom: "Asma" });
```

**Résultat :**

```
[LOG] Connexion de Asma
[NOTIFICATION] Bienvenue Asma !
[ANALYTICS] User 1 logged in
```

---

## 5. Activité 4 : Classe de Journalisation (Logger)

**Concept :** Étendre `EventEmitter` pour construire un composant réutilisable

### Code Implémenté

**Fichier `logger.js`:**

```javascript
// Importons la classe EventEmitter depuis le module events
const EventEmitter = require("events");

// Création d'une classe Logger qui hérite de EventEmitter, "extends" permet d'hériter de toutes les méthodes d'EventEmitter
class Logger extends EventEmitter {
  // Méthode pour journaliser un message
  log(message) {
    console.log("LOG :", message);

    // Émission d'un événement messageLogged
    // on a this.emit() est disponible car Logger hérite d'EventEmitter
    // On passe un objet contenant le message et la date actuelle
    this.emit("messageLogged", { message, date: new Date() });
  }
}

// Export de la classe Logger pour utilisation dans d'autres modules
module.exports = Logger;
```

**Fichier `app.js`:**

```javascript
// Importation de la classe Logger depuis le module logger.js
const Logger = require("./logger");

// Création d'une instance de Logger qui hérite de toutes les capacités d'EventEmitter
const logger = new Logger();

// Enregistrement d'un écouteur sur l'événement "messageLogged"
// il sera appelé chaque fois qu'un message est journalisé
logger.on("messageLogged", (data) => {
  console.log("Événement capturé :", data);
});

// Appel de la méthode log() pour afficher "LOG : Application démarrée !" puis emettre un événement "messageLogged" ensuite elle déclenche l'écouteur enregistré ci-dessus
logger.log("Application démarrée !");
```

### Résultat de l'Exécution

```bash
node app.js
```

**Sortie :**

```
LOG : Application démarrée !
Événement capturé : {
  message: 'Application démarrée !',
  date: 2025-10-21T21:00:30.123Z
}
```

### Réponses aux Questions de Discussion

**Quelle est la différence entre une instance directe d’`EventEmitter` et une classe qui l’étend ?**

Une instance directe d’`EventEmitter` permet d’émettre et d’écouter des événements, mais sa logique reste externe au code principal. Elle ne favorise pas l’encapsulation, la réutilisabilité ni la maintenabilité, car tout le traitement se fait avec des variables et fonctions globales.

**classe qui étend `EventEmitter`** permet d’intégrer cette logique directement dans la classe, offrant une meilleure organisation du code, la possibilité d’ajouter des méthodes personnalisées, de gérer un état interne pour chaque instance et de faciliter les tests.

**Pourquoi encapsuler la logique dans une classe ?**

Encapsuler la logique dans une classe permet d’appliquer le **principe de responsabilité unique**, en isolant clairement le rôle du composant. Cela rend le code **plus réutilisable**, **extensible** et **testable**, tout en garantissant une **isolation** entre les différentes instances pour éviter les interférences entre modules.

---

## 6. Activité 5 : Serveur Node minimaliste

**Concept :** Créer un serveur HTTP simple avec routage

### Code Implémenté

**Fichier `server.js` (avec commentaires) :**

```javascript
// Importation du module HTTP intégré de Node.js
const http = require("http");

// Création du serveur HTTP
// le createServer() prend une fonction callback qui sera appelée à chaque requête
const server = http.createServer((req, res) => {
  // Routage basé sur l'URL de la requête
  if (req.url === "/") {
    // Route principale (page d'accueil) avec write() envoie du contenu au client
    res.write("Bienvenue sur notre serveur Node.js !");
    // end() termine la réponse et l'envoie au client
    res.end();
  } else if (req.url === "/api/etudiants") {
    // Route API qui rtourne des données JSON
    // writeHead() définit le code de statut (200 = OK) et les en-têtes HTTP
    res.writeHead(200, { "Content-Type": "application/json" });
    // Conversion d'un tableau JavaScript en JSON et envoi
    res.end(JSON.stringify(["Asma", "Youness", "Oussama"]));
  } else {
    // 404 = code HTTP pour "Not Found"
    res.writeHead(404);
    res.end("Page non trouvée");
  }
});

// Le serveur écoute sur le port 3000
// Lorsque le serveur démarre, le callback est exécuté
server.listen(3000, () => console.log("Serveur en écoute sur le port 3000..."));
```

### Résultat de l'Exécution

**Démarrage du serveur :**

```bash
node server.js
```

**Sortie console :**

```
Serveur en écoute sur le port 3000...
```

**Tests dans le navigateur :**

**1. Route principale - `http://localhost:3000/` :**

```
Bienvenue sur notre serveur Node.js !
```

**2. Route API - `http://localhost:3000/api/etudiants` :**

```json
["Asma", "Youness", "Oussama"]
```

**3. Route inconnue - `http://localhost:3000/autre` :**

```
Page non trouvée
```

---

## 7. Activité 6 : Combinaison finale

**Concept :** Combiner les concepts appris pour simuler une vraie application serveur

### Objectif

Créer un serveur qui enregistre chaque requête dans un fichier log en utilisant :

- Une classe Logger personnalisée héritant d'EventEmitter
- Le système de fichiers pour la persistance
- Un serveur HTTP pour recevoir les requêtes

### Code Implémenté

**Fichier `logger.js`:**

```javascript
// Importation du module fs pour écrire dans les fichiers
const fs = require("fs");
// Importation de la classe EventEmitter
const EventEmitter = require("events");

// Classe Logger héritant d'EventEmitter qui combine les capacités d'événements avec l'écriture de fichiers
class Logger extends EventEmitter {
  // Méthode pour journaliser un message
  log(message) {
    // Écriture SYNCHRONE dans le fichier log.txt
    // appendFileSync ajoute à la fin sans écraser le contenu existant
    fs.appendFileSync("log.txt", message + "\n");

    // Émission d'un événement pour notifier que le log est enregistré
    // On passe un objet avec le message et la date actuelle
    this.emit("messageLogged", { message, date: new Date() });
  }
}

// Export de la classe pour utilisation dans d'autres modules
module.exports = Logger;
```

**Fichier `app.js` (avec commentaires) :**

```javascript
// Importation du module HTTP pour créer un serveur
const http = require("http");
// Importation de notre classe Logger personnalisée
const Logger = require("./logger");

// Création d'une instance de Logger
const logger = new Logger();

// Enregistrement d'un écouteur sur l'événement messageLogged, ce callback sera appelé chaque fois qu'un message est journalisé
logger.on("messageLogged", (data) => console.log("Événement capturé :", data));

// Création du serveur HTTP
// Pour chaque requête reçue, cette fonction sera exécutée
const server = http.createServer((req, res) => {
  // Journalisation de la requête reçue
  // Le message contient l'URL de la requête
  logger.log(`Requête reçue : ${req.url}`);

  // Réponse envoyée au client
  res.end("Requête enregistrée !");
});

// Le serveur écoute sur le port 4000
// Le callback affiche un message de confirmation au démarrage
server.listen(4000, () => console.log("Serveur sur le port 4000..."));
```

### Résultat de l'Exécution

**Démarrage du serveur :**

```bash
node app.js
```

**Sortie console :**

```
Serveur sur le port 4000...
```

**Tests avec différentes URLs :**

**1. Navigateur : `http://localhost:4000/` :**

- **Affichage navigateur :** `Requête enregistrée !`
- **Console serveur :**

```
Événement capturé : {
  message: 'Requête reçue : /',
  date: 2025-10-21T11:21:30.123Z
}
```

**2. Navigateur : `http://localhost:4000/api/test` :**

- **Affichage navigateur :** `Requête enregistrée !`
- **Console serveur :**

```
Événement capturé : {
  message: 'Requête reçue : /api/test',
  date: 2025-10-21T11:21:35.456Z
}
```

**3. Navigateur : `http://localhost:4000/contact` :**

- **Affichage navigateur :** `Requête enregistrée !`
- **Console serveur :**

```
Événement capturé : {
  message: 'Requête reçue : /contact',
  date: 2025-10-21T11:21:40.789Z
}
```

**Contenu du fichier `log.txt` après les tests :**

```
Requête reçue : /
Requête reçue : /api/test
Requête reçue : /contact
Requête reçue : /favicon.ico
Requête reçue : /
```

> `/favicon.ico` apparaît car les navigateurs demandent automatiquement cette icône.
