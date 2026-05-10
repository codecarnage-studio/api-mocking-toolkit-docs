---
id: guides
title: Guides
sidebar_position: 2
---

Workflows et cas d'utilisation réels.

---

## Flux de développement

Construisez sans attendre le backend.

### API backend non prête

Définissez le contrat avec l'équipe backend :

```json
// POST /api/login
Requête :
{
  "username": "string",
  "password": "string"
}

Réponse (Succès) :
{
  "token": "string",
  "userId": "number",
  "username": "string"
}

Réponse (Erreur) :
{
  "error": "Invalid credentials"
}
```

Créez l'endpoint mock dans le toolkit :
- Endpoint : `POST /api/login`
- Succès (200) : `{"token": "mock-jwt-token-12345", "userId": 1001, "username": "testuser"}`
- Erreur (401) : `{"error": "Invalid credentials"}`
- Utilisez la stratégie `Aléatoire` pour mélanger les réponses, ou `Séquentielle` (1er succès → 2e erreur → boucle)

Construisez l'UI :

```csharp
public class LoginManager : MonoBehaviour
{
    public async void OnLoginButtonClicked()
    {
        var response = await ApiClient.Post(
            "https://api.mygame.com/login",
            $"{{\"username\":\"{username}\",\"password\":\"{password}\"}}"
        );
        
        if (response.Success) {
            var data = JsonUtility.FromJson<LoginResponse>(response.Body);
            PlayerPrefs.SetString("token", data.token);
            SceneManager.LoadScene("MainMenu");
        } else {
            ShowError("Connexion échouée");
        }
    }
}
```

Quand le backend est prêt, désactivez le mode hors ligne. Le code fonctionne sans modification. Les builds de production doivent désactiver le mode hors ligne ; `BuildPreprocessor` l'applique. Les types réservés à l'éditeur (`ApiInterceptor`, `SessionManager`) sont encapsulés dans `#if UNITY_EDITOR`, jamais dans les builds.

---

## Tests et QA

Créez des scénarios de test reproductibles sans coordination avec le backend.

### Gestion des erreurs

Configuration de l'endpoint :
```
Endpoint : GET /api/player/inventory
Stratégie : Aléatoire
Responses[] :        Succès 200
ErrorResponses[] :   Statut 408 (timeout, latence 5000 ms)
                     Statut 500 (erreur serveur)
                     Statut 401 (erreur auth)
```

Activez/désactivez `SimulateError` pour basculer entre `Responses[]` et `ErrorResponses[]`.

Exécutez des tests automatisés :

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // Activez le mode hors ligne dans la fenêtre du toolkit avant d'exécuter
    // (Window > CodeCarnage > API Mocking Toolkit > Offline Mode)

    // Appelez l'API plusieurs fois
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.Get("/api/player/inventory");
        
        // Vérifiez que la gestion des erreurs fonctionne
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "La boîte de dialogue d'erreur doit s'afficher");
        }
    }
}
```

Cas de test QA : activez le mode hors ligne → sélectionnez la collection → déclenchez le scénario → vérifiez la gestion des erreurs.

### Cas limites

Testez les réponses vides :

```json
// Inventaire vide
[]

// Données nulles
null

// Champs manquants
{
  "items": null
}
```

**Testez les grandes réponses :**

```json
// 1000 éléments dans l'inventaire
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"},
  ...
  {"id": 1000, "name": "Item 1000"}
]
```

**Testez les caractères spéciaux :**

```json
{
  "username": "test<script>alert('xss')</script>",
  "message": "Ligne 1\nLigne 2\tAvec tabulation"
}
```

Utilisez la stratégie `Séquentielle` pour cycler à travers les cas limites à chaque appel.

---

## Prototypage d'APIs

Concevez avant que le backend n'implémente.

### Système d'amis

```json
// GET /api/friends
{
  "friends": [
    {"id": 1, "username": "alice", "status": "online"},
    {"id": 2, "username": "bob", "status": "offline"}
  ],
  "pendingRequests": [{"id": 3, "username": "charlie"}]
}
```

Construisez l'UI, itérez sur le schéma de réponse, puis exportez → envoyez au backend. Ils implémentent selon les spécifications. Aller-retour OpenAPI sûr avec les extensions `x-amt-*` préservant les détails spécifiques au toolkit.

---

## Débogage avec les sessions

Rejouez les sessions pour un débogage « voyage dans le temps ».

### Reproduction de bugs

Activez la persistance de session sur `ApiGlobalConfig`. Le testeur joue, le crash se produit, la session est auto-sauvegardée à la sortie du mode Play. Cliquez sur **Stop** sur la bannière REC pour capturer en milieu de session.

Chargez la session dans le Toolkit → onglet Sessions. Analysez la séquence exacte des requêtes :

```
1. GET /api/shop/items - Succès
2. POST /api/shop/buy - Item 1 - Succès
3. GET /api/player/inventory - Succès
4. POST /api/shop/buy - Item 2 - Succès
5. GET /api/player/inventory - Succès
6. POST /api/shop/buy - Item 3 - Erreur 500
7. GET /api/player/inventory - [CRASH]
```

Le jeu ne gère pas la récupération d'inventaire après un échec d'achat. Corrigez, rechargez la même session, vérifiez.

Jouez la section lente, chargez la session. Examinez les latences API :

```
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← lent
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

Collaborez avec le backend pour optimiser l'endpoint lent.

---

## Collaboration en équipe

### Contrôle de version

Les collections se trouvent sous `Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/` par défaut (chargées via `Resources.Load`). Commitez dans Git :

```bash
git add Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/ApiEndpointCollection.asset
git commit -m "Add API mock configurations"
```

Tous les développeurs tirent → endpoints identiques.

### Workflow QA

Créez des collections QA : `QA-Edge-Cases.asset`, `QA-Performance.asset`, `QA-Happy-Path.asset`. Sélectionnez dans le toolkit, activez le mode hors ligne, exécutez les tests.

### Coordination avec le backend

Créez les endpoints → exportez la spec OpenAPI → envoyez au backend → ils implémentent selon les specs → désactivez le mode hors ligne → testez avec le vrai backend.

---

## Extension de la scène de démo

La démo montre les boutons "Get Users" / "Get Posts" :

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/users");
    rightText.text = FormatResponse(response);
}
```

### Ajouter un nouveau bouton

Ajoutez un endpoint → `GET https://jsonplaceholder.typicode.com/comments` → dupliquez le bouton "Get Posts" → ajoutez un gestionnaire :

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/comments");
    UpdateUI(response);
}
```

Connectez le OnClick du bouton pour appeler le gestionnaire.

### Pagination avec une stratégie de réponse

Ajoutez 3 réponses pour `GET /posts` (Page 1, Page 2, Page 3). Définissez la stratégie de réponse sur **Séquentielle**. Chaque clic retourne la page suivante, boucle au 4e clic.

### Simulation d'erreurs

Ajoutez une réponse d'erreur (500). Définissez la **Stratégie de réponse d'erreur** sur `Séquentielle` ou `Aléatoire`. Activez/désactivez **Simulate Error** pour basculer entre les chemins succès et erreur. Gérez dans le code :

```csharp
if (!response.Success) {
    rightText.text = $"ERREUR : {response.StatusCode}";
    return;
}
```

---

**Suite :** [Référence de l'API](api-reference.md) - Aide-mémoire du code
