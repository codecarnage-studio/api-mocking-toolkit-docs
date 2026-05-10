---
id: api-reference
title: Référence de l'API
sidebar_position: 3
---

Référence du code et exemples.

---

## Table des matières

- [Référence rapide](#référence-rapide)
- [ApiClient](#apiclient)
- [ApiGlobalConfig](#apiglobalconfig)
- [ApiEndpoint](#apiendpoint)
- [EnvironmentManager](#environmentmanager)
- [SessionManager](#sessionmanager)
- [Configuration](#configuration)
- [Dépannage](#dépannage)

---

## Référence rapide

### Effectuer des appels API

```csharp
using CodeCarnage.ApiMockingToolkit;

// GET
var response = await ApiClient.Get("https://api.example.com/data");

// POST
var response = await ApiClient.Post("https://api.example.com/data", "{\"key\":\"value\"}");

// PUT
var response = await ApiClient.Put("https://api.example.com/data/123", "{\"key\":\"updated\"}");

// PATCH
var response = await ApiClient.Patch("https://api.example.com/data/123", "{\"key\":\"patched\"}");

// DELETE
var response = await ApiClient.Delete("https://api.example.com/data/123");
```

Toutes les méthodes acceptent des `headers` et un `CancellationToken` optionnels :

```csharp
var headers = new Dictionary<string, string> {
    { "Authorization", "Bearer {{token}}" }
};
var cts = new CancellationTokenSource();

var response = await ApiClient.Get(
    "https://api.example.com/me",
    headers,
    cts.Token
);
```

### Gérer les réponses

```csharp
if (response.Success) {
    // Succès - Statut 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"Données : {data}");
} else {
    // Erreur - Statut >= 400 (ou échec de transport)
    Debug.LogError($"Erreur {response.StatusCode}: {response.Body}");
}
```

### Mode hors ligne

`OfflineMode` est un champ sérialisé sur le ScriptableObject `ApiGlobalConfig`.
Basculez-le depuis la fenêtre API Mocking Toolkit ou l'Inspecteur :

```csharp
// Lire l'état actuel à l'exécution
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.OfflineMode) {
    Debug.Log("Fonctionnement en mode hors ligne");
}
```

> L'API d'exécution est en lecture seule. Pour modifier la valeur depuis le code (Éditeur uniquement),
> utilisez `SerializedObject` / `EditorUtility.SetDirty` sur l'asset ; n'assignez pas
> directement à la propriété.

### Environnements

```csharp
// Obtenir le gestionnaire d'environnements
var envManager = EnvironmentManager.Instance;

// Changer l'environnement actif
envManager.ActiveEnvironment = devEnvironment;

// Résoudre une variable (env actif en premier, puis global)
string baseUrl = envManager.ResolveVariable("baseUrl");
```

### Sessions

```csharp
// La persistance de session est contrôlée par ApiGlobalConfig (définie via l'UI de l'Éditeur)
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool persistenceOn = config.EnableSessionPersistence;

// Accéder au gestionnaire de sessions (Éditeur uniquement)
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
var session = sessionManager.CurrentSession;
sessionManager.EndCurrentSession();
#endif
```

---

## ApiClient

Point d'entrée statique. Éditeur : `ApiInterceptor` route les requêtes. Builds : `UnityWebRequest` vers le vrai backend.

### Méthodes

#### Get / Post / Put / Patch / Delete

```csharp
public static Task<ApiResponse> Get(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Post(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Put(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Patch(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Delete(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
```

```csharp
// Exemples
var response = await ApiClient.Get("https://api.example.com/users/123");

var json = JsonUtility.ToJson(new LoginRequest { username = "user", password = "pass" });
var response = await ApiClient.Post("https://api.example.com/login", json);

var response = await ApiClient.Delete("https://api.example.com/player/items/456");
```

### ApiResponse

```csharp
public class ApiResponse
{
    public bool Success { get; }
    public int StatusCode { get; }
    public string Body { get; }
    public IReadOnlyDictionary<string, string> Headers { get; }
    public long Size { get; } // octets
}
```

**Exemple d'utilisation :**
```csharp
var response = await ApiClient.Get("/api/data");

Debug.Log($"Succès : {response.Success}");
Debug.Log($"Statut : {response.StatusCode}");
Debug.Log($"Corps : {response.Body}");
Debug.Log($"Taille : {response.Size} octets");

if (response.Headers != null && response.Headers.TryGetValue("Content-Type", out var ct)) {
    Debug.Log($"Content-Type : {ct}");
}
```

> La latence simulée par les réponses mock est appliquée comme un `await Task.Delay`
> à l'intérieur de l'intercepteur — ce n'est pas un champ sur l'objet de réponse.

---

## ApiGlobalConfig

ScriptableObject depuis `Resources/ApiGlobalConfig`. Lecture seule à l'exécution. Modifiez via la fenêtre Toolkit ou l'Inspecteur.

```csharp
bool OfflineMode { get; }            // Mocke tout, même les non-configurés
bool Enabled { get; }                // Interrupteur principal
bool EnableSessionPersistence { get; } // Sauvegarde les sessions sur disque
string ActiveCollectionName { get; set; } // Collection active
```

**Lecture à l'exécution :**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.Enabled && config.OfflineMode) Debug.Log("Toolkit actif, mode hors ligne");
```

**Modification depuis un script Éditeur :**
```csharp
#if UNITY_EDITOR
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
var so = new UnityEditor.SerializedObject(config);
so.FindProperty("_offlineMode").boolValue = true;
so.ApplyModifiedProperties();
UnityEditor.EditorUtility.SetDirty(config);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

---

## ApiEndpoint

Modèle d'endpoint sérialisable dans `ApiEndpointCollection`. Modifiez via la fenêtre Toolkit ; rarement construit par le code du jeu.

```csharp
string Id { get; set; }              // GUID stable (survit aux modifications d'URL/méthode)
string Name { get; set; }            // Nom convivial
string Url { get; set; }             // URL ou template ({{baseUrl}}/users)
string Method { get; set; }          // GET, POST, PUT, PATCH, DELETE, HEAD
MatchType MatchType { get; set; }    // Exact | Contains

bool UseMock { get; set; }           // Basculement par endpoint
bool SimulateError { get; set; }     // false → Responses[] ; true → ErrorResponses[]

string Headers { get; set; }         // "Clé : Valeur" brut par ligne
string RequestBody { get; set; }     // Corps JSON pour POST/PUT/PATCH

List<MockFlowNode> Responses { get; }       // Réponses de succès
List<MockFlowNode> ErrorResponses { get; }  // Réponses d'erreur

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Curseur Séquentiel/RoundRobin

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // Curseur d'erreur
```

**Routage :** `Enabled` OFF → réel. `OfflineMode` ON → mocke tout. `UseMock` ON → mocké. Sinon → réel.
`SimulateError` choisit entre `Responses[]` et `ErrorResponses[]` via la stratégie.

### Exemple

```csharp
#if UNITY_EDITOR
var collection = Resources.Load<ApiEndpointCollection>("ApiEndpointCollection");
var ep = collection.Endpoints.First(e => e.Name == "Get Profile");

ep.UseMock = true;                     // Route cet endpoint vers les mocks
ep.SimulateError = false;              // Sert depuis Responses[]
ep.ResponseStrategy = ResponseStrategy.Sequential;
ep.LoopResponses = true;

UnityEditor.EditorUtility.SetDirty(collection);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

> `Id` est préservé à travers les modifications d'URL/méthode et les allers-retours d'import/export OpenAPI
> (stocké comme `x-amt-id` dans la spec exportée). Ne générez pas les IDs vous-même ;
> laissez le toolkit les assigner.

---

## EnvironmentManager

Singleton persistant. Stocke les environnements et les globaux dans `Application.persistentDataPath/ApiMockingToolkit/Environments/`.

**Propriétés :**
```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // Ignoré si non enregistré
string BuildEnvironmentId { get; set; }             // Env compilé dans les builds
ApiEnvironment BuildEnvironment { get; }
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

**Méthodes :**
```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);        // Faux si null ou seul restant
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);                // Env actif en premier, puis globaux
ApiRequest InterpolateRequest(ApiRequest req);     // Strict ; lève une exception si non résolu
void SaveEnvironments();
```

**ApiEnvironment :**
```csharp
public class ApiEnvironment {
    public string Id { get; }              // GUID
    public string Name { get; set; }
    public string BaseUrl { get; set; }
    public Dictionary<string, string> Variables { get; set; }

    public void   SetVariable(string key, string value);
    public string GetVariable(string key);
    public bool   RemoveVariable(string key);
    public bool   HasVariable(string key);
    public int    VariableCount { get; }
    public ApiEnvironment Clone();
}
```

**Exemple :**
```csharp
var envManager = EnvironmentManager.Instance;
var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;
string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

**Contrôle des builds :** `BuildPreprocessor` vérifie `OfflineMode` OFF, `BuildEnvironmentId` enregistré, env actif correspond à l'env de build. Le mode Play n'a pas de restrictions. Les violations font échouer le build avec `BuildFailedException`.

---

## SessionManager

Éditeur uniquement. Persiste les sessions dans `Application.persistentDataPath/ApiMockingToolkitSessions/`.

**Propriétés :**
```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // Se déclenche au démarrage/fin/suppression
```

**Méthodes :**
```csharp
void StartNewSession();
void EndCurrentSession();               // Sauvegarde aussi sur disque
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);
List<Session> LoadAllSessions();
Session LoadSession(string sessionId);  // Par ID, pas par chemin de fichier
void DeleteSession(string sessionId);
void DeleteAllSessions();
int GetSavedSessionCount();
string GetSessionFolderPath();
```

**Exemple :**
```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
sessionManager.StartNewSession();
// ... jouez, effectuez des appels API ...
sessionManager.EndCurrentSession();   // Auto-sauvegarde
var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"Session : {session.TotalRequests} requêtes, {session.GetDurationSeconds()}s de durée");
#endif
```

Contrôlé par `EnableSessionPersistence`. Maximum 1 000 sessions sur disque ; les plus anciennes sont supprimées automatiquement.

---

## Configuration

**ResponseStrategy :**
```csharp
Sequential   // 1 → 2 → 3 → 1 (boucle si LoopResponses)
RoundRobin   // Cycle régulier, indéfiniment
Random       // Aléatoire uniforme par appel
```

**MatchType :**
```csharp
Exact       // request.url == endpoint.url
Contains    // request.url.Contains(endpoint.url)
```

**Méthodes HTTP (Constants.HttpMethods) :**
```csharp
Get    // "GET"
Post   // "POST"
Put    // "PUT"
Patch  // "PATCH"
Delete // "DELETE"
Head   // "HEAD"
```

Le code du jeu appelle les méthodes `ApiClient` directement ; pas besoin de spécifier des chaînes de méthode.

---

## Dépannage

**Endpoints non correspondants :** `Enabled` ? Mode hors ligne activé ? URL correspond (sensible à la casse) ? MatchType (Exact vs Contains) ? Bonne collection ? Méthode HTTP correspond ? `UseMock` ON (si mode hors ligne OFF) ?

**Variables non remplacées :** Existe dans l'env actif/global ? Syntaxe `{{variableName}}` ? Fautes de frappe ? Env actif défini ? Lève `MissingEnvironmentVariableException` avec les vars disponibles.

**Sessions non sauvegardées :** `EnableSessionPersistence` true ? Exécution dans l'Éditeur (sessions Éditeur uniquement) ? `EndCurrentSession()` appelé ou mode Play quitté ? Consultez la Console pour les erreurs `[SessionManager]`.

**Scène de démo cassée :** Réimportez les Samples depuis le Package Manager. Sélectionnez "Demo Scene Collection". Consultez la Console.

**Erreurs de build :** `OfflineMode` ON (désactivez). Aucun environnement de build défini ou env actif ne correspond. Backend de script/niveau de compatibilité API pour `async/await`.

**Performance :** Limitez la taille du corps de réponse. Réduisez la latence. Désactivez la persistance de session si non nécessaire.
