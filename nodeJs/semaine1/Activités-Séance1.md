# Rapport d'Activités : Les Modules Node.js en Pratique

**Date :** 21/10/2025
**Nom et prénom :** MAKEA Lamya

---

## 1. Introduction

Ce rapport présente les résultats des activités pratiques sur les modules Node.js. L'objectif principal était de renforcer la compréhension de l'isolation des fichiers, la structuration modulaire d'un programme, et les mécanismes d'exportation/importation en Node.js.

---

## 2. Activité 1 : L'application qui casse à cause des variables globales

**Concept :** Comprendre l'utilité du système de modules

### Démarche et Code Implémenté

**Fichier `mathA.js` :**

```javascript
const PI = 3.14;

function calculerAire(rayon) {
  return PI * rayon * rayon;
}

console.log(calculerAire(2));
```

**Fichier `mathB.js` :**

```javascript
const PI = 3.14;

function calculerAire(rayon) {
  return PI * rayon * rayon;
}

console.log(calculerAire(2));
```

**Exécution séparée :**

```bash
node mathA.js  # Affiche: 12.56
node mathB.js  # Affiche: 12.56
```

**Fichier `app.js` (fusion des deux) :**

```javascript
const PI = 3.14;

function calculerAire(rayon) {
  return PI * rayon * rayon;
}

console.log(calculerAire(2));

// Deuxième déclaration
const PI = 3.14;

function calculerAire(rayon) {
  return PI * rayon * rayon;
}

console.log(calculerAire(2));
```

### Observations

Lors de l'exécution de `app.js`, une erreur se produit :

```
SyntaxError: Identifier 'PI' has already been declared
```

**Que se passe-t-il si plusieurs fichiers définissent les mêmes noms ?**

Lorsque deux fichiers définissent les mêmes noms de variables ou de fonctions et sont fusionnés dans un seul fichier, JavaScript génère une erreur de **redéclaration**. Avec `const` et `let`, on ne peut pas redéclarer une variable dans la même portée. Même avec `var`, la deuxième fonction écraserait la première.

**Pourquoi est-ce un problème dans un projet réel ?**

Dans un projet réel comportant de nombreux fichiers, l’absence de modularité peut entraîner divers problèmes : des conflits de noms surviennent lorsque plusieurs développeurs utilisent les mêmes variables ou fonctions, rendant la maintenance difficile et la provenance du code incertaine. Cela peut provoquer des bugs silencieux, où certaines fonctions sont écrasées sans avertissement. De plus, la réutilisation de code devient risquée, car importer des modules externes peut générer des conflits.

**Comment le système de modules de Node résout-il ce problème ?**

Node.js encapsule chaque fichier dans une **portée isolée**, garantissant que les variables locales d’un module ne polluent pas l’espace global. Chaque module contrôle explicitement ce qu’il expose grâce à `module.exports` et peut importer uniquement les éléments nécessaires à son fonctionnement via `require()`.

---

## 3. Activité 2 : Mon premier module utilitaire

**Concept :** Maîtriser `module.exports` et `require()`

### Démarche et Code Implémenté

**Structure du projet :**

```
/project
├── utilities/
│   └── greet.js
└── app.js
```

**Export d'une fonction unique**

**Fichier `utilities/greet.js` :**

```javascript
function saluer(name) {
  console.log(`Bonjour, ${name} !`);
}

module.exports = saluer;
```

**Fichier `app.js` :**

```javascript
const saluer = require("./utilities/greet");
saluer("Lamya");
```

**Résultat :**

```bash
node app.js
# Bonjour, Lamya !
```

### Analyse des Questions

**Quelle différence entre `module.exports = fonction` et `module.exports = { … }` ?**

`module.exports = fonction` sert à exporter une seule fonction, simple à importer et à utiliser directement, tandis que module.`exports = { … }` exporte un objet contenant plusieurs éléments, offrant plus de flexibilité pour regrouper plusieurs fonctions ou valeurs dans un même module.

**Dans quels cas préférez-vous l'un ou l'autre ?**

**Préférer `module.exports = fonction` quand :**
Cette approche est idéale lorsque le module a une **seule responsabilité claire**, selon le principe de responsabilité unique. Elle convient particulièrement à l’exportation d’une **classe** ou d’une **fonction constructeur**, lorsque l’usage du module est **évident et direct**. Ce type d’exportation simplifie l’importation et la lecture du code.

**Préférer `module.exports = { … }` quand :**
Cette méthode est recommandée lorsque le module regroupe **plusieurs fonctions liées** à un même domaine ou des **utilitaires connexes**. Elle permet d’exporter à la fois des **constantes** et des **fonctions**, offrant une **API claire** et organisée avec plusieurs méthodes disponibles.

