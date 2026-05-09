---
id: api-reference
title: API Reference
sidebar_position: 3
---

Quick reference and code examples.

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

// GET request
var response = await ApiClient.Get("https://api.example.com/data");

// POST request (JSON body)
var response = await ApiClient.Post(
    "https://api.example.com/data",
    "{\"key\":\"value\"}"
);

// PUT request
var response = await ApiClient.Put(
    "https://api.example.com/data/123",
    "{\"key\":\"updated\"}"
);

// PATCH request
var response = await ApiClient.Patch(
    "https://api.example.com/data/123",
    "{\"key\":\"patched\"}"
);

// DELETE request
var response = await ApiClient.Delete("https://api.example.com/data/123");
```

All methods accept optional `headers` (`Dictionary<string, string>`) and a
`CancellationToken`:

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

Static entry point. Editor-only requests are routed through `ApiInterceptor`;
in standalone builds requests go to the real backend via `UnityWebRequest`.

### Methods

#### Get

```csharp
public static Task<ApiResponse> Get(
    string url,
    Dictionary<string, string> headers = null,
    CancellationToken ct = default
)
```

```csharp
var response = await ApiClient.Get("https://api.example.com/users/123");
```

#### Post

```csharp
public static Task<ApiResponse> Post(
    string url,
    string body,
    Dictionary<string, string> headers = null,
    CancellationToken ct = default
)
```

```csharp
var json = JsonUtility.ToJson(new LoginRequest {
    username = "user",
    password = "pass"
});

var response = await ApiClient.Post(
    "https://api.example.com/login",
    json
);
```

#### Put

```csharp
public static Task<ApiResponse> Put(
    string url,
    string body,
    Dictionary<string, string> headers = null,
    CancellationToken ct = default
)
```

#### Patch

```csharp
public static Task<ApiResponse> Patch(
    string url,
    string body,
    Dictionary<string, string> headers = null,
    CancellationToken ct = default
)
```

#### Delete

```csharp
public static Task<ApiResponse> Delete(
    string url,
    Dictionary<string, string> headers = null,
    CancellationToken ct = default
)
```

```csharp
var response = await ApiClient.Delete(
    "https://api.example.com/player/items/456"
);
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

ScriptableObject loaded at runtime from `Resources/ApiGlobalConfig`.
Properties are read-only at runtime; edit them via the API Mocking Toolkit
window or the Unity Inspector.

### Properties

```csharp
bool OfflineMode { get; }            // Mock everything, even unconfigured endpoints
bool Enabled { get; }                // Master switch for the toolkit
bool EnableSessionPersistence { get; } // Save sessions to disk
string ActiveCollectionName { get; set; } // Which ApiEndpointCollection to load
```

### Loading at Runtime

```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");

if (config.Enabled && config.OfflineMode) {
    Debug.Log("Toolkit active in offline mode");
}
```

### Editing from an Editor Script

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

Serializable model for a single configured endpoint. Stored inside an
`ApiEndpointCollection` ScriptableObject. Edited through the API Mocking
Toolkit window; rarely constructed by game code directly.

### Properties

```csharp
string Id { get; set; }                // Stable GUID — survives URL/method edits and OpenAPI round-trips
string Name { get; set; }              // Friendly display name
string Url { get; set; }               // URL or template ({{baseUrl}}/users)
string Method { get; set; }            // "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"
MatchType MatchType { get; set; }      // Exact | Contains

bool UseMock { get; set; }             // Per-endpoint "Mock Enabled" toggle
bool SimulateError { get; set; }       // false → use Responses[]; true → ErrorResponses[]

// Request-side payload (used by editor "Send" button to hit the real backend)
string Headers { get; set; }           // Raw headers blob — one "Key: Value" per line
string RequestBody { get; set; }       // Raw body (typically JSON) for POST/PUT/PATCH

List<MockFlowNode> Responses { get; }       // Success response pool
List<MockFlowNode> ErrorResponses { get; }  // Error response pool

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Sequential/RoundRobin cursor; reset on Play Mode enter

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // Error cursor; reset on Play Mode enter
```

### Routing Behavior

`ApiInterceptor` evaluates incoming requests in this order:

1. `ApiGlobalConfig.Enabled` OFF → real network (toolkit bypassed).
2. `ApiGlobalConfig.OfflineMode` ON → mock everything.
3. Matched endpoint with `UseMock == true` → mock.
4. Otherwise → real network.

When mocking, `SimulateError` chooses between `Responses[]` and
`ErrorResponses[]`; the corresponding `ResponseStrategy` /
`ErrorResponseStrategy` and loop flag pick a single entry from the list.

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

Persistent singleton. Stores environments and global variables on disk under
`Application.persistentDataPath/ApiMockingToolkit/Environments/`.

### Properties

