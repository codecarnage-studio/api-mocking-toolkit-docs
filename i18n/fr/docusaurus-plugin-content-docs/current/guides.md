---
id: guides
title: Guides
sidebar_position: 2
---

**Flux de travail et cas d'utilisation réels.**

---

## 🎥 Cas d'utilisation avancés

**Découvrez des flux de travail réels en action :**

<iframe width="560" height="315" src="https://www.youtube.com/embed/YOUR_VIDEO_ID_3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

**Vous préférez lire ? Faites défiler vers le bas** ↓

---

## Table des matières

- [Flux de développement](#flux-de-developpement)
- [Tests et QA](#testing--qa)
- [Prototyper des API](#prototyping-apis)
- [Déboguer avec des sessions](#debugging-with-sessions)
- [Collaboration en équipe](#team-collaboration)
- [Étendre la scène de démo](#extending-the-demo-scene)

---

## Flux de développement {#flux-de-developpement}

Créez des jeux Unity sans attendre que le backend soit prêt.

### Scénario : API backend non prêtes

**Votre situation :**
- L'équipe backend n'a pas encore terminé les API
- Vous devez construire l'UI et le gameplay
- Can't wait for backend completion

**Solution with API Mocking Toolkit:**

**Step 1: Define API Contract**

Work with backend team to agree on API contract:

```json
// POST /api/login
Request:
{
  "username": "string",
  "password": "string"
}

Response (Success):
{
  "token": "string",
  "userId": "number",
  "username": "string"
}

Response (Error):
{
  "error": "Invalid credentials"
}
```

**Step 2: Mock It**

Create endpoints in API Mocking Toolkit:

1. Endpoint: `POST /api/login`
2. Success Response (200):
```json
{
  "token": "mock-jwt-token-12345",
  "userId": 1001,
  "username": "testuser"
}
```

3. Error Response (401):
```json
{
  "error": "Invalid credentials"
}
```

4. Use Weighted strategy: 90% success, 10% error

**Step 3: Build Your UI**

```csharp
public class LoginManager : MonoBehaviour
{
    public async void OnLoginButtonClicked()
    {
        var response = await ApiClient.PostAsync(
            "https://api.mygame.com/login",
            $"{{\"username\":\"{username}\",\"password\":\"{password}\"}}"
        );
        
        if (response.Success) {
            var data = JsonUtility.FromJson<LoginResponse>(response.Body);
            PlayerPrefs.SetString("token", data.token);
            SceneManager.LoadScene("MainMenu");
        } else {
            ShowError("Login failed");
        }
    }
}
```

**Step 4: Test Everything**

- ✅ UI works with mock data
- ✅ Error handling tested
- ✅ Loading states tested
- ✅ Edge cases covered

**Step 5: Switch to Real Backend**

When backend is ready:

1. Turn OFF Offline Mode
2. Keep endpoint configured
3. Code works with zero changes!

**Benefits:**
- No blocked development time
- Frontend and backend work in parallel
- Test error cases easily
- Smooth transition to real API

> **Build & security note (to finalize before 1.0):**
> In development you typically enable Offline Mode and use mock collections so the game never talks to a live backend.
> For production builds, the recommended pattern is to talk to real APIs and treat mocks as a dev‑only tool.
> Before release, decide whether the interceptor and mock collections are excluded from production builds or simply disabled via configuration, and ensure no secrets (API keys, tokens) are stored in environment variables that ship with the game client.
---

## Testing & QA

Create reproducible test scenarios without backend changes.

### Scenario: Testing Error Handling

**Challenge:** Test how your game handles errors.

**Solution:**

**Step 1: Create Error Scenarios**

```
Endpoint: GET /api/player/inventory

Response 1 (Success) - Weight: 70
Response 2 (Timeout) - Status 408 - Weight: 10
Response 3 (Server Error) - Status 500 - Weight: 10
Response 4 (Auth Error) - Status 401 - Weight: 10
```

**Step 2: Run Automated Tests**

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // Enable offline mode for controlled testing
    ApiGlobalConfig.Instance.OfflineMode = true;
    
    // Call API multiple times
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.GetAsync("/api/player/inventory");
        
        // Verify error handling works
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "Error dialog should be shown");
        }
    }
}
```

**Step 3: Manual QA Testing**

Give QA team specific test instructions:

```
Test Case: Server Error Handling
1. Enable Offline Mode
2. Select "Test - Server Errors" collection
3. Open Inventory screen 10 times
4. Verify error message appears when server errors occur
5. Verify game doesn't crash
```

**Benefits:**
- Reproducible test cases
- No backend coordination needed
- Fast test execution
- Consistent results

### Scenario: Edge Case Testing

**Test empty responses:**

```json
// Empty inventory
[]

// Null data
null

// Missing fields
{
  "items": null
}
```

**Test large responses:**

```json
// 1000 items in inventory
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"},
  ...
  {"id": 1000, "name": "Item 1000"}
]
```

**Test special characters:**

```json
{
  "username": "test<script>alert('xss')</script>",
  "message": "Line 1\nLine 2\tTabbed"
}
```

**Use Response Strategies:**

```
Sequential Strategy:
Call 1 → Empty array
Call 2 → Null data
Call 3 → Large response
Call 4 → Special characters
Call 5 → Empty array (loops)
```

---

## Prototyping APIs

Design your ideal API before backend implementation.

### Scenario: New Feature - Friend System

**Step 1: Design the API**

Think about what your game needs:

```
GET /api/friends - Get friend list
POST /api/friends/add - Send friend request
POST /api/friends/accept - Accept request
DELETE /api/friends/{friendId} - Remove friend
```

**Step 2: Create Mock Endpoints**

```json
// GET /api/friends
Response:
{
  "friends": [
    {"id": 1, "username": "alice", "status": "online"},
    {"id": 2, "username": "bob", "status": "offline"}
  ],
  "pendingRequests": [
    {"id": 3, "username": "charlie"}
  ]
}
```

**Step 3: Build UI**

Create friend list UI using mock data.

**Step 4: Iterate Quickly**

Realize you need more data:

```json
// Updated response
{
  "friends": [
    {
      "id": 1,
      "username": "alice",
      "status": "online",
      "level": 42,
      "avatar": "avatar_01.png",
      "lastSeen": "2026-04-20T14:30:00Z"
    }
  ]
}
```

Update mock, see changes immediately!

**Step 5: Export to OpenAPI**

```
1. Click Export in API Mocking Toolkit
2. Save friends-api.json
3. Send to backend team
4. They implement exact same API
```

**Benefits:**
- Frontend defines what it needs
- Iterate on API design quickly
- Backend implements to spec
- No miscommunication

> **Note:** OpenAPI export focuses on the shape of your real API (paths, methods, URLs, and schemas). Mock‑only details such as specific example payloads, artificial latencies, and error distributions remain in your collections and are not included in the exported OpenAPI document.

---

## Debugging with Sessions

Use session replay for time-travel debugging.

### Scenario: Bug Reproduction

**Problem:**
```
Bug Report: "Game crashes after buying 3rd item"
Tester can't reproduce it consistently.
```

**Solution with Sessions:**

**Step 1: Enable Session Persistence**

```csharp
// In Global Config
ApiGlobalConfig.Instance.EnableSessionPersistence = true;
```

**Step 2: Tester Plays**

Tester plays normally. When crash occurs, session is auto-saved.

**Step 3: Load Session**

Developer loads the session:

```
Window > API Mocking Toolkit > Sessions Tab
Select: session_crash_2026-04-20_15-30-00.json
Click: Load Session
```

**Step 4: Analyze**

See exact sequence:

```
1. GET /api/shop/items - Success
2. POST /api/shop/buy - Item 1 - Success
3. GET /api/player/inventory - Success
4. POST /api/shop/buy - Item 2 - Success
5. GET /api/player/inventory - Success
6. POST /api/shop/buy - Item 3 - Error 500
7. GET /api/player/inventory - [CRASH]
```

**Found it!** Game doesn't handle inventory fetch after purchase failure.

**Step 5: Fix & Verify**

1. Fix the bug (add error handling)
2. Load same session again
3. Step through sequence
4. Verify fix works!

**Benefits:**
- Accurate bug reproduction
- See exact API sequence
- Less guesswork
- Verify fixes

### Scenario: Performance Analysis

**Problem:** Game feels slow.

**Solution:**

**Step 1: Play & Record**

Play the slow section, session records all API calls.

**Step 2: Analyze Session**

Load session and review:

```
API Call                    | Latency | Status
----------------------------|---------|--------
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← TOO SLOW!
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

**Found it!** Inventory API is slow.

**Step 3: Optimize**

Work with backend to optimize `/api/player/inventory`.

---

## Team Collaboration

Share configurations across team members.

### Scenario: Multiple Developers

**Challenge:** Keep endpoint configs in sync via Git or any other VCS.

**Solution: Version Control**

**Step 1: Add to Git**

```bash
# Add collection assets to git
git add Assets/Resources/ApiEndpointCollection.asset
git add Assets/Resources/Demo\ Scene\ Collection.asset
git commit -m "Add API mock configurations"
```

**Step 2: Team Pulls**

All developers get same configs:

```bash
git pull origin main
```

Now everyone has identical endpoints!

### Scenario: QA Team

**Give QA specific collections:**

```
QA-Edge-Cases.asset - All error scenarios
QA-Performance.asset - Large responses, slow APIs
QA-Happy-Path.asset - All success cases
```

**Instructions:**

```
1. Open API Mocking Toolkit
2. Select "QA-Edge-Cases" collection
3. Enable Offline Mode
4. Run test plan
```

### Scenario: Backend Team Coordination

**Step 1: Frontend Designs API**

Create endpoints in API Mocking Toolkit.

**Step 2: Export OpenAPI Spec**

```
API Mocking Toolkit > Export > save api-spec.json
```

**Step 3: Share with Backend**

Send `api-spec.json` to backend team.

**Step 4: Backend Implements**

They implement to the exact spec.

**Step 5: Test with Real Backend**

Turn off Offline Mode, verify it works!

---

## Extending the Demo Scene

Learn by customizing the included demo.

### Understanding DemoController.cs

The demo scene shows two buttons: "Get Users" and "Get Posts".

**Key code:**

```csharp
public async void OnGetUsersClicked()
{
    // Make API call
    var response = await ApiClient.GetAsync(
        "https://jsonplaceholder.typicode.com/users"
    );
    
    // Display in UI
    rightText.text = FormatResponse(response);
}
```

### Exercise 1: Add a New Button

**Goal:** Add "Get Comments" button.

**Step 1: Add Endpoint**

```
Endpoint: GET https://jsonplaceholder.typicode.com/comments
Response: (copy from actual API or create mock)
```

**Step 2: Add UI Button**

In Scene:
1. Duplicate "Get Posts" button
2. Rename to "Get Comments"
3. Update text

**Step 3: Add Code**

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.GetAsync(
        "https://jsonplaceholder.typicode.com/comments"
    );
    UpdateUI(response);
}
```

**Step 4: Wire It Up**

In Inspector, set button OnClick to call `OnGetCommentsClicked`.

### Exercise 2: Add Response Strategy

**Goal:** Make "Get Posts" cycle through pages.

**Step 1: Add Multiple Responses**

For endpoint `GET /posts`:

```
Response 1 (Page 1): Posts 1-10
Response 2 (Page 2): Posts 11-20
Response 3 (Page 3): Posts 21-30
```

**Step 2: Set Strategy**

Set Response Strategy to **Sequential**.

**Step 3: Test**

Click "Get Posts" multiple times:
- Click 1: Page 1
- Click 2: Page 2
- Click 3: Page 3
- Click 4: Page 1 (loops)

### Exercise 3: Add Error Simulation

**Goal:** Mix success and error responses.

**Step 1: Add Error Response**

```
Response 4 (Error):
Status: 500
Body: {"error": "Server error"}
Weight: 10
```

**Step 2: Update Weights**

```
Response 1 (Page 1) - Weight: 30
Response 2 (Page 2) - Weight: 30
Response 3 (Page 3) - Weight: 30
Response 4 (Error) - Weight: 10
```

**Step 3: Add Error Handling**

```csharp
if (!response.Success) {
    rightText.text = $"ERROR: {response.StatusCode}";
    return;
}
```

**Step 4: Test**

Click "Get Posts" many times. ~10% will show error!

---

**Next:** [API Reference](api-reference.md) - Code cheat sheet
