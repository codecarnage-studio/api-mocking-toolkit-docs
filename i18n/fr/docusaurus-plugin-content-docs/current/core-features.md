---
id: core-features
title: Fonctionnalités principales
sidebar_position: 2
---

Exploration approfondie des fonctionnalités principales.

---

## Disposition de la fenêtre de l'éditeur

Ouvrir : `Window > CodeCarnage > API Mocking Toolkit`

**Trois onglets :** Endpoints (collections/dossiers/éditeur), Sessions (enregistrements/lecture), Environnements (sélecteurs/variables/import/export)

**Panneau gauche :** sélecteur de collection, arborescence de dossiers, liste d'endpoints, bouton **+ Endpoint**.
**Panneau droit :** Mock (sous-onglets Succès/Erreur avec Corps/En-têtes) et Réponse (visionneuse en direct, boutons de capture).
**Panneau de requête :** méthode, URL, En-têtes/Corps, bouton Envoyer. La puce d'indication des variables liste les `{{variable}}`s disponibles.
**Barre d'outils :** Activé, Mode hors ligne, menu déroulant de collection, Import/Export (OpenAPI 3.0 + `x-amt-*`).

---

## Stratégies de réponse

Contrôlez quelle réponse est renvoyée à chaque appel :
- **Séquentielle** – Lecture dans l'ordre ; boucle selon l'indicateur `LoopResponses`
- **RoundRobin** – Cycle infini
- **Aléatoire** – Aléatoire uniforme

### Exemple de pagination de boutique

Endpoint : `GET /api/shop/items` retourne 30 articles, 10 par page.

Configuration : Créez l'endpoint `GET /api/shop/items` avec 3 réponses :

**Réponse 1 (Page 1) :**
```json
{
  "items": [
    {"id": 1, "name": "Sword",  "price": 100},
    {"id": 2, "name": "Shield", "price":  80},
    ..., 
    {"id": 10, "name": "Potion", "price": 20}
  ],
  "page": 1,
  "hasMore": true
}
```

**Réponse 2 (Page 2) :**
```json
{
  "items": [
    {"id": 11, "name": "Helmet", "price": 150},
    ..., 
    {"id": 20, "name": "Boots",  "price":  60}
  ],
  "page": 2,
  "hasMore": true
}
```

**Réponse 3 (Page 3) :**
```json
{
  "items": [
    {"id": 21, "name": "Ring",   "price": 200},
    ..., 
    {"id": 30, "name": "Amulet", "price": 300}
  ],
  "page": 3,
  "hasMore": false
}
```

Définissez la stratégie de réponse sur **Séquentielle**. Dans le code :

```csharp
// Votre code de jeu
for (int page = 1; page <= 5; page++)
{
    var response = await ApiClient.Get("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"Page {page}: {data.items.Length} articles");
}

// Sortie (avec LoopResponses = true) :
// Page 1: 10 articles (Réponse 1)
// Page 2: 10 articles (Réponse 2)
// Page 3: 10 articles (Réponse 3)
// Page 4: 10 articles (Réponse 1 - bouclé !)
// Page 5: 10 articles (Réponse 2)
```

Pagination testée sans coordination avec le backend.

**Stratégies :**
- Séquentielle : 1 → 2 → 3 → (boucle ou arrêt)
- RoundRobin : 1 → 2 → 3 → 1 → 2 → 3 (cycle permanent)
- Aléatoire : 2 → 1 → 3 → 2 → 2 → 1

Pour un mélange « surtout succès, parfois erreur », utilisez la stratégie `Aléatoire` avec `Responses[]` et `ErrorResponses[]`.

---

## Mode hors ligne et basculement de mock par endpoint

Le **Mode hors ligne** global (`ApiGlobalConfig`) et le basculement **Mock activé** par endpoint (`UseMock`) contrôlent le routage.