```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // setter ignored if env not registered
string BuildEnvironmentId { get; set; }             // ID of env compiled into builds
ApiEnvironment BuildEnvironment { get; }            // resolved environment, or null
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

### Methods

```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);   // false if env null or only one left
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);            // active env first, then globals
ApiRequest InterpolateRequest(ApiRequest req); // strict; throws on unresolved
void SaveEnvironments();
```

### ApiEnvironment

```csharp
public class ApiEnvironment {
    public string Id { get; }                 // GUID
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

### Example

```csharp
var envManager = EnvironmentManager.Instance;

var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");

envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;

string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

### Build Environment

The toolkit enforces a single environment per build via
`EnvironmentManager.BuildEnvironmentId`:

- In **Play Mode**, any environment can be active.
- For **Unity builds**, `BuildPreprocessor` checks:
  - `ApiGlobalConfig.OfflineMode` must be OFF — otherwise build fails with
    `BuildFailedException`.
  - If `BuildEnvironmentId` resolves to a registered environment, the active
    environment must match it; otherwise the build fails.
  - If no `BuildEnvironmentId` is set, the build proceeds with a warning
    (fine for projects that hardcode URLs and don't use `{{variable}}`
    interpolation).

```csharp
var envManager = EnvironmentManager.Instance;

var prodEnv = new ApiEnvironment("Production", "https://api.mygame.com");
envManager.AddEnvironment(prodEnv);
envManager.ActiveEnvironment = prodEnv;
envManager.BuildEnvironmentId = prodEnv.Id;
envManager.SaveEnvironments();
```

> 🔒 **Safety:** If a build environment is set and the active environment
> differs from it, the Unity build fails with a clear error message. If no
> build environment is set, the build proceeds with a warning.

---

## SessionManager

Editor-only. Persists session JSON files under
`Application.persistentDataPath/ApiMockingToolkitSessions/`.

### Properties

```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // fired on start/end/delete
```

### Methods

```csharp
void StartNewSession();
void EndCurrentSession();                // also saves to disk
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);

List<Session> LoadAllSessions();
Session       LoadSession(string sessionId);   // by ID, not file path

void DeleteSession(string sessionId);
void DeleteAllSessions();

int    GetSavedSessionCount();
string GetSessionFolderPath();
```

### Example

```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;

sessionManager.StartNewSession();

// ... play game, make API calls ...

sessionManager.EndCurrentSession();   // auto-saves

var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"Session had {session.TotalRequests} requests, " +
          $"duration {session.GetDurationSeconds()}s");
#endif
```

> Persistence is gated by `ApiGlobalConfig.EnableSessionPersistence`. Cleanup
> keeps at most `Constants.SessionLimits.MaxSessions` (1,000) files on disk.

---

## Configuration

### Response Strategy

```csharp
public enum ResponseStrategy
{
    Sequential,   // 1 → 2 → 3 → 1 (loops if Endpoint.LoopResponses)
    RoundRobin,   // Cycle through evenly, forever
    Random        // Uniform random selection per call
}
```

### Match Type

```csharp
public enum MatchType
{
    Exact,      // request.url == endpoint.url
    Contains    // request.url.Contains(endpoint.url)
}
```

### HTTP Methods

HTTP method names are exposed as string constants under `Constants.HttpMethods`
(used internally by `ApiRequest`):

```csharp
Constants.HttpMethods.Get      // "GET"
Constants.HttpMethods.Post     // "POST"
Constants.HttpMethods.Put      // "PUT"
Constants.HttpMethods.Patch    // "PATCH"
Constants.HttpMethods.Delete   // "DELETE"
Constants.HttpMethods.Head     // "HEAD"
```

Game code does not pick a method directly — it calls the matching `ApiClient`
method (`Get`, `Post`, `Put`, `Patch`, `Delete`).

---

## Troubleshooting

### Common Issues

**Q: Endpoints not being matched**

A: Check these:
1. Is the toolkit `Enabled` and Offline Mode set as you expect?
2. Does the URL match (case-sensitive) under the configured `MatchType` (Exact vs Contains)?
3. Is the correct collection selected (`ApiGlobalConfig.ActiveCollectionName`)?
4. Does the HTTP method match (GET vs POST etc.)?
5. With Offline Mode OFF, is the endpoint's **Mock Enabled** toggle (`UseMock`)
   ON? If OFF, matched endpoints still go to the real backend.

**Q: Variables not being replaced**

A: Ensure:
1. Variable exists in the active environment or global scope.
2. Syntax is `{{variableName}}`.
3. No typos in variable name.
4. Active environment is set.

If interpolation fails, the toolkit throws `MissingEnvironmentVariableException`
with a list of available variables.

**Q: Sessions not saving**

A: Verify:
1. `ApiGlobalConfig.EnableSessionPersistence` is true.
2. You are running in the Unity Editor (sessions are Editor-only).
3. `EndCurrentSession()` was called (or you exited Play Mode).
4. Check the Console for `[SessionManager]` errors.

**Q: Demo Scene not working**

A: Try:
1. Re-import the Samples folder from Package Manager.
2. Select "Demo Scene Collection" in the collection dropdown.
3. Check the Console for errors.

**Q: Build errors**

A: Common causes:
1. `OfflineMode` is on — disable it before building.
2. No environment marked as the build environment, or the active environment
   differs from the build environment.
3. Set scripting backend / API compatibility level appropriately for `async/await`.

**Q: Performance issues**

A: Optimize:
1. Limit response body size.
2. Reduce simulated latency.
3. Disable session persistence if not needed.

---

### Getting Help

**Asset Store Support:**
- Email: support@codecarnage.com
- Response time: 2-3 business days

**Documentation:**
- [Quick Start](/docs/quick-start)
- [Guides](/docs/guides)

---

**End of API Reference**
