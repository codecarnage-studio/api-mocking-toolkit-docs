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
var response = await ApiClient.GetAsync("https://api.example.com/data");

// POST request
var response = await ApiClient.PostAsync(
    "https://api.example.com/data",
    "{\"key\":\"value\"}"
);

// PUT request
var response = await ApiClient.PutAsync(
    "https://api.example.com/data/123",
    "{\"key\":\"updated\"}"
);

// DELETE request
var response = await ApiClient.DeleteAsync("https://api.example.com/data/123");
```

### Handling Responses

```csharp
if (response.Success) {
    // Success - Status 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"Data: {data}");
} else {
    // Error - Status >= 400
    Debug.LogError($"Error {response.StatusCode}: {response.Body}");
}
```

### Offline Mode

```csharp
// Enable offline mode
ApiGlobalConfig.Instance.OfflineMode = true;

// Check if offline
if (ApiGlobalConfig.Instance.OfflineMode) {
    Debug.Log("Running in offline mode");
}
```

### Environments

```csharp
// Get environment manager
var envManager = EnvironmentManager.Instance;

// Switch environment
envManager.ActiveEnvironment = devEnvironment;

// Get variable
string baseUrl = envManager.GetVariable("baseUrl");
```

### Sessions

```csharp
// Enable session persistence
ApiGlobalConfig.Instance.EnableSessionPersistence = true;

// Access session manager
var sessionManager = SessionManager.Instance;

// Get current session
var session = sessionManager.CurrentSession;

// Save current session
sessionManager.EndCurrentSession();
```

---

## ApiClient

### Methods

#### GetAsync

```csharp
public static async Task<ApiResponse> GetAsync(string url)
```

**Parameters:**
- `url` (string): Full URL to request

**Returns:** `ApiResponse`

**Example:**
```csharp
var response = await ApiClient.GetAsync("https://api.example.com/users/123");
```

#### PostAsync

```csharp
public static async Task<ApiResponse> PostAsync(string url, string body)
```

**Parameters:**
- `url` (string): Full URL to request
- `body` (string): JSON body as string

**Returns:** `ApiResponse`

**Example:**
```csharp
var json = JsonUtility.ToJson(new LoginRequest { 
    username = "user", 
    password = "pass" 
});

var response = await ApiClient.PostAsync(
    "https://api.example.com/login",
    json
);
```

#### PutAsync

```csharp
public static async Task<ApiResponse> PutAsync(string url, string body)
```

**Parameters:**
- `url` (string): Full URL to request
- `body` (string): JSON body as string

**Returns:** `ApiResponse`

**Example:**
```csharp
var json = "{\"level\": 42}";
var response = await ApiClient.PutAsync(
    "https://api.example.com/player/123",
    json
);
```

#### DeleteAsync

```csharp
public static async Task<ApiResponse> DeleteAsync(string url)
```

**Parameters:**
- `url` (string): Full URL to request

**Returns:** `ApiResponse`

**Example:**
```csharp
var response = await ApiClient.DeleteAsync(
    "https://api.example.com/player/items/456"
);
```

### ApiResponse

```csharp
public class ApiResponse
{
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string Body { get; set; }
    public Dictionary<string, string> Headers { get; set; }
    public long Latency { get; set; } // milliseconds
}
```

**Example Usage:**
```csharp
var response = await ApiClient.GetAsync("/api/data");

Debug.Log($"Success: {response.Success}");
Debug.Log($"Status: {response.StatusCode}");
Debug.Log($"Body: {response.Body}");
Debug.Log($"Latency: {response.Latency}ms");

// Access headers
if (response.Headers.ContainsKey("Content-Type")) {
    Debug.Log($"Content-Type: {response.Headers["Content-Type"]}");
}
```

---

## ApiGlobalConfig

Global configuration singleton.

### Properties

```csharp
// Enable/disable offline mode
bool OfflineMode { get; set; }

// Enable session recording
bool EnableSessionPersistence { get; set; }

// Max sessions to keep
int MaxSavedSessions { get; set; }

// Active collection name
string ActiveCollectionName { get; set; }
```

### Example

```csharp
var config = ApiGlobalConfig.Instance;

// Configure
config.OfflineMode = true;
config.EnableSessionPersistence = true;
config.MaxSavedSessions = 50;

// Save changes
EditorUtility.SetDirty(config);
AssetDatabase.SaveAssets();
```

---

## EnvironmentManager

Manage environments and variables.

### Properties

```csharp
// Get all environments
List<Environment> Environments { get; }

// Get/Set active environment
Environment ActiveEnvironment { get; set; }
```

### Methods

```csharp
// Add environment
public void AddEnvironment(Environment env);

