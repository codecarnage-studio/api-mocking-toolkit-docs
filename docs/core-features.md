---
id: core-features
title: Core Features
sidebar_position: 2
---

Deep dive into core features.

---

## Editor Window Layout

Open: `Window > CodeCarnage > API Mocking Toolkit`

**Three tabs:** Endpoints (collections/folders/editor), Sessions (recordings/replay), Environments (selectors/variables/import/export)

**Left pane:** collection picker, folder tree, endpoint list, **+ Endpoint** button.
**Right pane:** Mock (Success/Error sub-tabs with Body/Headers) and Response (live viewer, capture buttons).
**Request panel:** method, URL, Headers/Body, Send button. Variables hint chip lists available `{{variable}}`s.
**Toolbar:** Enabled, Offline Mode, collection dropdown, Import/Export (OpenAPI 3.0 + `x-amt-*`).

---

## Response Strategies

Control which response is returned on each call:
- **Sequential** – Play in order; loop per `LoopResponses` flag
- **RoundRobin** – Cycle forever
- **Random** – Uniform random

### Shop Pagination Example

Endpoint: `GET /api/shop/items` returns 30 items, 10 per page.

Setup: Create endpoint `GET /api/shop/items` with 3 responses:

**Response 1 (Page 1):**
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

**Response 2 (Page 2):**
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

**Response 3 (Page 3):**
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

Set Response Strategy to **Sequential**. In code:

```csharp
// Your game code
for (int page = 1; page <= 5; page++)
{
    var response = await ApiClient.Get("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"Page {page}: {data.items.Length} items");
}

// Output (with LoopResponses = true):
// Page 1: 10 items (Response 1)
// Page 2: 10 items (Response 2)
// Page 3: 10 items (Response 3)
// Page 4: 10 items (Response 1 - looped!)
// Page 5: 10 items (Response 2)
```

Pagination tested without backend coordination.

**Strategies:**
- Sequential: 1 → 2 → 3 → (loop or stop)
- RoundRobin: 1 → 2 → 3 → 1 → 2 → 3 (always cycles)
- Random: 2 → 1 → 3 → 2 → 2 → 1

For "mostly success, sometimes error" mix, use `Random` strategy with both `Responses[]` and `ErrorResponses[]`.

---

## Offline Mode & Per-Endpoint Mock Toggle

Global **Offline Mode** (`ApiGlobalConfig`) and per-endpoint **Mock Enabled** (`UseMock`) toggle control routing.

**Routing order:**
1. `ApiGlobalConfig.Enabled` OFF → real backend (toolkit bypassed)
2. `OfflineMode` ON → all mocked (or fail if no endpoint match)
3. `OfflineMode` OFF + matched endpoint + `UseMock` ON → mocked
4. Else → real network

Per-endpoint toggle lets you keep endpoint configured while routing to real backend — useful for capturing live responses or A/B testing.

**Enable Offline Mode:**
```text
Window > CodeCarnage > API Mocking Toolkit
Toggle "Offline Mode" ON
```

**Read at runtime:**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

Use for development without backend, testing without flaky networks, conference demos.

---

## Environments & Variables

Manage different backends without code changes.

Create environments: Development, Staging, Production. Each has own `baseUrl` and variables.

**Variable interpolation in URLs and bodies:**
```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**Scope priority (highest to lowest):**
1. Endpoint-specific
2. Environment-specific  
3. Global

**Switch at runtime:**
```csharp
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

Unresolved variables throw `MissingEnvironmentVariableException`. No hardcoded URLs.

### Production Build Safety

`BuildPreprocessor` runs before builds. Checks:
1. `OfflineMode` must be OFF
2. `BuildEnvironmentId` must point to registered environment
3. Active environment must match build environment

**Manage Environments:** `Window > CodeCarnage > API Mocking Toolkit > Manage Environments`
- **EDITOR:** active environment for Play Mode (switch freely)
- **BUILD:** environment compiled into builds (one only)

Violations fail build with `BuildFailedException`.

**Best practice:** Development (Dev), Staging (QA pick), Production (Build). Only BUILD environment ships.

---

## Collections & Folders

Keep hundreds of endpoints organized.