---

## 4. Activité 3 : Explorateur de module

**Concept :** Observer la mécanique interne de Node (wrapper function)

**Étape 1 : Exploration des variables internes**

**Fichier `test.js` :**

```javascript
console.log(__filename);
console.log(__dirname);
console.log(module);
console.log(exports === module.exports);
```

**Résultat de l'exécution :**

```bash
node test.js
```

**Sortie :**

```
{
  id: '.',
  path: 'C:\\Users\\Lamya\\Desktop\\activité3',
  exports: {},
  filename: 'C:\\Users\\Lamya\\Desktop\\activité3\\test.js',
  loaded: false,
  children: [],
  paths: [
    'C:\\Users\\Lamya\\Desktop\\activité3\\node_modules',
    'C:\\Users\\Lamya\\Desktop\\node_modules',
    'C:\\Users\\Lamya\\node_modules',
    'C:\\Users\\node_modules',
    'C:\\node_modules'
  ],
  [Symbol(kIsMainSymbol)]: true,
  [Symbol(kIsCachedByESMLoader)]: false,
  [Symbol(kURL)]: undefined,
  [Symbol(kFormat)]: undefined,
  [Symbol(kIsExecuting)]: true
}
true
```

**Étape 2 : Ajout d'une fonction via exports**

**Fichier `test.js`:**

```javascript
console.log(__filename);
console.log(__dirname);
console.log(module);
console.log(exports === module.exports);

exports.direSalut = () => console.log("Salut !");
console.log(module.exports);
```

**Nouvelle sortie :**

```
{
  id: '.',
  path: 'C:\\Users\\Lamya\\Desktop\\activité3',
  exports: {},
  filename: 'C:\\Users\\Lamya\\Desktop\\activité3\\test.js',
  loaded: false,
  children: [],
  paths: [
    'C:\\Users\\Lamya\\Desktop\\activité3\\node_modules',
    'C:\\Users\\Lamya\\Desktop\\node_modules',
    'C:\\Users\\Lamya\\node_modules',
    'C:\\Users\\node_modules',
    'C:\\node_modules'
  ],
  [Symbol(kIsMainSymbol)]: true,
  [Symbol(kIsCachedByESMLoader)]: false,
  [Symbol(kURL)]: undefined,
  [Symbol(kFormat)]: undefined,
  [Symbol(kIsExecuting)]: true
}
true
{ direSalut: [Function (anonymous)] }
```

**Étape 3 : Import depuis un autre fichier**

**Fichier `main.js` :**

```javascript
const mod = require("./test");
mod.direSalut();
```

**Résultat :**

```bash
node main.js
```

```
{
  id: 'C:\\Users\\Lamya\\Desktop\\activité3\\test.js',
  path: 'C:\\Users\\Lamya\\Desktop\\activité3',
  exports: {},
  filename: 'C:\\Users\\Lamya\\Desktop\\activité3\\test.js',
  loaded: false,
  children: [],
  paths: [
    'C:\\Users\\Lamya\\Desktop\\activité3\\node_modules',
    'C:\\Users\\Lamya\\Desktop\\node_modules',
    'C:\\Users\\Lamya\\node_modules',
    'C:\\Users\\node_modules',
    'C:\\node_modules'
  ],
  [Symbol(kIsMainSymbol)]: false,
  [Symbol(kIsCachedByESMLoader)]: false,
  [Symbol(kURL)]: undefined,
  [Symbol(kFormat)]: undefined,
  [Symbol(kIsExecuting)]: true
}
true
{ direSalut: [Function (anonymous)] }
Salut !
```

**Que signifient `__filename`, `__dirname`, `module`, et `exports` ?**

`__filename` est une variable qui contient le **chemin absolu complet** du fichier en cours d’exécution. Cela peut être utile pour le **logging**, le débogage ou pour construire des chemins relatifs vers d’autres fichiers.

De son côté, `__dirname` contient le **chemin absolu du répertoire** où se trouve le fichier en cours. Cela permet de construire facilement des chemins vers des fichiers ou des ressources situés dans le même dossier ou des sous-dossiers.

`module` est un objet qui représente le **module actuel**. Il contient différentes informations importantes : l’identifiant du module (`id`), ce qui sera exporté (`exports`), le chemin du fichier (`filename`), l’état de chargement (`loaded`), les modules chargés par celui-ci (`children`) et le module qui l’a requis (`parent`).

`exports` est une **référence raccourcie** vers `module.exports` qui permet d’ajouter facilement des propriétés ou des fonctions à exporter.

