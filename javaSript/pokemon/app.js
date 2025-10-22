// Constantes et configuration
const API_BASE = "https://pokeapi.co/api/v2"; // URL de l'API
const DEFAULT_TIMEOUT_MS = 8000; // timeout par défaut en millisecondes

// Sélection des éléments du DOM
const formEl = document.querySelector("#search-form");
const inputEl = document.querySelector("#q");
const searchBtn = document.querySelector("#search-btn");
const surpriseBtn = document.querySelector("#surprise-me");
const cancelBtn = document.querySelector("#cancel");
const statusEl = document.querySelector("#status");
const cardEl = document.querySelector("#card");
const spriteEl = document.querySelector("#sprite");
const nameEl = document.querySelector("#name");
const idEl = document.querySelector("#ident");
const typesEl = document.querySelector("#types");
const statsEl = document.querySelector("#stats");
const flavorEl = document.querySelector("#flavor");
const historyListEl = document.querySelector("#history-list");


// Etat local de l'application
let inFlightController = null; // AbortController pour annuler la requête en cours.
const pokemonCacheById = new Map(); // cache simple (Map) pour éviter de recharger deux fois la même ressource.
const lastSearches = []; // petite liste mémoire des dernières recherches affichées.

// Mise à jour du message de statut affiché à l'utilisateur.
// `statusEl` est un élément DOM (par ex. un <div>) où l'on écrit du texte.
function setStatus(message) {
  statusEl.textContent = message || "";
}

// Normalise la chaîne de recherche entrée par l'utilisateur.
// - supprime les espaces autour (`trim`)
// - si c'est un nombre entier, on renvoie la version numérique en string (ex: "25")
// - sinon on renvoie en minuscules pour rendre la recherche insensible à la casse
function normalizeQuery(query) {
  if (!query) return "";
  const trimmed = String(query).trim();
  if (/^\d+$/.test(trimmed)) return String(parseInt(trimmed, 10));
  return trimmed.toLowerCase();
}

// Contrainte une valeur entre min et max. Utile pour bornes (ex: pour une barre de progression).
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Récupère le texte de description (flavor text) en anglais depuis l'endpoint "species".
// `flavorEntries` est un tableau d'objets contenant le texte et la langue.
function pickEnglishFlavor(flavorEntries) {
  if (!Array.isArray(flavorEntries)) return "";
  const entry = flavorEntries.find(
    (e) => e.language && e.language.name === "en"
  );
  const text = entry ? entry.flavor_text : "";
  // On nettoie les retours à la ligne et espaces multiples
  return text.replace(/\s+/g, " ").trim();
}

// Petit utilitaire pour rendre un type (ex: fire, water) en badge HTML.
function typeBadge(name) {
  return `<span class="type-badge">${name}</span>`;
}

