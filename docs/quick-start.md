---
id: quick-start
title: Quick Start
sidebar_position: 1
toc_max_heading_level: 3
---

**Develop and test your game's API calls in Unity without waiting for backend services.**

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## 🎥 Watch First

**Prefer video? Watch this quick tutorial:**

<iframe
  id="demo-video"
  width="560"
  height="315"
  src="https://www.youtube.com/embed/4aqx69E9T4A?enablejsapi=1"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
/>

**Or follow the written guide below** ↓

---

## The Problem You're Solving <VideoTimestamp seconds={30} label="Jump to video @ 0:30" />

You're building a Unity game that talks to a backend server. At minimum, you need:

| What your game needs                | What's getting in the way                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| <ul><li>Login system</li><li>Player profiles</li><li>Leaderboards</li><li>Shop/inventory</li><li>Multiplayer matchmaking</li></ul> | <ul><li>❌ **Backend team isn't ready yet** – You're blocked, can't test your game</li><li>❌ **Testing is painful** – Hard to reproduce errors, need internet, flaky tests</li><li>❌ **Development is slow** – Every change needs backend coordination</li></ul> |

**API Mocking Toolkit solves this.** Run your entire game without a backend. Test any scenario. Work completely offline.

---

## What You'll Learn

In this quick guide, you'll:
1. ✅ Install API Mocking Toolkit
2. ✅ Run the demo scene (see it working instantly!)
3. ✅ Create your first mock API endpoint


## Real Developer Scenarios

**See yourself in these situations?**

| Scenario                | Without API Mocking Toolkit                                                                 | With API Mocking Toolkit                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Backend team is behind  | <ul><li>Blocked, UI untestable</li><li>Fake data everywhere</li><li>Big refactor later</li></ul> | <ul><li>You define the API contract</li><li>Build & test the client now</li><li>Switch to real backend when it's ready</li></ul> |
| Testing edge cases      | <ul><li>Depend on backend team to simulate errors</li><li>Unstable network</li><li>Bugs hard to reproduce</li></ul> | <ul><li>Configure success/error/timeout/invalid responses yourself</li><li>Replay scenarios instantly as often as needed</li></ul> |
| Working offline         | <ul><li>Game can’t run without network/VPN</li><li>Progress stalls</li></ul>                | <ul><li>Game uses only mocked APIs in Unity</li><li>Keep working wherever you are</li></ul>             |

**Sound familiar? Let's fix it.**

_Diagram concept (to be rendered as a static image later):_ your game talks to the API Mocking Toolkit, which can in turn route calls to:

- The real backend server
- A local development server
- A mocked success response
- A mocked error response

**↑ One tool, four ways to test** – real backend, local server, mock success, mock error

---

**Make your game work without a backend.**

No live backend required during development. Your game talks to mocked APIs running entirely inside Unity.

---

## Installation (Unity Asset Store)

1. Open the Unity Asset Store
2. Search for "API Mocking Toolkit" or open the Asset Store page directly in your browser.
3. Click `Import`
4. Import all files
**Requirements:**
- Unity 2021.3 or later
- No external dependencies

---

## Run the Demo Scene <VideoTimestamp seconds={60} label="Jump to video @ 1:00" />

Follow these steps to run the included demo scene and verify that the toolkit is installed correctly:

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>Step 1 – Open the demo scene</strong></td>
      <td>
        <p>
          In Unity, open <code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code>,
          then double-click to open it.
        </p>
        <p><strong>What you'll see:</strong></p>
        <ul>
          <li>A simple UI with two buttons: <code>Get Users</code> and <code>Get Posts</code></li>
          <li>Request/Response panels showing API calls</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Step 2 – Press Play</strong></td>
      <td>
        <p>Hit the Play button. The scene runs.</p>
      </td>
    </tr>
    <tr>
      <td><strong>Step 3 – Click "Get Users"</strong></td>
      <td>
        <p><strong>What happens:</strong></p>
        <ul>
          <li>Button sends API request to <code>jsonplaceholder.typicode.com/users</code></li>
          <li>API Mocking Toolkit intercepts it</li>
          <li>Returns mock user data <strong>instantly</strong></li>
          <li>No internet needed!</li>
        </ul>
        <p>Example request/response:</p>
        <CodeBlock language="text">{`REQUEST:
GET /users

RESPONSE:
Status: 200
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  ...
}`}</CodeBlock>
      </td>
    </tr>
    <tr>
      <td><strong>Step 4 – Click "Get Posts" multiple times</strong></td>
      <td>
        <p><strong>Watch this:</strong></p>
        <ul>
          <li>First click → Returns page 1 of posts</li>
          <li>Second click → Returns page 2 of posts</li>
          <li>Third click → Returns page 3 of posts</li>
          <li>Fourth click → Loops back to page 1</li>
        </ul>
        <p>
          <strong>This is Response Strategies</strong> – API Mocking Toolkit cycles through different responses automatically,
          which is useful for testing pagination and repeated calls.
        </p>
      </td>
    </tr>
  </tbody>
