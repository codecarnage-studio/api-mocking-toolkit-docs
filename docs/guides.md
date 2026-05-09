---
id: guides
title: Guides
sidebar_position: 2
---

Workflows and real-world use cases.

---

## Development Workflow

Build without waiting for backend.

### Backend API Not Ready

Define contract with backend team:

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

Create mock endpoint in toolkit:
- Endpoint: `POST /api/login`
- Success (200): `{"token": "mock-jwt-token-12345", "userId": 1001, "username": "testuser"}`
- Error (401): `{"error": "Invalid credentials"}`
- Use `Random` strategy to mix responses, or `Sequential` (1st success → 2nd error → loop)

Build UI:

```csharp
public class LoginManager : MonoBehaviour
{
    public async void OnLoginButtonClicked()
    {
        var response = await ApiClient.Post(
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

When backend ready, turn OFF Offline Mode. Code works unchanged. Production builds must disable Offline Mode; `BuildPreprocessor` enforces this. Editor-only types (`ApiInterceptor`, `SessionManager`) wrapped in `#if UNITY_EDITOR`, never in builds.

---

## Testing & QA

Create reproducible test scenarios without backend coordination.

### Error Handling

Setup endpoint:
```
Endpoint: GET /api/player/inventory
Strategy: Random
Responses[]:        Success 200
ErrorResponses[]:   Status 408 (timeout, latency 5000 ms)
                    Status 500 (server error)
                    Status 401 (auth error)
```

Toggle `SimulateError` ON/OFF to switch between `Responses[]` and `ErrorResponses[]`.

Run automated tests:

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // Enable offline mode in the toolkit window before running
    // (Window > CodeCarnage > API Mocking Toolkit > Offline Mode)

    // Call API multiple times
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.Get("/api/player/inventory");
        
        // Verify error handling works
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "Error dialog should be shown");
        }
    }
}
```

QA test case: Enable Offline Mode → select collection → trigger scenario → verify error handling.

### Edge Cases

Test empty responses:

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

Use `Sequential` strategy to cycle through edge cases on each call.

---

## Prototyping APIs

Design before backend implements.

### Friend System

```json
// GET /api/friends
{
  "friends": [
    {"id": 1, "username": "alice", "status": "online"},
    {"id": 2, "username": "bob", "status": "offline"}
  ],
  "pendingRequests": [{"id": 3, "username": "charlie"}]
}
```

Build UI, iterate on response schema, then Export → send to backend. They implement to spec. OpenAPI round-trip safe with `x-amt-*` extensions preserving toolkit-specific details.

---

## Debugging with Sessions

Replay sessions for time-travel debugging.

### Bug Reproduction

Enable Session Persistence on `ApiGlobalConfig`. Tester plays, crash occurs, session auto-saves on Play Mode exit. Hit **Stop** on REC banner to capture mid-session.

Load session in Toolkit → Sessions Tab. Analyze exact request sequence:

```
1. GET /api/shop/items - Success
2. POST /api/shop/buy - Item 1 - Success
3. GET /api/player/inventory - Success
4. POST /api/shop/buy - Item 2 - Success
5. GET /api/player/inventory - Success
6. POST /api/shop/buy - Item 3 - Error 500
7. GET /api/player/inventory - [CRASH]
```

Game doesn't handle inventory fetch after purchase failure. Fix, load same session again, verify.

Play slow section, load session. Review API latencies:

```
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← slow
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

Work with backend to optimize slow endpoint.

---

## Team Collaboration

### Version Control

Collections live under `Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/` by default (loaded via `Resources.Load`). Commit to Git:

```bash
git add Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/ApiEndpointCollection.asset
git commit -m "Add API mock configurations"
```

All developers pull → identical endpoints.

### QA Workflow

Create QA collections: `QA-Edge-Cases.asset`, `QA-Performance.asset`, `QA-Happy-Path.asset`. Select in toolkit, enable Offline Mode, run tests.

### Backend Coordination

Create endpoints → Export OpenAPI spec → send to backend → they implement to spec → turn off Offline Mode → test with real backend.

---

## Extending the Demo Scene

Demo shows "Get Users" / "Get Posts" buttons:

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/users");
    rightText.text = FormatResponse(response);
}
```

### Add New Button

Add endpoint → `GET https://jsonplaceholder.typicode.com/comments` → duplicate "Get Posts" button → add handler:

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/comments");
    UpdateUI(response);
}
```

Wire button OnClick to call handler.

### Pagination with Response Strategy

Add 3 responses for `GET /posts` (Page 1, Page 2, Page 3). Set Response Strategy to **Sequential**. Each click returns next page, loops on 4th.

### Error Simulation

Add Error Response (500). Set **Error Response Strategy** to `Sequential` or `Random`. Toggle **Simulate Error** ON/OFF to switch between success and error paths. Handle in code:

```csharp
if (!response.Success) {
    rightText.text = $"ERROR: {response.StatusCode}";
    return;
}
```

---

**Next:** [API Reference](api-reference.md) - Code cheat sheet