**Pourquoi `exports = fonction()` ne fonctionne pas comme prévu ?**

Cette syntaxe **ne fonctionne PAS** car elle **réassigne la variable** `exports` au lieu de modifier l'objet `module.exports`.

**Quelle relation existe entre `exports` et `module.exports` ?**

Voici une version très courte et simple :

---

`exports` est juste une **référence** vers `module.exports`. On peut ajouter des propriétés avec `exports.x = ...`, mais si on réassigne complètement `exports`, ça casse la référence. Pour remplacer entièrement ce que le module exporte, il faut utiliser `module.exports`.

---

## 5. Activité 4 : Mini projet - Gestionnaire de contacts (CLI)

**Concept :** Appliquer la modularité dans un projet concret

### Objectif du Projet

Créer une application en ligne de commande permettant de gérer des contacts en appliquant les principes de modularité et de séparation des responsabilités.

### Architecture du Projet

```
/project-root
│
├── utils/
│   └── format.js
├── contactService.js
└── app.js
```

**Fichier `contactService.js` :**

```javascript
const contacts = [];

function ajouterContact(nom, telephone) {
  contacts.push({ nom, telephone });
}

function listerContacts() {
  return contacts;
}

module.exports = { ajouterContact, listerContacts };
```

**Fichier `utils/format.js` :**

```javascript
function formaterContact(contact) {
  return `${contact.nom} - ${contact.telephone}`;
}

module.exports = formaterContact;
```

**Fichier `app.js` :**

```javascript
const { ajouterContact, listerContacts } = require("./contactService");
const formaterContact = require("./utils/format");

ajouterContact("Alice", "0600000000");
ajouterContact("Bob", "0611111111");

listerContacts().forEach((c) => console.log(formaterContact(c)));
```

### Résultat de l'Exécution

```bash
node app.js
```

**Sortie :**

```
Alice - 0600000000
Bob - 0611111111
```

**Quelle est la responsabilité de chaque module ?**

Le module `contactService.js` est responsable de la gestion des données des contacts. Il stocke les contacts en mémoire et fournit une API pour les manipuler, encapsulant ainsi la logique de stockage. Ce module reste indépendant de l’affichage et peut facilement être étendu pour inclure des fonctionnalités supplémentaires comme la suppression, la recherche ou la validation des contacts.

Le fichier **`utils/format.js`** transforme les objets contacts en chaînes lisibles pour l’utilisateur, séparant ainsi la logique de formatage de la logique métier. Cela permet de modifier l’affichage sans impacter le service et d’ajouter différents formats de sortie tels que JSON, CSV ou tableau.

Enfin, **`app.js`** configure et initialise l’application, coordonne l’utilisation des différents modules et gère le flux d’exécution. Ce fichier sert de point d’entrée unique, garantissant un fonctionnement clair et structuré de l’ensemble de l’application.

**Pourquoi séparer le formatage, la logique et le point d'entrée ?**

On sépare le **formatage**, la **logique** et le **point d’entrée** pour que chaque module ait un rôle précis. `contactService.js` s’occupe uniquement des données des contacts, `utils/format.js` prépare leur affichage pour l’utilisateur, et `app.js` organise et coordonne tout le fonctionnement de l’application.

Ce qui rend le code **plus facile à comprendre, à tester et à modifier**, car on peut changer ou améliorer un module sans toucher aux autres. Elle permet aussi de **réutiliser les modules** dans différents contextes et de **faire évoluer l’application** en ajoutant facilement de nouvelles fonctionnalités.

**Comment cela faciliterait la maintenance à long terme ?**

Séparer les différentes parties de l’application facilite grandement la maintenance à long terme. Par exemple, si l’on souhaite changer le format d’affichage des contacts, il suffit de modifier le module de formatage, sans toucher à la logique métier ou au point d’entrée.
De même, l’ajout d’une persistance des données, comme une base de données, peut se faire uniquement dans le module qui gère les contacts, sans impacter l’affichage ni la coordination de l’application. Enfin, si l’on souhaite créer une nouvelle interface, comme une application web, les modules existants peuvent être réutilisés directement, sans réécrire la logique ou le formatage.

Donc ça va apporter plusieurs avantages : les modifications sont isolées, ce qui réduit le risque d’erreurs ; les nouveaux développeurs comprennent rapidement la structure ; le débogage devient plus simple, car chaque problème est localisé dans le module concerné ; et il est possible de réécrire ou d’ajouter des modules sans casser l’ensemble de l’application. Elle permet aussi d’étendre facilement les fonctionnalités, comme la validation des données, la recherche, la suppression de contacts ou la gestion de plusieurs formats d’affichage.