</table>

**What just happened?**

You just ran a fully functional game that makes API calls through `ApiClient`, receives responses, and handles data without depending on a live backend.

- ✅ No backend team required during this stage of development
- ✅ No network connection required while using only mocked APIs
- ✅ Fast, predictable responses
- ✅ Complete control over the data you test with

---

## How It Works <VideoTimestamp seconds={90} label="Jump to video @ 1:30" />

**You might be wondering: "How does this work?"**

Let's peek under the hood. Open `DemoController.cs`:

```csharp
public async void OnGetUsersClicked()
{
    // This is normal Unity HTTP code - nothing special!
    var response = await ApiClient.GetAsync(
        "https://jsonplaceholder.typicode.com/users"
    );

    // Display the response in the UI
    DisplayResponse(response);
}
```

**That's it.** Standard API call. No magic.

Behind the scenes:

- **You configured an endpoint** (already done in the demo scene)
  - URL: `https://jsonplaceholder.typicode.com/users`
  - Mock response: `[{user data...}]`

- **API Mocking Toolkit intercepts**
  - Sees the URL matches your config
  - Returns your mock data instead of hitting the real server

- **Your code gets the response**
  - Doesn't know it's mocked
  - Works exactly like a real API

**The key idea:** your game code doesn't change.

Same code works with:
- ✅ Mocked data (when API Mocking Toolkit is active)
- ✅ Real backend (when you turn mocking off)

**No `if (testing)` checks. No special test code. Just works.**

---

## Create Your First Endpoint (Your Turn!) <VideoTimestamp seconds={120} label="Jump to video @ 2:00" />

**Now for the real power: Mock YOUR game's API.**

Imagine you're building an RPG. You need a player profile API, but the backend isn't ready yet.

**Let's build it anyway:**

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>Step 1 – Open the API Mocking Toolkit window</strong></td>
      <td>
        In Unity, open <code>Window &gt; API Mocking Toolkit</code>. A new window opens—this is your control center. // FIXME: `Window>CodeCarnage>API Mocking Toolkit`, this is correct one. You missed the intermediate menu.
      </td>
    </tr>
    <tr>
      <td><strong>Step 2 – Create an endpoint</strong></td>
      <td>
        Click <strong>"+ Endpoint"</strong>. In the form, set:
        <ul>
          <li><strong>Name:</strong> <code>Get User Profile</code> (friendly name)</li>
          <li><strong>Method:</strong> <code>GET</code></li>
          <li><strong>URL:</strong> <code>https://api.mygame.com/user/profile</code></li>
          <li><strong>Match Type:</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Step 3 – Add a mock response</strong></td>
      <td>
        <p>
          In the <strong>Response</strong> section, set <strong>Status Code</strong> to <code>200</code> and use a JSON body like:
        </p>
        <CodeBlock language="json">{`{
  "id": 123,
  "username": "player1",
  "level": 42,
  "coins": 9999
}`}</CodeBlock>
      </td>
    </tr>
    <tr>
      <td><strong>Step 4 – Enable Offline Mode</strong></td>
      <td>
        Toggle <strong>Offline Mode</strong> ON at the top of the window so the game uses mocked responses instead of the real backend.
      </td>
    </tr>
    <tr>
      <td><strong>Step 5 – Test it</strong></td>
      <td>
        <p>Create a test script:</p>
        <CodeBlock language="csharp">{`using UnityEngine;
using CodeCarnage.ApiMockingToolkit;

public class ProfileTest : MonoBehaviour
{
    async void Start()
    {
        var response = await ApiClient.GetAsync(
            "https://api.mygame.com/user/profile"
        );

        Debug.Log($"Status: {response.StatusCode}");
        Debug.Log($"Body: {response.Body}");
    }
}`}</CodeBlock>
      </td>
    </tr>
  </tbody>
</table>

**Run it!** You'll see your mock data in the console.

---

## Core Features (Deep Dive) <VideoTimestamp seconds={150} label="Jump to video @ 2:30" />

You've seen the basics. Now let's look at the **core features** that make API Mocking Toolkit powerful.

