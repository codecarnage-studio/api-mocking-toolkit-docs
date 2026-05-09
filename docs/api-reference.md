---
id: api-reference
title: API Reference
sidebar_position: 3
---

Code reference and examples.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [ApiClient](#apiclient)
- [ApiGlobalConfig](#apiglobalconfig)
- [ApiEndpoint](#apiendpoint)
- [EnvironmentManager](#environmentmanager)
- [SessionManager](#sessionmanager)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Making API Calls

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

All methods accept optional `headers` and `CancellationToken`:

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

### Handling Responses

```csharp
if (response.Success) {
    // Success - Status 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"Data: {data}");
} else {
    // Error - Status >= 400 (or transport failure)
    Debug.LogError($"Error {response.StatusCode}: {response.Body}");
}
```

### Offline Mode

`OfflineMode` is a serialized field on the `ApiGlobalConfig` ScriptableObject.
Toggle it from the API Mocking Toolkit window or the Inspector:

```csharp
// Read current state at runtime
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.OfflineMode) {
    Debug.Log("Running in offline mode");
}
```

> The runtime API is read-only. To change the value from code (Editor only),
> use `SerializedObject` / `EditorUtility.SetDirty` on the asset; do not assign
> directly to the property.

### Environments

```csharp
// Get environment manager
var envManager = EnvironmentManager.Instance;

// Switch active environment
envManager.ActiveEnvironment = devEnvironment;

// Resolve a variable (active env first, then global)
string baseUrl = envManager.ResolveVariable("baseUrl");
```

### Sessions

```csharp
// Session persistence is controlled by ApiGlobalConfig (set via the Editor UI)
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool persistenceOn = config.EnableSessionPersistence;

// Access session manager (Editor-only)
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
var session = sessionManager.CurrentSession;
sessionManager.EndCurrentSession();
#endif
```

---

## ApiClient

Static entry point. Editor: `ApiInterceptor` routes requests. Builds: `UnityWebRequest` to real backend.

### Methods

#### Get / Post / Put / Patch / Delete

```csharp
public static Task<ApiResponse> Get(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Post(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Put(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Patch(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Delete(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
```

```csharp
// Examples
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
    public long Size { get; } // bytes
}
```

**Example Usage:**
```csharp
var response = await ApiClient.Get("/api/data");

Debug.Log($"Success: {response.Success}");
Debug.Log($"Status: {response.StatusCode}");
Debug.Log($"Body: {response.Body}");
Debug.Log($"Size: {response.Size} bytes");

if (response.Headers != null && response.Headers.TryGetValue("Content-Type", out var ct)) {
    Debug.Log($"Content-Type: {ct}");
}
```

> Latency simulated by mock responses is applied as an `await Task.Delay`
> inside the interceptor — it is not a field on the response object.

---

## ApiGlobalConfig

ScriptableObject from `Resources/ApiGlobalConfig`. Read-only at runtime. Edit via Toolkit window or Inspector.

```csharp
bool OfflineMode { get; }            // Mock everything, even unconfigured
bool Enabled { get; }                // Master switch
bool EnableSessionPersistence { get; } // Save sessions to disk
string ActiveCollectionName { get; set; } // Active collection
```

**Read at runtime:**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.Enabled && config.OfflineMode) Debug.Log("Toolkit active, offline mode");
```

**Edit from Editor script:**
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

Serializable endpoint model in `ApiEndpointCollection`. Edit via Toolkit window; rarely constructed by game code.

```csharp
string Id { get; set; }              // Stable GUID (survives URL/method edits)
string Name { get; set; }            // Friendly name
string Url { get; set; }             // URL or template ({{baseUrl}}/users)
string Method { get; set; }          // GET, POST, PUT, PATCH, DELETE, HEAD
MatchType MatchType { get; set; }    // Exact | Contains

bool UseMock { get; set; }           // Per-endpoint toggle
bool SimulateError { get; set; }     // false → Responses[]; true → ErrorResponses[]

string Headers { get; set; }         // Raw "Key: Value" per line
string RequestBody { get; set; }     // JSON body for POST/PUT/PATCH

List<MockFlowNode> Responses { get; }       // Success responses
List<MockFlowNode> ErrorResponses { get; }  // Error responses

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Sequential/RoundRobin cursor

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // Error cursor
```

**Routing:** `Enabled` OFF → real. `OfflineMode` ON → mock all. `UseMock` ON → mock. Else → real.
`SimulateError` picks between `Responses[]` and `ErrorResponses[]` via strategy.

### Example

```csharp
#if UNITY_EDITOR
var collection = Resources.Load<ApiEndpointCollection>("ApiEndpointCollection");
var ep = collection.Endpoints.First(e => e.Name == "Get Profile");

ep.UseMock = true;                     // Route this endpoint to mocks
ep.SimulateError = false;              // Serve from Responses[]
ep.ResponseStrategy = ResponseStrategy.Sequential;
ep.LoopResponses = true;

UnityEditor.EditorUtility.SetDirty(collection);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

> `Id` is preserved across URL/method edits and across OpenAPI
> import/export round-trips (stored as `x-amt-id` in the exported spec). Don't
> generate IDs yourself; let the toolkit assign them.

---

## EnvironmentManager

Persistent singleton. Stores environments and globals in `Application.persistentDataPath/ApiMockingToolkit/Environments/`.

**Properties:**
```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // Ignored if not registered
string BuildEnvironmentId { get; set; }             // Env compiled into builds
ApiEnvironment BuildEnvironment { get; }
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

**Methods:**
```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);        // False if null or only one left
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);                // Active env first, then globals
ApiRequest InterpolateRequest(ApiRequest req);     // Strict; throws on unresolved
void SaveEnvironments();
```

**ApiEnvironment:**
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

**Example:**
```csharp
var envManager = EnvironmentManager.Instance;
var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;
string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

**Build enforcement:** `BuildPreprocessor` checks `OfflineMode` OFF, `BuildEnvironmentId` registered, active env matches build env. Play Mode has no restrictions. Violations fail build with `BuildFailedException`.

---

## SessionManager

Editor-only. Persists sessions in `Application.persistentDataPath/ApiMockingToolkitSessions/`.

**Properties:**
```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // Fires on start/end/delete
```

**Methods:**
```csharp
void StartNewSession();
void EndCurrentSession();               // Also saves to disk
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);
List<Session> LoadAllSessions();
Session LoadSession(string sessionId);  // By ID, not file path
void DeleteSession(string sessionId);
void DeleteAllSessions();
int GetSavedSessionCount();
string GetSessionFolderPath();
```

**Example:**
```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
sessionManager.StartNewSession();
// ... play, make API calls ...
sessionManager.EndCurrentSession();   // Auto-saves
var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"Session: {session.TotalRequests} requests, {session.GetDurationSeconds()}s duration");
#endif
```

Gated by `EnableSessionPersistence`. Max 1,000 sessions on disk; older auto-pruned.

---

## Configuration

**ResponseStrategy:**
```csharp
Sequential   // 1 → 2 → 3 → 1 (loops if LoopResponses)
RoundRobin   // Cycle through evenly, forever
Random       // Uniform random per call
```

**MatchType:**
```csharp
Exact       // request.url == endpoint.url
Contains    // request.url.Contains(endpoint.url)
```

**HTTP Methods (Constants.HttpMethods):**
```csharp
Get    // "GET"
Post   // "POST"
Put    // "PUT"
Patch  // "PATCH"
Delete // "DELETE"
Head   // "HEAD"
```

Game code calls `ApiClient` methods directly; no need to specify method strings.

---

## Troubleshooting

**Endpoints not matched:** `Enabled`? Offline Mode set? URL matches (case-sensitive)? MatchType (Exact vs Contains)? Correct collection? HTTP method match? `UseMock` ON (if Offline Mode OFF)?

**Variables not replaced:** Exists in active env/global? Syntax `{{variableName}}`? Typos? Active env set? Throws `MissingEnvironmentVariableException` with available vars.

**Sessions not saving:** `EnableSessionPersistence` true? Running in Editor (sessions Editor-only)? `EndCurrentSession()` called or exited Play Mode? Check Console for `[SessionManager]` errors.

**Demo Scene broken:** Re-import Samples from Package Manager. Select "Demo Scene Collection". Check Console.

**Build errors:** `OfflineMode` ON (disable). No build environment set or active env mismatch. Scripting backend/API compatibility level for `async/await`.

**Performance:** Limit response body size. Reduce latency. Disable session persistence if not needed.