**Ordre de routage :**
1. `ApiGlobalConfig.Enabled` OFF → backend réel (toolkit contourné)
2. `OfflineMode` ON → tout mocké (ou échec si aucun endpoint ne correspond)
3. `OfflineMode` OFF + endpoint correspondant + `UseMock` ON → mocké
4. Sinon → réseau réel

Le basculement par endpoint permet de conserver un endpoint configuré tout en routant vers le backend réel — utile pour capturer des réponses en direct ou faire des tests A/B.

**Activer le mode hors ligne :**
```text
Window > CodeCarnage > API Mocking Toolkit
Activer "Mode hors ligne"
```

**Lire à l'exécution :**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

Utilisez pour le développement sans backend, les tests sans réseau instable, les démos en conférence.

---

## Environnements et variables

Gérez différents backends sans modifier le code.

Créez des environnements : Développement, Staging, Production. Chacun possède sa propre `baseUrl` et ses propres variables.

**Interpolation de variables dans les URLs et les corps :**
```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**Priorité de portée (de la plus haute à la plus basse) :**
1. Spécifique à l'endpoint
2. Spécifique à l'environnement
3. Global

**Changer à l'exécution :**
```csharp
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

Les variables non résolues lèvent une `MissingEnvironmentVariableException`. Aucune URL codée en dur.

### Sécurité des builds de production

`BuildPreprocessor` s'exécute avant les builds. Vérifications :
1. `OfflineMode` doit être OFF
2. `BuildEnvironmentId` doit pointer vers un environnement enregistré
3. L'environnement actif doit correspondre à l'environnement de build

**Gérer les environnements :** `Window > CodeCarnage > API Mocking Toolkit > Gérer les environnements`
- **ÉDITEUR :** environnement actif pour le mode Play (changez librement)
- **BUILD :** environnement compilé dans les builds (un seul)

Les violations font échouer le build avec `BuildFailedException`.

**Bonne pratique :** Développement (Dev), Staging (QA), Production (Build). Seul l'environnement BUILD est livré.

---

## Collections et dossiers

Organisez des centaines d'endpoints.

**Collections :** groupes d'endpoints séparés (jeux, versions d'API). Une seule active à la fois via `ApiGlobalConfig.ActiveCollectionName`.

Créer : Clic droit dans la fenêtre Projet → `Create > CodeCarnage > API Mocking Toolkit > Endpoint Collection`.

**Dossiers :** organisez les endpoints dans une collection (Authentification, Données joueur, Classement).

Bonnes pratiques : Utilisez les **Collections** pour les jeux/versions/suites de tests. Utilisez les **Dossiers** pour les fonctionnalités/services.

---

## Gestion des sessions

Enregistrez toutes les requêtes API en mode Play, sauvegardez, rejouez plus tard.

**Enregistrement :** Activez la **persistance de session** sur `ApiGlobalConfig` → mode Play → appels auto-enregistrés → quitter → sauvegardé dans `Application.persistentDataPath/ApiMockingToolkitSessions/`.

**Bannière REC :** Cliquez sur **Arrêter** pour terminer la session sans quitter le mode Play (utile pour découper les longues sessions). La bannière se masque automatiquement quand inactive.

**Lecture :** Onglet Sessions → sélectionnez une session → Charger la session → examinez les requêtes/réponses.

Utilisez pour la reproduction de bugs, l'analyse de goulots d'étranglement de performance, le partage en équipe. Éditeur uniquement (non compilé dans les builds). Maximum 1 000 sessions conservées ; les plus anciennes sont supprimées automatiquement.

**Cas d'usage :** Bugs longs et complexes ; scénarios d'échec exacts ; analyse de performance.

---

## Intégration OpenAPI

**Import :** Toolkit → Import → sélectionnez `.json` ou `.yaml` → endpoints créés automatiquement

Exemple OpenAPI :
```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: Obtenir tous les utilisateurs
      responses:
        '200':
          description: Succès
```

