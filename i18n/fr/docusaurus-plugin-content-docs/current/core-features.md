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

## Response Strategies (Pagination & Variations)

When the same endpoint is called multiple times, you can control **which response** is returned on each call.

Think of it like a playlist:
- **Sequential** – Play in order, loop at the end
- **RoundRobin** – Cycle through responses evenly
- **Random** – Shuffle mode
- **Weighted** – Some responses more likely than others

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
    var response = await ApiClient.GetAsync("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"Page {page}: {data.items.Length} items");
}

// Output:
// Page 1: 10 items (Response 1)
// Page 2: 10 items (Response 2)
// Page 3: 10 items (Response 3)
// Page 4: 10 items (Response 1 - looped!)
// Page 5: 10 items (Response 2)
```

✅ **Result:** Your pagination logic is tested thoroughly, with **zero** backend coordination.

### Strategy Summary

| Strategy      | Behavior                                    | Use Case                             |
|--------------|---------------------------------------------|--------------------------------------|
| Sequential   | 1 → 2 → 3 → 1 → 2 → 3                       | Pagination, multi-step flows         |
| RoundRobin   | Evenly cycles 1 → 2 → 3 → 1 → 2 → 3         | Load-balancing simulations           |
| Random       | Random response each call                   | Varied gameplay testing              |
| Weighted     | Uses weights (e.g. 90% success, 10% error)  | Realistic success/error distributions|

```text
Sequential:  1 → 2 → 3 → 1 → 2 → 3
RoundRobin:  1 → 2 → 3 → 1 → 2 → 3
Random:      2 → 1 → 3 → 2 → 2 → 1
Weighted:    ✓ → ✓ → ✗ → ✓ → ✓ → ✓
```

---

## Offline Mode (Work Completely Offline)

Global toggle to mock **all** API calls, even when an endpoint isn’t configured.

### How It Works

- **Offline Mode OFF (default):**
  - Configured endpoints → Mock response
  - Unconfigured endpoints → Real network request

- **Offline Mode ON:**
  - Configured endpoints → Mock response
  - Unconfigured endpoints → Error (so you don’t accidentally hit real servers)

### Enable Offline Mode

**In Editor:**
```text
Window > API Mocking Toolkit
Toggle "Offline Mode" ON
```

**In Code:**
```csharp
ApiGlobalConfig.Instance.OfflineMode = true;
```

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

| Scope   | Example variables                                           |
| ------- | ----------------------------------------------------------- |
| Global  | `apiKey = abc123`, `userId = player-001`                    |
| Dev     | `baseUrl = http://localhost:3000`, `region = us-west`      |
| Prod    | `baseUrl = https://api.mygame.com`, `region = us-east`     |

**URL template:**

```text
{{baseUrl}}/user/{{userId}}/profile?key={{apiKey}}
```

**How it resolves:**

```text
Dev : http://localhost:3000/user/player-001/profile?key=abc123
Prod: https://api.mygame.com/user/player-001/profile?key=abc123
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
var response = await ApiClient.GetAsync("{{baseUrl}}/user/profile");
```

✅ No hardcoded URLs. Switch environments with a dropdown or one line of code.

### Production Build Safety

**⚠️ Important: Environment restrictions for production builds**

The toolkit enforces strict rules when creating Unity builds to prevent accidentally deploying with the wrong environment configuration.

**Radio Button UI:**

Each environment has a radio button (●) that controls whether it's allowed in production builds:
- ✅ **One environment** must have the radio button selected (green fill)
- ❌ **No other environments** can be selected at the same time
- This is the environment that will be compiled into your production build

**Play Mode vs Unity Build:**

| Mode | Restriction | Purpose |
|------|-------------|---------|
| **Play Mode (▶️)** | None - use any environment | Local testing and development |
| **Unity Build** | Exactly ONE environment with "Allow in Build" enabled | Production deployment safety |

**What happens if you don't follow the rules:**

If you try to build (`File > Build`) without exactly one environment marked for builds:
- ❌ Build fails with clear error message
- ❌ Example: "Build failed: 3 environments are marked for builds. Only one is allowed."
- ❌ Example: "Build failed: Active environment 'Development' is not marked for builds."

**How to change which environment is used for builds:**

1. Open "Manage Environments" dialog
2. Click the radio button next to your production environment
3. All other environments automatically become un-selected
4. Only the selected environment will be compiled into Unity builds

**Why this restriction exists:**

- Prevents accidentally shipping dev/staging environment in production
- Forces you to explicitly choose which environment to deploy
- Ensures production builds only include production-safe variables
- Protects against configuration mistakes that could expose dev servers

**Best Practice:**

```text
Development   ○ (not for builds)  → baseUrl = http://localhost:3000
Staging       ○ (not for builds)  → baseUrl = https://staging.api.mygame.com
Production    ● (marked for builds) → baseUrl = https://api.mygame.com
```

Only "Production" will be included when you run `File > Build`.

---

## Collections & Folders (Organize Large Projects)

Keep hundreds of endpoints manageable with **Collections** and **Folders**.

### Collections

- Separate groups of endpoints (e.g., different games or API versions)
- One collection active at a time

**Create a Collection:**
```text
Assets > Create > API Mocking Toolkit > API Endpoint Collection
```

Use the collection dropdown in the window to switch between them.

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

1. Enable session persistence in Global Config  
2. Enter Play Mode  
3. All API calls are automatically recorded  
4. Exit Play Mode → Session saved to disk

```csharp
// Enable session persistence
ApiGlobalConfig.Instance.EnableSessionPersistence = true;

// Set max sessions to keep
ApiGlobalConfig.Instance.MaxSavedSessions = 20;
```

### Replaying

1. `Window > API Mocking Toolkit > Sessions` tab  
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

1. `Window > API Mocking Toolkit`
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

Or configure multiple responses (including different status codes and latencies) with a **Weighted** strategy:

```text
Response 1 (Success 200)   - Weight: 80
Response 2 (Error 500)     - Weight: 15
Response 3 (Error 404)     - Weight: 5
```

**Latency use cases:**

- Make sure loading bars/spinners stay visible for the whole request and disappear only when a response arrives.
- Test UX for **slow but successful** calls (e.g., show "Still loading…" or allow the player to cancel).
- Simulate poor network conditions (mobile, Wi‑Fi drops) by mixing fast and slow responses in the same endpoint.

### Handling Errors in Code

```csharp
var response = await ApiClient.GetAsync("/api/data");

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
