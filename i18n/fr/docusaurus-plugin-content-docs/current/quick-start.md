---
id: quick-start
title: Démarrage rapide
sidebar_position: 1
---

**Développez et testez les appels API de votre jeu dans Unity sans attendre que le backend soit prêt.**

---

## 🎥 À regarder en premier (5 minutes)

**Vous préférez la vidéo ? Regardez ce court tutoriel :**

<iframe width="560" height="315" src="https://www.youtube.com/embed/YOUR_VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Ou suivez le guide écrit ci‑dessous** ↓

---

## Le problème que vous résolvez

Vous développez un jeu Unity qui communique avec un serveur backend :
- Système de connexion
- Profils joueurs
- Classements
- Boutique / inventaire
- Matchmaking multijoueur

**Mais voici le problème :**

❌ **L'équipe backend n'est pas prête** – vous êtes bloqué, impossible de tester votre jeu
❌ **Les tests sont pénibles** – erreurs difficiles à reproduire, besoin d'internet, tests instables
❌ **Le développement est lent** – chaque changement nécessite une coordination avec le backend

**API Mocking Toolkit résout tout cela.** Faites tourner l'intégralité de votre jeu sans backend. Testez n'importe quel scénario. Travaillez complètement hors ligne.

---

## Ce que vous allez apprendre

En 5 minutes, vous allez :
1. ✅ Installer API Mocking Toolkit
2. ✅ Lancer la scène de démo (et la voir fonctionner immédiatement !)
3. ✅ Créer votre premier endpoint d'API simulée


## Scénarios réels de développeurs

**Vous vous reconnaissez dans ces situations ?**

### Scénario 1 : l'équipe backend est en retard

Vous développez le client du jeu. L'équipe backend avait promis les API pour la semaine dernière. Vous attendez toujours.

**Sans API Mocking Toolkit :**
- ❌ Vous êtes bloqué
- ❌ Impossible de tester votre interface utilisateur
- ❌ Données factices codées en dur partout
- ❌ Il faudra tout supprimer plus tard

**Avec API Mocking Toolkit :**
- ✅ Vous définissez vous‑même le contrat d'API
- ✅ Vous construisez et testez entièrement votre jeu
- ✅ Quand le backend est prêt, vous basculez simplement – c'est tout !

### Scénario 2 : tester les cas limites

Votre système de boutique doit gérer :
- ✅ Succès (achat effectué)
- ⚠️ Erreur (paiement échoué)
- ⚠️ Timeout (réseau lent)
- ⚠️ Réponse invalide (JSON mal formé)

**Sans API Mocking Toolkit :**
- ❌ Demander à l'équipe backend de simuler les erreurs
- ❌ Espérer pouvoir reproduire le bug
- ❌ Un réseau instable qui rend les tests peu fiables

**Avec API Mocking Toolkit :**
- ✅ Vous configurez tous les scénarios comme réponses
- ✅ Vous les testez instantanément, autant de fois que nécessaire
- ✅ 100 % reproductible

### Scénario 3 : travailler hors ligne

Vous êtes dans un avion. Ou dans un café sans wifi. Ou votre VPN d'entreprise est en panne.

**Sans API Mocking Toolkit :**
- ❌ Impossible d'exécuter votre jeu
- ❌ Impossible d'avancer
- ❌ Temps perdu

**Avec API Mocking Toolkit :**
- ✅ Le jeu peut tourner avec des API simulées
- ✅ Vous continuez à coder et à tester même si le backend n'est pas disponible
- ✅ Aucun accès réseau requis lorsque vous utilisez les mocks

**Ça vous parle ? Corrigeons ça.**

_Concept du diagramme (rendu plus tard en image statique)_ : votre jeu parle à API Mocking Toolkit, qui peut ensuite router les appels vers :

- Le serveur backend réel
- Un serveur de développement local
- Une réponse de succès simulée
- Une réponse d'erreur simulée

**↑ Un seul outil, quatre façons de tester** – backend réel, serveur local, succès simulé, erreur simulée

---

4. ✅ Make your game work without a backend

**No live backend required during development. Your game talks to mocked APIs running entirely inside Unity.**

---

## Installation

### Option 1: Unity Package Manager (Recommended)

1. Open Unity Package Manager: `Window > Package Manager`
2. Click `+` → `Add package from git URL`
3. Enter: `https://github.com/yourusername/api-mocking-toolkit.git`
4. Click `Add`

### Option 2: Asset Store

1. Open Asset Store in Unity
2. Search for "API Mocking Toolkit" or open the Asset Store page directly in your browser.
3. Click `Import`
4. Import all files
**Requirements:**
- Unity 2021.3 or later
- No external dependencies

---

## Run the Demo Scene