Résultat : endpoint créé avec URL, méthode, réponse 200.

**Conversion de variables :** OpenAPI `{variable}` → Toolkit `{{variable}}`

**Export :** Configurez les endpoints → Export → sauvegardez `.json` → envoyez au backend

Aller-retour sûr : Export → Import → Export = même fichier. Les données spécifiques au toolkit (dossiers, stratégies, latence, réponses multiples) sont préservées via les extensions `x-amt-*`. Les outils backend ignorent les extensions, utilisent OpenAPI 3.0 standard.

---

## Simulation d'erreurs

Testez la gestion des erreurs et de la latence sans casser les backends réels.

Ajoutez un endpoint → ajoutez des réponses d'erreur (4xx/5xx) → définissez la latence (ms) sur la réponse :

```json
{
  "status": 500,
  "error": "Erreur interne du serveur"
}
```

Utilisez `ErrorResponses[]` avec la stratégie `Aléatoire` pour des échecs occasionnels, ou `Séquentielle` pour un comportement déterministe :
```text
Responses[]:        Succès 200 (latence 100 ms)
ErrorResponses[]:   Erreur  500 (latence 1500 ms)
                    Erreur  404 (latence 100 ms)
```

**Cas d'usage de la latence :** visibilité des barres de chargement, UX lente-mais-réussie, mauvaises conditions réseau (mobile, coupures Wi-Fi).

Gérez dans le code :
```csharp
var response = await ApiClient.Get("/api/data");
if (!response.Success) {
    switch (response.StatusCode) {
        case 401: ShowLoginScreen(); break;
        case 429: ShowRateLimitMessage(); break;
        case 500: ShowErrorDialog("Erreur serveur"); break;
    }
}
```

---

## Capture des réponses API en direct

Faites le pont entre les APIs réelles et le développement mocké.

**Configuration :** Configurez l'endpoint avec l'URL réelle → désactivez le mode hors ligne → Cliquez sur « Envoyer ».

**Capture :** Après réception de la réponse, cliquez sur « Sauvegarder le corps comme mock de succès » ou « Sauvegarder le corps comme mock d'erreur » (onglet Corps) / « Sauvegarder les en-têtes comme... » (onglet En-têtes).

**Options du menu :**
- Ajouter comme nouvelle réponse
- Remplacer toutes les réponses
- Remplacer une réponse spécifique par son nom

**Personnaliser :** Nom de la réponse, code de statut, latence (ms), corps, en-têtes. Tout pré-rempli depuis la capture. Cliquez sur Confirmer.

Le toolkit active automatiquement `UseMock`, prêt à utiliser hors ligne.

**Exemple :**
```csharp
// Config : https://api.mygame.com/leaderboard/global, Mode hors ligne OFF
var response = await ApiClient.Get("https://api.mygame.com/leaderboard/global");

// Dans l'éditeur : Cliquez sur "Sauvegarder le corps comme mock de succès" → Nom : "Classement Production"
// Activez le mode hors ligne → réponse en cache utilisée, aucun appel réseau
var cachedResponse = await ApiClient.Get("https://api.mygame.com/leaderboard/global");
```

**Cas d'usage :** Tester les données de staging hors ligne, reproduire les bugs de production, constituer des bibliothèques d'erreurs, tests de performance, partage en équipe.

**Support des variables :** Modifiez la réponse capturée pour utiliser `{{baseUrl}}`, `{{apiKey}}` au lieu de valeurs codées en dur. Changez d'environnement sans modifier les mocks.

**Prévention :** Dialogues de confirmation pour les actions destructives (Remplacer tout / Remplacer spécifique).

**Bonnes pratiques :** Nommez les réponses de façon descriptive (« Profil utilisateur - Niveau Premium »). Capturez les erreurs intentionnellement (401, 404, 500). Utilisez la latence pour tester les spinners/timeouts. Combinez avec les stratégies de réponse. Versionnez les collections via Git.