Each section below stands on its own. You can:
- Skim for a high-level understanding, **or**
- Follow along in the Editor and reproduce the examples exactly.

---

### Response Strategies (Pagination & Variations)

When the same endpoint is called multiple times, you can control **which response** is returned on each call.

Think of it like a playlist:
- **Sequential** – Play in order, loop at the end
- **RoundRobin** – Cycle through responses evenly
- **Random** – Shuffle mode
- **Weighted** – Some responses more likely than others

#### Real Example: Shop Pagination

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

#### Strategy Summary

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

### Offline Mode (Work Completely Offline)

Global toggle to mock **all** API calls, even when an endpoint isn’t configured.

#### How It Works

- **Offline Mode OFF (default):**
  - Configured endpoints → Mock response
  - Unconfigured endpoints → Real network request

- **Offline Mode ON:**
  - Configured endpoints → Mock response
  - Unconfigured endpoints → Error (so you don’t accidentally hit real servers)

#### Enable Offline Mode

**In Editor:**
```text
Window > API Mocking Toolkit
Toggle "Offline Mode" ON
```

**In Code:**
```csharp
ApiGlobalConfig.Instance.OfflineMode = true;
```

#### Use Cases

✅ **Development without backend**  
✅ **Testing without flaky networks**  
✅ **Conference demos / live streams**

---

### Environments & Variables (Dev / Staging / Prod)

Manage different backends and configs **without changing your game code**.

#### Creating Environments

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

#### Variable Interpolation

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

#### Variable Scope Priority

1. **Endpoint-specific** (highest priority)  
2. **Environment-specific**  
3. **Global** (fallback)

#### Code Example

```csharp
// Switch environments at runtime
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;

// Same code, different URLs based on environment
var response = await ApiClient.GetAsync("{{baseUrl}}/user/profile");
```

✅ No hardcoded URLs. Switch environments with a dropdown or one line of code.

#### Production Build Safety

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

### Collections & Folders (Organize Large Projects)

Keep hundreds of endpoints manageable with **Collections** and **Folders**.

#### Collections

- Separate groups of endpoints (e.g., different games or API versions)
- One collection active at a time

**Create a Collection:**
```text
Assets > Create > API Mocking Toolkit > API Endpoint Collection
```

Use the collection dropdown in the window to switch between them.

#### Folders

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

### Session Management (Time-Travel Debugging)

⭐ **UNIQUE FEATURE – Replay entire play sessions.**

Record all API requests during Play Mode, save them, and replay later.

#### Recording

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

#### Replaying

1. `Window > API Mocking Toolkit > Sessions` tab  
2. Select a past session  
3. Click **Load Session**  
4. Review all requests/responses

**Use Cases:**
- Reproduce long, complex bugs
- Share exact failing sessions with teammates
- Analyze performance bottlenecks

---

### OpenAPI Integration (Work with Backend Teams)

Import/export OpenAPI (Swagger) specs for real collaboration.

#### Importing

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

#### Variable Conversion

OpenAPI uses `{variable}`, API Mocking Toolkit uses `{{variable}}`.

```text
OpenAPI:  /users/{userId}/profile
Imported: /users/{{userId}}/profile
```

#### Exporting

1. Configure endpoints in API Mocking Toolkit  
2. Click **Export**  
3. Save `.json` file  
4. Send to backend team – they implement to that spec

```text
Export → Import → Export = Same file (round-trip safe)
```

---

### Error Simulation (Test Failure Paths Safely)

Test error and latency handling **without** breaking real backends.

#### Simulating Errors & Latency

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

#### Handling Errors in Code

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

## What's Next?

🎉 **Congratulations!** You've:
- Installed API Mocking Toolkit
- Run the demo scene
- Created your first endpoint
- Learned the core features (strategies, offline mode, environments, sessions, etc.)

**Continue learning:**
- [Guides](/docs/guides) – Workflows and real-world scenarios
- [API Reference](/docs/api-reference) – Full API surface and code examples

**Watch the video again later:**
- Use it as a visual cheatsheet when you come back to the tool

---

## Troubleshooting

**Nothing happening?**
- Make sure Offline Mode is ON
- Check the URL matches exactly (case-sensitive)
- Look for errors in the Console

**Demo scene not working?**
- Make sure "Demo Scene Collection" is selected in dropdown
- Re-import the Samples folder from Package Manager

**Need help?**
- [Contact Support](/support) <!-- TODO: point to the real support/contact page when available -->
- Check [Troubleshooting FAQ](/docs/api-reference#troubleshooting)