// Remove environment
public void RemoveEnvironment(Environment env);

// Get variable value
public string GetVariable(string variableName);

// Set variable
public void SetVariable(string variableName, string value);
```

### Example

```csharp
var envManager = EnvironmentManager.Instance;

// Create environment
var devEnv = new Environment {
    Name = "Development",
    Variables = new Dictionary<string, string> {
        { "baseUrl", "http://localhost:3000" },
        { "apiKey", "dev-key-123" }
    }
};

// Add and activate
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;

// Use variables in code
string url = envManager.GetVariable("baseUrl") + "/api/data";
```

### Build Metadata (AllowInBuild)

Environments include a boolean `AllowInBuild` flag used by the production build validator:

- In **Play Mode**, you can ignore this and switch between any environment.
- For **Unity builds**, the toolkit enforces that **exactly one** environment has `AllowInBuild == true`, and that this environment is active when you build.

```csharp
// Mark a production environment as buildable
var envManager = EnvironmentManager.Instance;

var prodEnv = new Environment {
    Name = "Production",
    Variables = new Dictionary<string, string> {
        { "baseUrl", "https://api.mygame.com" }
    },
    AllowInBuild = true
};

envManager.AddEnvironment(prodEnv);
envManager.ActiveEnvironment = prodEnv;
```

> 🔒 **Safety:** If no environment or multiple environments have `AllowInBuild == true`, the Unity build will fail with a clear error message.

---

## SessionManager

Manage request/response sessions.

### Properties

```csharp
// Current session
Session CurrentSession { get; }

// Is persistence enabled
bool IsPersistenceEnabled { get; set; }
```

### Methods

```csharp
// Start new session
public void StartNewSession();

// End and save current session
public void EndCurrentSession();

// Load session from file
public Session LoadSession(string filePath);

// Delete session
public void DeleteSession(string sessionId);

// Delete all sessions
public void DeleteAllSessions();
```

### Example

```csharp
var sessionManager = SessionManager.Instance;

// Enable persistence
sessionManager.IsPersistenceEnabled = true;

// Start new session
sessionManager.StartNewSession();

// ... play game, make API calls ...

// End session (auto-saves)
sessionManager.EndCurrentSession();

// Load past session
var session = sessionManager.LoadSession(
    "Assets/API Mocking Toolkit Sessions/session_2026-04-20.json"
);

Debug.Log($"Session had {session.TotalRequests} requests");
```

---

## Configuration

### Response Strategy Types

```csharp
public enum ResponseStrategy
{
    Sequential,   // Return in order, loop at end
    RoundRobin,   // Cycle through evenly
    Random,       // Random selection
    Weighted      // Probability-based
}
```

### Match Type

```csharp
public enum MatchType
{
    Exact,      // URL must match exactly
    Contains    // URL contains the pattern
}
```

### HTTP Methods

```csharp
public enum HttpMethod
{
    GET,
    POST,
    PUT,
    DELETE,
    PATCH
}
```

---

## Troubleshooting

### Common Issues

**Q: Endpoints not being matched**

A: Check these:
1. Is Offline Mode enabled?
2. Does URL match exactly (case-sensitive)?
3. Is the correct collection selected?
4. Check Method (GET vs POST)
5. Check Match Type (Exact vs Contains)

**Q: Variables not being replaced**

A: Ensure:
1. Variable exists in environment or global scope
2. Syntax is correct: `{{variableName}}`
3. No typos in variable name
4. Active environment is set

**Q: Sessions not saving**

A: Verify:
1. `EnableSessionPersistence` is true
2. Write permissions in `Assets/` folder
3. Called `EndCurrentSession()` or exited Play Mode
4. Check Console for errors

**Q: Demo Scene not working**

A: Try:
1. Re-import Samples from Package Manager
2. Select "Demo Scene Collection" in dropdown
3. Check Console for errors
4. Verify ApiClient is in scene

**Q: Build errors**

A: Common fixes:
1. Set scripting backend to IL2CPP (for async/await)
2. API Compatibility Level: .NET Standard 2.1
3. Check platform-specific issues

**Q: Performance issues**

A: Optimize:
1. Limit response body size
2. Reduce latency simulation
3. Disable session persistence if not needed
4. Limit max saved sessions

---

### Getting Help

**Asset Store Support:**
- Email: support@codecarnage.com
- Response time: 2-3 business days

**Community:**
- Discord: [link]
- GitHub Issues: [link]

**Documentation:**
- [Quick Start](/docs/quick-start)
- [Guides](/docs/guides)

---

**End of API Reference**