Follow these steps to run the included demo scene and verify that the toolkit is installed correctly:

### Step 1: Open the Demo Scene

Navigate to:
```
Assets > CodeCarnage > ApiMockingToolkit > Samples > DemoScene > DemoScene.unity
```

Double-click to open it.

**What you'll see:**
- A simple UI with two buttons: "Get Users" and "Get Posts"
- Request/Response panels showing API calls

### Step 2: Press Play

Hit the Play button. The scene runs.

### Step 3: Click "Get Users"

**What happens:**
- Button sends API request to `jsonplaceholder.typicode.com/users`
- API Mocking Toolkit intercepts it
- Returns mock user data **instantly**
- No internet needed!

You'll see:
```
REQUEST:
GET /users

RESPONSE:
Status: 200
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  ...
}
```

### Step 4: Click "Get Posts" Multiple Times

**Watch this:**
- First click → Returns page 1 of posts
- Second click → Returns page 2 of posts
- Third click → Returns page 3 of posts
- Fourth click → Loops back to page 1

**This is Response Strategies** – API Mocking Toolkit cycles through different responses automatically, which is useful for testing pagination and repeated calls.

### What Just Happened?

You just ran a fully functional game that makes API calls through `ApiClient`, receives responses, and handles data without depending on a live backend.

✅ No backend team required during this stage of development
✅ No network connection required while using only mocked APIs
✅ Fast, predictable responses
✅ Complete control over the data you test with

---

## How It Works (1 Minute Explanation)

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

### The Magic Happens Here:

1. **You configured an endpoint** (already done in Demo Scene)
   - URL: `https://jsonplaceholder.typicode.com/users`
   - Mock response: `[{user data...}]`

2. **API Mocking Toolkit intercepts**
   - Sees the URL matches your config
   - Returns your mock data instead of hitting the real server

3. **Your code gets the response**
   - Doesn't know it's mocked
   - Works exactly like a real API

### The Key Insight:

**Your game code doesn't change.**

Same code works with:
- ✅ Mocked data (when API Mocking Toolkit is active)
- ✅ Real backend (when you turn mocking off)

**No `if (testing)` checks. No special test code. Just works.**

---

## Create Your First Endpoint (Your Turn!)

**Now for the real power: Mock YOUR game's API.**

Imagine you're building an RPG. You need a player profile API, but the backend isn't ready yet.

**Let's build it anyway:**

### Step 1: Open the API Mocking Toolkit Window

In Unity menu bar:
```
Window > API Mocking Toolkit
```

A new window opens. This is your control center.

### Step 2: Create an Endpoint

See the **"+ Endpoint"** button? Click it.

A form appears. Fill it in:

**Name:** `Get User Profile`
*(This is just for you - a friendly name)*

**Method:** `GET`
*(The HTTP method - GET, POST, PUT, DELETE)*

**URL:** `https://api.mygame.com/user/profile`
*(Your game's API endpoint - can be anything!)*

**Match Type:** `Exact`
*(URL must match exactly)*

**Why these values?**
- This endpoint will catch any `GET` request to `https://api.mygame.com/user/profile`
- When your game calls this URL, API Mocking Toolkit will return your mock data

### Step 3: Add Mock Response

In the **Response** section:
1. **Status Code:** 200
2. **Body:**
```json
{
  "id": 123,
  "username": "player1",
  "level": 42,
  "coins": 9999
}
```

3. Click **Save**

### Step 4: Enable Offline Mode

Toggle **Offline Mode** ON (top of window)

### Step 5: Test It!

Create a test script:

```csharp
using UnityEngine;
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
}
```

**Run it!** You'll see your mock data in the console.

---

## Core Features (Deep Dive)

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

1. `Window > API Mocking Toolkit`
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

**Global Variables:**
```text
apiKey = abc123
userId = player-001
```

**Environment Variables (Dev):**
```text
baseUrl = http://localhost:3000
region  = us-west
```

**Environment Variables (Prod):**
```text
baseUrl = https://api.mygame.com
region  = us-east
```

**URL with variables:**
```text
{{baseUrl}}/user/{{userId}}/profile?key={{apiKey}}
```

Resolved in Dev:
```text
http://localhost:3000/user/player-001/profile?key=abc123
```

Resolved in Prod:
```text
https://api.mygame.com/user/player-001/profile?key=abc123
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

Test error handling **without** breaking real backends.

#### Simulating Errors

1. Add endpoint: `GET /api/data`  
2. Add an error response:

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

Or configure multiple responses with a **Weighted** strategy:

```text
Response 1 (Success 200)   - Weight: 80
Response 2 (Error 500)     - Weight: 15
Response 3 (Error 404)     - Weight: 5
```

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