**Collections:** separate endpoint groups (games, API versions). One active at a time via `ApiGlobalConfig.ActiveCollectionName`.

Create: Right-click Project window → `Create > CodeCarnage > API Mocking Toolkit > Endpoint Collection`.

**Folders:** organize endpoints inside collection (Authentication, Player Data, Leaderboard).

Best practices: Use **Collections** for games/versions/test suites. Use **Folders** for features/services.

---

## Session Management

Record all API requests during Play Mode, save, replay later.

**Recording:** Enable **Session Persistence** on `ApiGlobalConfig` → Play Mode → calls auto-recorded → exit → saved to `Application.persistentDataPath/ApiMockingToolkitSessions/`.

**REC Banner:** Click **Stop** to end session early without leaving Play Mode (useful for slicing long sessions). Banner auto-hides when inactive.

**Replaying:** Sessions tab → select session → Load Session → review requests/responses.

Use for bug reproduction, performance bottleneck analysis, team sharing. Editor-only (not compiled to builds). Max 1,000 sessions kept; older pruned auto.

**Use cases:** Long, complex bugs; exact failing scenarios; performance analysis.

---

## OpenAPI Integration

**Import:** Toolkit → Import → select `.json` or `.yaml` → endpoints auto-created

Example OpenAPI:
```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Success
```

Result: endpoint created with URL, method, 200 response.

**Variable conversion:** OpenAPI `{variable}` → Toolkit `{{variable}}`

**Export:** Configure endpoints → Export → save `.json` → send to backend

Round-trip safe: Export → Import → Export = same file. Toolkit-specific data (folders, strategies, latency, multiple responses) preserved via `x-amt-*` extensions. Backend tools ignore extensions, use standard OpenAPI 3.0.

---

## Error Simulation

Test error and latency handling without breaking real backends.

Add endpoint → add error responses (4xx/5xx) → set latency (ms) on response:

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

Use `ErrorResponses[]` with `Random` strategy for occasional failures, or `Sequential` for deterministic:
```text
Responses[]:        Success 200 (latency 100 ms)
ErrorResponses[]:   Error   500 (latency 1500 ms)
                    Error   404 (latency 100 ms)
```

**Latency use cases:** loading bar visibility, slow-but-successful UX, poor network conditions (mobile, Wi-Fi drops).

Handle in code:
```csharp
var response = await ApiClient.Get("/api/data");
if (!response.Success) {
    switch (response.StatusCode) {
        case 401: ShowLoginScreen(); break;
        case 429: ShowRateLimitMessage(); break;
        case 500: ShowErrorDialog("Server error"); break;
    }
}
```

---

## Capturing Live API Responses

Bridge real APIs and mocked development.

**Setup:** Configure endpoint with real URL → turn OFF Offline Mode → Click "Send".

**Capture:** After response received, click "Save Body as Success Mock" or "Save Body as Error Mock" (Body tab) / "Save Headers as..." (Headers tab).

**Menu options:**
- Append as New Response
- Replace All Responses
- Replace specific response by name

**Customize:** Response name, status code, latency (ms), body, headers. All pre-filled from capture. Click Confirm.

Toolkit auto-sets `UseMock` ON, ready to use offline.

**Example:**
```csharp
// Configure: https://api.mygame.com/leaderboard/global, Offline Mode OFF
var response = await ApiClient.Get("https://api.mygame.com/leaderboard/global");

// In Editor: Click "Save Body as Success Mock" → Name: "Production Leaderboard"
// Toggle Offline Mode ON → now cached response used, no network call
var cachedResponse = await ApiClient.Get("https://api.mygame.com/leaderboard/global");
```

**Use cases:** Test staging data offline, reproduce production bugs, build error libraries, performance testing, team sharing.

**Variable support:** Edit captured response to use `{{baseUrl}}`, `{{apiKey}}` instead of hardcoded values. Switch environments without changing mocks. Variables scoped: endpoint-specific (highest) → environment → global.

**Prevention:** Confirmation dialogs for destructive actions (Replace All/Replace Specific).

**Best practices:** Name responses descriptively ("User Profile - Premium Tier"). Capture errors intentionally (401, 404, 500). Use latency to test spinners/timeouts. Combine with Response Strategies. Version control collections via Git.
