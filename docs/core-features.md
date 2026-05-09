---
id: core-features
title: Core Features (Deep Dive)
sidebar_position: 2
---

You've seen the basics in the Quick Start. This page dives into the **core features** that make API Mocking Toolkit powerful.

Each section below stands on its own. You can:
- Skim for a high-level understanding, **or**
- Follow along in the Editor and reproduce the examples exactly.

---

## Editor Window Layout

Open via `Window > CodeCarnage > API Mocking Toolkit`. The window has three top-level tabs and a resizable split layout.

**Top-level tabs:**

| Tab | Purpose |
|-----|---------|
| **Endpoints** | Browse collections + folders, edit a selected endpoint |
| **Sessions** | Recorded Play Mode sessions, REC banner, replay |
| **Environments** | EDITOR/BUILD environment selectors, variables, import/export |

**Endpoint editor split panes (drag the dividers to resize, double-click to collapse):**

- **Left pane** — collection picker, folder tree, endpoint list, **+ Endpoint** button.
- **Right pane** — two grouped tabs:
  - **Mock** — configure stored responses. Sub-tabs: **Success** (`Responses[]`) and **Error** (`ErrorResponses[]`). Each has further **Body** / **Headers** sub-tabs and a strategy + loop toggle.
  - **Response** — live response viewer for the most recent **Send**. Sub-tabs: **Body** / **Headers**. Capture buttons live here (see [Capturing Live API Responses](#capturing-live-api-responses)).

**Request panel** (above the right-pane tabs) holds method, URL, request **Headers** / **Body** sub-tabs, and the **Send** button. The variables hint chip below the URL lists every `{{variable}}` resolvable in the active environment.

**Toolbar** (top of window) exposes: master **Enabled** toggle, **Offline Mode** toggle, active collection dropdown, and Import / Export buttons (OpenAPI 3.0 with `x-amt-*` round-trip).

---

## Response Strategies (Pagination & Variations)

When the same endpoint is called multiple times, you can control **which response** is returned on each call.

Think of it like a playlist:
- **Sequential** – Play in order; loop or stop at the end depending on the
  endpoint's `LoopResponses` flag
- **RoundRobin** – Cycle through responses forever
- **Random** – Shuffle mode (uniform distribution)

### Real Example: Shop Pagination

You have a shop endpoint: `GET /api/shop/items`.
Backend returns 30 items total, 10 per page.

**Setup in API Mocking Toolkit:**

1. Create endpoint: `GET /api/shop/items`
2. Add 3 responses:

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

3. Set **Response Strategy** to `Sequential`.

**In code:**

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

✅ **Result:** Your pagination logic is tested thoroughly, with **zero** backend coordination.

### Strategy Summary

| Strategy      | Behavior                                                   | Use Case                            |
|---------------|------------------------------------------------------------|-------------------------------------|
| Sequential    | 1 → 2 → 3 → (loop or stop, per `LoopResponses`)            | Pagination, scripted flows          |
| RoundRobin    | Evenly cycles 1 → 2 → 3 → 1 → 2 → 3 forever                | Load-balancing simulations          |
| Random        | Uniform random response each call                          | Varied gameplay testing             |

```text
Sequential:  1 → 2 → 3 → 1 → 2 → 3   (loops)
RoundRobin:  1 → 2 → 3 → 1 → 2 → 3   (always cycles)
Random:      2 → 1 → 3 → 2 → 2 → 1
```

> Need a "mostly success, sometimes error" mix? Add multiple responses and use
> `Random`, or split success/error responses across the endpoint's
> `Responses[]` and `ErrorResponses[]` lists — the toolkit does not currently
> ship a weighted strategy.

---

## Offline Mode & Per-Endpoint Mock Toggle

Two layers control mock vs real routing: the global **Offline Mode** switch on
`ApiGlobalConfig`, and a per-endpoint **Mock Enabled** toggle (`UseMock`) on
each `ApiEndpoint`.

### How It Works

The interceptor evaluates these in order on every request:

1. **`ApiGlobalConfig.Enabled` OFF** (master switch) → toolkit bypassed, every
   request goes to real backend.
2. **`OfflineMode` ON** → every request is mocked (matched endpoint config used
   if available; unmatched requests fail rather than hitting real servers).
3. **`OfflineMode` OFF + matched endpoint + endpoint's `Mock Enabled` ON** →
   mocked.
4. **Anything else** (matched endpoint with `Mock Enabled` OFF, or unmatched
   request) → real network request.

### The `Mock Enabled` Toggle

Each endpoint has a **Mock Enabled** toggle in the editor toolbar (`UseMock`
field on `ApiEndpoint`). It lets you keep an endpoint configured while
selectively routing it to the real backend — handy for capturing live
responses, A/B comparing mock vs real, or switching individual endpoints over
without flipping `OfflineMode`.

### Enable Offline Mode

**In Editor:**
```text
Window > CodeCarnage > API Mocking Toolkit
Toggle "Offline Mode" ON
```

**In Code (read-only at runtime):**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

> `OfflineMode` is a serialized field on the `ApiGlobalConfig` asset. To
> change it from an Editor script, use `SerializedObject` — see the
> [API Reference](/docs/api-reference#apiglobalconfig).

### Use Cases

✅ **Development without backend**  
✅ **Testing without flaky networks**  
✅ **Conference demos / live streams**

---

## Environments & Variables (Dev / Staging / Prod)

Manage different backends and configs **without changing your game code**.

### Creating Environments

1. `Window > CodeCarnage > API Mocking Toolkit`
2. Click **Environments** tab
3. Add environments:
   - Development
   - Staging
   - Production

Example environment layout (conceptual):

- Each environment (Dev, QA, Prod EU, Prod NA) defines its own `baseUrl`.
- `ApiClient` uses the active environment's `baseUrl` to build requests.
- `ApiClient` can route requests either to mocked responses or the real backend.

Each environment provides its own variable values (like `baseUrl` or `region`), and the active environment controls how `{{baseUrl}}` and other variables resolve at runtime.

### Variable Interpolation

Use `{{variableName}}` in URLs and response bodies.

**Variables at a glance:**

| Scope   | Example variables                                                        |
| ------- | ------------------------------------------------------------------------ |
| Global  | `apiKey = abc123`, `userId = player-001`                                 |
| Dev     | `baseUrl = http://localhost:3000`, `region = us-west`                   |
| Prod    | `baseUrl = https://jsonplaceholder.typicode.com`, `region = us-east`    |

**URL template:**

```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**How it resolves:**

```text
Dev : http://localhost:3000/users/player-001?key=abc123
Prod: https://jsonplaceholder.typicode.com/users/player-001?key=abc123
```

### Variable Scope Priority

1. **Endpoint-specific** (highest priority)  
2. **Environment-specific**  
3. **Global** (fallback)

### Code Example

```csharp
// Switch environments at runtime
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;

// Same code, different URLs based on environment
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

> If a variable can't be resolved, the toolkit throws
> `MissingEnvironmentVariableException` listing the available variables in
> the active environment and the global scope — interpolation is strict, not
> silent.

✅ No hardcoded URLs. Switch environments with a dropdown or one line of code.

### Production Build Safety

**⚠️ Important: Environment restrictions for production builds**

The toolkit's `BuildPreprocessor` runs before every Unity build (`File >
Build`) and refuses to build if the configuration is unsafe.

**What it checks:**

1. `ApiGlobalConfig.OfflineMode` must be **OFF** — production builds may not
   ship in mock-everything mode.
2. `EnvironmentManager.BuildEnvironmentId` must point to a registered
   environment. (If no build environment is set, the build still proceeds with
   a warning — fine for projects that hardcode URLs and don't use
   `{{variable}}` interpolation.)
3. The currently `ActiveEnvironment` must match the build environment, so the
   variables you tested with are the variables you ship.

**Manage Environments dialog:**

In `Window > CodeCarnage > API Mocking Toolkit > Manage Environments` you
pick:

- **EDITOR** dropdown — which environment is active right now (Play Mode).
- **BUILD** dropdown — which environment will be compiled into Unity builds.

Only one BUILD environment can be selected at a time; switching it just
reassigns `BuildEnvironmentId`.

**Play Mode vs Unity Build:**

| Mode | Restriction | Purpose |
|------|-------------|---------|
| **Play Mode (▶️)** | None — switch environments freely | Local testing and development |
| **Unity Build** | OfflineMode OFF + EDITOR matches BUILD | Production deployment safety |

**What happens if you don't follow the rules:**

The build fails with a `BuildFailedException` such as:

- `Build failed: OfflineMode is enabled.`
- `Build failed: '<BuildEnv>' is set as the build environment but no active
  environment is selected.`
- `Build failed: Active environment mismatch. Active='Development',
  Build='Production'.`

**Best Practice:**

```text
Development   (EDITOR while developing)   → baseUrl = http://localhost:3000
Staging       (occasional EDITOR pick)    → baseUrl = https://staging.api.mygame.com
Production    (BUILD environment, EDITOR before File > Build) → baseUrl = https://api.mygame.com
```

Only the selected BUILD environment ships when you run `File > Build`.

---

## Collections & Folders (Organize Large Projects)

Keep hundreds of endpoints manageable with **Collections** and **Folders**.

### Collections

- Separate groups of endpoints (e.g., different games or API versions)
- One collection active at a time

**Create a Collection:**

Right-click in the Project window and pick `Create > Window > CodeCarnage >
API Mocking Toolkit > Endpoint Collection`. The new asset can live anywhere
under `Assets/`; the toolkit picks the active one by name via
`ApiGlobalConfig.ActiveCollectionName`.

Use the collection dropdown in the toolkit window to switch between them.

### Folders

Organize endpoints inside a collection:

```text
📁 Authentication
  └─ POST /login
  └─ POST /register
  └─ POST /logout

📁 Player Data
  └─ GET /player/profile
  └─ POST /player/save
  └─ GET /player/inventory

📁 Leaderboard
  └─ GET /leaderboard/global
  └─ GET /leaderboard/friends
```

**Best Practices:**
- Use **Collections** for: different games, API versions, or major test suites
- Use **Folders** for: features (Auth, Shop) or services (User, Game, Social)

---

## Session Management (Time-Travel Debugging)

⭐ **UNIQUE FEATURE – Replay entire play sessions.**

Record all API requests during Play Mode, save them, and replay later.

### Recording

1. Enable **Enable Session Persistence** on the `ApiGlobalConfig` asset
   (toggle in the toolkit window, or in the Inspector)
2. Enter Play Mode
3. All API calls are automatically recorded
4. Exit Play Mode → Session saved to disk under
   `Application.persistentDataPath/ApiMockingToolkitSessions/`

### REC Banner & Manual Stop

While a session is recording, the **Sessions** tab shows a pulsing red **REC**
banner with a **Stop** button. Click **Stop** to end the current session
immediately and flush it to disk without leaving Play Mode — useful when you
want to slice a long Play Mode session into multiple smaller saved sessions
(e.g., one per scenario or bug repro). The banner hides itself automatically
when no session is active.

> Sessions are **Editor-only**. The `SessionManager` type is not compiled into
> standalone builds, and at most 1,000 sessions are kept on disk
> (`Constants.SessionLimits.MaxSessions`); older files are pruned
> automatically.

### Replaying

1. `Window > CodeCarnage > API Mocking Toolkit > Sessions` tab
2. Select a past session
3. Click **Load Session**
4. Review all requests/responses

**Use Cases:**
- Reproduce long, complex bugs
- Share exact failing sessions with teammates
- Analyze performance bottlenecks

---

## OpenAPI Integration (Work with Backend Teams)

Import/export OpenAPI (Swagger) specs for real collaboration.

### Importing

1. `Window > CodeCarnage > API Mocking Toolkit`
2. Click **Import**
3. Select `.json` or `.yaml` OpenAPI file
4. Endpoints are created automatically

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

**Result:** Endpoint created with URL, method, and a default 200 response.

### Variable Conversion

OpenAPI uses `{variable}`, API Mocking Toolkit uses `{{variable}}`.

```text
OpenAPI:  /users/{userId}/profile
Imported: /users/{{userId}}/profile
```

### Exporting

1. Configure endpoints in API Mocking Toolkit
2. Click **Export**
3. Save `.json` file
4. Send to backend team – they implement to that spec

```text
Export → Import → Export = Same file (round-trip safe)
```

> Toolkit-specific data (folder structure, response strategies, latency,
> multiple example responses, error responses) is preserved across a
> round-trip via `x-amt-*` OpenAPI extensions. Backend tools that don't
> understand these extensions just ignore them — the rest of the document is
> standard OpenAPI 3.0.

---

## Error Simulation (Test Failure Paths Safely)

Test error and latency handling **without** breaking real backends.

### Simulating Errors & Latency

1. Add endpoint: `GET /api/data`  
2. Add one or more error responses (4xx/5xx)  
3. Optionally set **Latency** (for example 100 ms, 1 s, 5 s) on a response to simulate slow or timing‑out backends and to exercise loading bars, spinners, and other async UI behaviours.

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

Or configure multiple responses with different status codes and latencies and
let the toolkit pick one. Use the endpoint's `ErrorResponses[]` list together
with a `Random` strategy to simulate occasional failures, or use `Sequential`
to script a deterministic sequence:

```text
Responses[]:        Success 200 (latency 100 ms)
ErrorResponses[]:   Error   500 (latency 1500 ms)
                    Error   404 (latency 100 ms)
```

**Latency use cases:**

- Make sure loading bars/spinners stay visible for the whole request and disappear only when a response arrives.
- Test UX for **slow but successful** calls (e.g., show "Still loading…" or allow the player to cancel).
- Simulate poor network conditions (mobile, Wi‑Fi drops) by mixing fast and slow responses in the same endpoint.

### Handling Errors in Code

```csharp
var response = await ApiClient.Get("/api/data");

if (!response.Success)
{
    switch (response.StatusCode)
    {
        case 401:
            ShowLoginScreen();
            break;
        case 429:
            ShowRateLimitMessage();
            break;
        case 500:
            ShowErrorDialog("Server error, please try again");
            break;
    }
}
```

✅ This lets you reliably test **all** your error paths.

---

## Capturing Live API Responses​
⭐ **Bridge real APIs and mocked development** – Test against staging/production, capture exact responses, work offline.

### The Problem​
You want to test your game with real backend data, but:
- ❌ Copy-pasting JSON from Postman is tedious
- ❌ Manually formatting responses introduces errors
- ❌ Backend changes require updating mocks manually
- ❌ Headers and status codes get lost in translation

### The Solution​
Capture live API responses with one click and save them as mocks with full customization.

### How It Works​

**Step 1: Send Real Request**

Configure your endpoint with the real backend URL and turn OFF Offline Mode:

```
Endpoint Configuration:
• URL: https://staging-api.mygame.com/user/profile
• Method: GET
• Offline Mode: OFF (so request goes to real backend)
```

Click "Send" to make the actual API call.

**Step 2: Capture Response**

After receiving the response, the toolkit shows two capture buttons whose
labels follow the active tab (Body or Headers):

- Body tab → **"Save Body as Success Mock"** / **"Save Body as Error Mock"**
- Headers tab → **"Save Headers as Success Mock"** / **"Save Headers as Error Mock"**

"Success" routes the captured data into the endpoint's `Responses[]` list,
"Error" routes it into `ErrorResponses[]`.

A menu appears with three options:

| Option | What It Does |
|--------|--------------|
| **Append as New Response...** | Adds this response to your existing list |
| **Replace All Responses...** | Clears all responses and replaces with this one |
| **Replace Response → [name]** | Replaces a specific existing response |

**Step 3: Customize Before Saving**

A customization window opens where you can edit:

| Field | Description | Example |
|-------|-------------|---------|
| **Response Name** | Friendly identifier | "Staging User Profile" |
| **Status Code** | HTTP status | 200, 404, 500 |
| **Latency (ms)** | Simulated delay | 0, 100, 2000 |
| **Body** | Response content (captured automatically) | `{"id": 123, "name": "..."}` |
| **Headers** | Key-value pairs (captured automatically) | `Content-Type: application/json` |

**Body/Headers Tabs:**
- Switch between Body and Headers tabs
- Headers are editable key-value pairs
- Add/delete headers with buttons
- All data pre-filled from the captured response

**Step 4: Confirm**

Click "Confirm" to save. The toolkit automatically:
✅ Saves response to your endpoint's response list
✅ Sets the endpoint's **Mock Enabled** toggle (`UseMock`) to ON, so future
   requests to this endpoint use the captured mock instead of the real backend
✅ Makes it ready to use immediately

### Real-World Example​

**Scenario:** You're building a leaderboard and want to test with real production data.

```csharp
// 1. Configure endpoint
// URL: https://api.mygame.com/leaderboard/global
// Offline Mode: OFF

// 2. Make real request to production
var response = await ApiClient.Get(
    "https://api.mygame.com/leaderboard/global"
);

// 3. In Unity Editor:
//    • Click "Save Body as Success Mock" (Body tab)
//    • Choose "Append as New Response..."
//    • Name: "Production Leaderboard - Jan 2026"
//    • Click Confirm

// 4. Toggle Offline Mode ON in the toolkit window
//    (Window > CodeCarnage > API Mocking Toolkit)

// 5. Now work offline with exact production data
var cachedResponse = await ApiClient.Get(
    "https://api.mygame.com/leaderboard/global"
);
// Returns exact production response, no network call!
```

**Benefits:**
- ✅ Exact production data for realistic testing
- ✅ Work offline at conferences, on planes, anywhere
- ✅ No copying/pasting or manual formatting
- ✅ Captured headers ensure authenticity
- ✅ Update anytime by capturing again

### Use Cases​

**1. Test Against Staging**
- Capture staging responses with realistic test data
- Work offline with exact staging environment
- Switch back online when backend changes

**2. Reproduce Production Bugs**
- Capture the exact response that caused a bug
- Debug locally without affecting production
- Share captured response with team via version control

**3. Error Scenario Library**
- Trigger real errors (wrong password, rate limit, server error)
- Capture each error response
- Build a library of realistic error mocks
- Use Response Strategies to mix success/error randomly

**4. Performance Testing**
- Capture large responses from production
- Test UI with realistic data volumes
- Measure rendering performance locally

**5. Team Collaboration**
- Capture responses from your staging environment
- Export the collection
- Share with team via Git
- Everyone works with identical data

### Variable Interpolation in Captured Responses​

💡 **Tip:** The toolkit shows available variables below the request line:

```
💡 Available variables (12): {{baseUrl}}, {{apiKey}}, {{userId}}, {{region}}, ...
```

When you capture a response, you can **edit it to use variables** instead of hardcoded values:

**Original Captured Response:**
```json
{
  "server": "us-east-api.mygame.com",
  "userId": 12345,
  "apiKey": "prod-key-abc123"
}
```

**After Editing to Use Variables:**
```json
{
  "server": "{{region}}-api.mygame.com",
  "userId": {{userId}},
  "apiKey": "{{apiKey}}"
}
```

**Why This Matters:**
- Switch between environments (dev, staging, prod) without changing mocks
- Personalize responses per environment
- Keep sensitive data in environment variables, not in mocks

**Variable Scopes:**
Variables shown in the hint come from:
1. **Global variables** – Available everywhere (e.g., `{{apiKey}}`)
2. **Environment variables** – Specific to active environment (e.g., `{{baseUrl}}`)
3. **Endpoint variables** – Specific to this endpoint (highest priority)

See the [Environments & Variables](#environments--variables-dev--staging--prod) section for managing variables.

### Confirmation Dialogs​

To prevent accidental data loss, confirmation dialogs appear for destructive actions:

**Replace All:**
```
⚠️ Confirm Replace All

This will REPLACE ALL Success responses with this single new response.

All existing 5 response(s) will be deleted.

Are you sure?

[Replace All]  [Cancel]
```

**Replace Specific:**
```
⚠️ Confirm Replace

This will replace BOTH the body AND headers of "User Profile - Test Data".

Are you sure?

[Replace]  [Cancel]
```

### Tips & Best Practices​

✅ **Name your responses descriptively**
   Instead of "Response 1", use "User Profile - Premium Tier" or "Error - Invalid Token"

✅ **Capture errors intentionally**
   Trigger 401, 404, 500 errors on staging and capture them for your error library

✅ **Use latency to test loading states**
   Set latency to 2000ms (2 seconds) to test loading spinners and timeout handling

✅ **Combine with Response Strategies**
   Capture multiple responses, then use Sequential / RoundRobin / Random
   strategies to cycle through them

✅ **Version control your collections**
   Commit captured responses to Git so your team works with identical data