// Affiche les statistiques du Pokémon sous forme de barres.
// - optional chaining (?.) pour éviter les erreurs quand une propriété est absente
// - création dynamique d'éléments DOM avec `document.createElement`
function renderStats(stats) {
  statsEl.innerHTML = "";
  if (!Array.isArray(stats) || stats.length === 0) return;
  stats.forEach((s) => {
    const base = clamp(s.base_stat || s.base || 0, 0, 255);
    const pct = clamp(Math.round((base / 255) * 100), 5, 100);
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
            <span>${s.stat?.name || s.name}</span>
            <div class="bar"><span style="width:${pct}%"></span></div>
            <span>${base}</span>
        `;
    statsEl.appendChild(row);
  });
}

// Change le style de la carte (border / box-shadow) selon la couleur de l'espèce.
// Montre la manipulation directe de `element.style` pour appliquer du CSS depuis JS.
function setCardAccentColor(colorName) {
  if (!colorName) {
    cardEl.style.borderColor = "";
    cardEl.style.boxShadow = "";
    return;
  }
  // Les noms de couleur fournis par l'API sont simples (ex: "red", "blue").
  cardEl.style.borderColor = colorName;
  cardEl.style.boxShadow = `0 0 0 3px ${colorName}22`;
}

// Remplit la carte affichant les données du Pokémon.
// `payload` contient deux objets : `pokemon` (données principales) et `species` (descriptions, couleur, etc.).
function renderPokemonView(payload) {
  const { pokemon, species } = payload;
  const id = pokemon.id;
  const displayName = pokemon.name;
  const sprite = pokemon.sprites?.front_default || "";
  const types = (pokemon.types || []).map((t) => t.type?.name).filter(Boolean);
  const stats = pokemon.stats || [];
  const flavor = pickEnglishFlavor(species?.flavor_text_entries || []);
  const colorName = species?.color?.name || null;

  // Mise à jour des éléments DOM avec les informations du Pokémon
  spriteEl.src = sprite;
  spriteEl.alt = displayName ? `${displayName} sprite` : "Pokemon sprite";
  nameEl.textContent = displayName || "—";
  idEl.textContent = id ? `#${id}` : "#—";
  typesEl.innerHTML = types.map(typeBadge).join("");
  renderStats(stats);
  flavorEl.textContent = flavor || "";
  setCardAccentColor(colorName);
}

// Ajoute une recherche à l'historique local affiché à l'utilisateur.
// On maintient au maximum 10 entrées et on évite les doublons.
function addToHistory(id, name) {
  if (!id || !name) return;
  const existingIdx = lastSearches.findIndex((e) => e.id === id);
  if (existingIdx !== -1) lastSearches.splice(existingIdx, 1);
  lastSearches.unshift({ id, name });
  if (lastSearches.length > 10) lastSearches.pop();
  historyListEl.innerHTML = lastSearches
    .map((e) => `<li><span>${e.name}</span><span>#${e.id}</span></li>`)
    .join("");
}

// 
// Wrapper autour de fetch qui ajoute un timeout via AbortController.
// - `options.signal` permet de chaîner/propager l'annulation depuis l'extérieur.
// - Si le timeout est atteint, on abort la requête avec une DOMException nommée "TimeoutError".
function fetchWithTimeout(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, signal } = options;
  const ac = new AbortController();
  const signals = [ac.signal];
  if (signal) {
    // Propager l'abort externe vers notre controller interne
    signal.addEventListener("abort", () => ac.abort(signal.reason), {
      once: true,
    });
    signals.push(signal);
  }

  const timeoutId = setTimeout(
    () => ac.abort(new DOMException("Timeout", "TimeoutError")),
    timeout
  );
  // On passe `ac.signal` à fetch pour pouvoir annuler la requête.
  return fetch(url, { ...options, signal: ac.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
}

// Récupère et parse du JSON depuis une URL. Lance une erreur si le code HTTP n'est pas OK.
// Montre l'usage d'`async/await` pour écrire du code asynchrone de manière lisible.
async function fetchJson(url, options) {
  const res = await fetchWithTimeout(url, options);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Essaie d'exécuter une fonction asynchrone plusieurs fois en cas d'erreurs temporaires.
// - `retries` : nombre d'essais supplémentaires
// - `backoffMs` : délai initial avant de réessayer (exponentiel ensuite)
async function retry(fn, { retries = 2, backoffMs = 400 } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const status = err && err.status;
      // On considère retriable : erreurs serveur (5xx), statut 0 (parfois réseau), ou abort
      const isRetriable =
        status >= 500 || status === 0 || err.name === "AbortError";
      if (attempt >= retries || !isRetriable) throw err;
      const delay = backoffMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}

// Exemple utilisant les Promises avec `then`/`catch` (ancienne syntaxe comparée à async/await).
// Gardé ici à titre pédagogique pour comparer les deux styles.
function fetchPokemonThenStyle(query) {
  const normalized = normalizeQuery(query);
  setStatus("Loading (then)...");
  return fetch(`${API_BASE}/pokemon/${normalized}`)
    .then((res) => {
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    })
    .then((pokemon) => {
      // Mise à jour minimale de la vue (exemples de DOM updates)
      nameEl.textContent = pokemon.name;
      idEl.textContent = `#${pokemon.id}`;
      spriteEl.src = pokemon.sprites?.front_default || "";
      typesEl.innerHTML = (pokemon.types || [])
        .map((t) => typeBadge(t.type?.name))
        .join("");
      renderStats(pokemon.stats || []);
      flavorEl.textContent = "";
      setCardAccentColor(null);
      setStatus("");
      return pokemon;
    })
    .catch((err) => {
      if (err.status === 404) {
        setStatus("Not found. Try another name or id.");
      } else {
        setStatus("Failed to load pokemon.");
      }
      throw err;
    });
}

// Exécute deux requêtes en parallèle : données du Pokémon et données "species".
// `Promise.all` permet d'attendre plusieurs promesses en même temps.
function fetchPokemonParallel(idOrName, options) {
  const id = normalizeQuery(idOrName);
  const p1 = fetchJson(`${API_BASE}/pokemon/${id}`, options);
  // On attend la réponse p1 pour connaître l'id numérique nécessaire au endpoint species
  return p1.then((pokemon) => {
    const speciesId = pokemon.id;
    const p2 = fetchJson(`${API_BASE}/pokemon-species/${speciesId}`, options);
    return Promise.all([Promise.resolve(pokemon), p2]).then(
      ([pokemonRes, speciesRes]) => ({
        pokemon: pokemonRes,
        species: speciesRes,
      })
    );
  });
}

// Handler principal utilisant async/await. Il combine plusieurs concepts :
// - annulation de requêtes avec AbortController
// - caching pour éviter des requêtes inutiles
// - retry en cas d'erreurs temporaires
// - mise à jour de l'interface (DOM)
async function fetchPokemon(query) {
  const normalized = normalizeQuery(query);
  if (!normalized) return;

  // Si une requête est déjà en cours, on l'annule (ex: l'utilisateur a lancé une nouvelle recherche)
  if (inFlightController)
    inFlightController.abort(
      new DOMException("Replaced by new search", "AbortError")
    );
  inFlightController = new AbortController();

  // Vérifier le cache avant d'appeler l'API
  const cached = pokemonCacheById.get(normalized);
  if (cached) {
    renderPokemonView(cached);
    setStatus("Loaded from cache.");
    addToHistory(cached.pokemon.id, cached.pokemon.name);
    return cached;
  }

  setStatus("Loading...");
  try {
    const payload = await retry(
      () =>
        fetchPokemonParallel(normalized, {
          signal: inFlightController.signal,
          timeout: DEFAULT_TIMEOUT_MS,
        }),
      { retries: 2, backoffMs: 500 }
    );
    renderPokemonView(payload);
    setStatus("");
    // Stocker en cache par id et par nom pour accélérer les recherches suivantes
    pokemonCacheById.set(String(payload.pokemon.id), payload);
    pokemonCacheById.set(String(payload.pokemon.name).toLowerCase(), payload);
    addToHistory(payload.pokemon.id, payload.pokemon.name);
    return payload;
  } catch (err) {
    // Gestion d'erreurs : AbortError signifie que la requête a été annulée
    if (err.name === "AbortError") {
      setStatus("Request canceled.");
      return;
    }
    if (err.status === 404) {
      setStatus("Not found. Try another name or id.");
    } else if (err.name === "TimeoutError") {
      setStatus("Request timed out. Please try again.");
    } else {
      setStatus("Something went wrong.");
    }
    throw err;
  }
}

// Bouton Annuler : annule la requête en cours via AbortController.
cancelBtn?.addEventListener("click", () => {
  if (inFlightController) {
    inFlightController.abort(
      new DOMException("Canceled by user", "AbortError")
    );
    inFlightController = null;
  }
});

// Événements utilisateurs
// - submit du formulaire : on empêche le comportement par défaut (reload) et on appelle fetch
formEl?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = inputEl.value;
  fetchPokemon(q).catch(() => {});
});

// Bouton Surprise Me : choisit un id aléatoire et lance la recherche
surpriseBtn?.addEventListener("click", () => {
  // Gen1-9 range approx; pokeapi has up to ~1010+ including forms; choose 1-898 base dex then some
  const randomId = Math.floor(Math.random() * 1010) + 1;
  inputEl.value = String(randomId);
  fetchPokemon(randomId).catch(() => {});
});

// Exemple pédagogique utilisant des callbacks imbriqués (callback hell).
// Aujourd'hui on préfère Promises / async-await, mais c'est utile de comparer.
function fakeCallbackPipeline(query, cb) {
  setTimeout(() => {
    const normalized = normalizeQuery(query);
    if (!normalized) return cb(new Error("Empty query"));
    setTimeout(() => {
      // Validation simulée : les ids numériques doivent être entre 1 et 1010
      if (
        /^\d+$/.test(normalized) &&
        (parseInt(normalized, 10) < 1 || parseInt(normalized, 10) > 1010)
      ) {
        return cb(new Error("Out of range"));
      }
      setTimeout(() => cb(null, normalized), 150);
    }, 120);
  }, 100);
}

// Expose demos to window for quick manual testing in console
window.pokeDemos = { fetchPokemonThenStyle, fakeCallbackPipeline };

// Initial hint
setStatus("Ready. Try pikachu or press Surprise Me.");
