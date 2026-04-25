# Video 3: Advanced Use Cases

**Duration:** 8-10 minutes  
**Goal:** Show real-world workflows  
**Audience:** Users ready for production use

---

## Script & Shots

### INTRO (0:00 - 0:30)

**[SHOT: Unity Editor with production-looking game]**

**Voiceover:**
> "You've learned the basics and the features. Now let's see API Mocking Toolkit in real-world scenarios: testing workflows, session replay for debugging, OpenAPI integration, and team collaboration."

---

### SECTION 1: Testing Workflows & Response Strategies (0:30 - 4:00)

**[SHOT: API Mocking Toolkit window]**

**Voiceover:**
> "Before we jump into complex workflows, let's look at Response Strategies with a simple pagination example."

**[SHOT: API Mocking Toolkit window, endpoints tab]**

**[ACTION: Create endpoint: GET /api/posts]**

**Voiceover:**
> "Create an endpoint: GET /api/posts with three responses, one per page."

**[SHOT: Add 3 responses]**

```
Response 1 - Page 1:
[{"id":1,"title":"Post 1"},...{"id":10,"title":"Post 10"}]

Response 2 - Page 2:
[{"id":11,"title":"Post 11"},...{"id":20,"title":"Post 20"}]

Response 3 - Page 3:
[{"id":21,"title":"Post 21"},...{"id":30,"title":"Post 30"}]
```

**Voiceover:**
> "Set the strategy to Sequential. That means page 1, then page 2, then page 3, then it loops back to page 1."

**[SHOT: Select Sequential strategy]**

**[ACTION: Set Response Strategy dropdown to "Sequential"]**

**[SHOT: Create TestPagination.cs]**

```csharp
async void Start() {
    for (int i = 1; i <= 5; i++) {
        var response = await ApiClient.GetAsync("/api/posts");
        Debug.Log($"Call {i}: {response.Body.Substring(0, 50)}...");
        await Task.Delay(500);
    }
}
```

**Voiceover:**
> "In the console you'll see page 1, page 2, page 3, then it loops: page 1 again, page 2 again. This makes it straightforward to test your pagination logic without wiring up a real backend."

**[SHOT: Simple overlay diagram]**

```
Sequential:  1 → 2 → 3 → 1 → 2 → 3
RoundRobin:  1 → 2 → 3 → 1 → 2 → 3
Random:      2 → 1 → 3 → 2 → 2 → 1
Weighted:    ✓ → ✓ → ✗ → ✓ → ✓ → ✓
```

**Voiceover:**
> "Sequential plays responses in order, RoundRobin distributes them evenly, Random shuffles them, and Weighted gives you 'mostly success with occasional errors'."

**Voiceover:**
> "Now let's say you're testing your shop system. You need to test success, errors, edge cases. Here's how."

**[ACTION: Create endpoint GET /api/shop/items]**

**[SHOT: Add multiple responses]**

**[ACTION: Configure responses]**

```
Response 1 (Success - Normal)
Status: 200
Body: [{"id":1,"name":"Sword"},{"id":2,"name":"Shield"}]
Weight: 60

Response 2 (Success - Empty)
Status: 200
Body: []
Weight: 10

Response 3 (Success - Large)
Status: 200
Body: [100 items...]
Weight: 10

Response 4 (Timeout)
Status: 408
Body: {"error":"Request Timeout"}
Latency: 30000ms
Weight: 10

Response 5 (Server Error)
Status: 500
Body: {"error":"Internal Server Error"}
Weight: 10
```

**Voiceover:**
> "Five responses covering all scenarios: normal success, empty shop, large inventory, timeout, server error. Weighted to simulate realistic distribution."

**[SHOT: Create automated test]**

**[ACTION: Create ShopTests.cs]**

```csharp
[UnityTest]
public IEnumerator TestShopHandlesAllScenarios()
{
    ApiGlobalConfig.Instance.OfflineMode = true;
    
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.GetAsync("/api/shop/items");
        
        // Verify UI doesn't crash
        Assert.NotNull(shopUI);
        Assert.IsTrue(shopUI.IsDisplayed);
        
        // Verify error handling
        if (!response.Success) {
            Assert.IsTrue(errorMessageShown);
        }
    }
    
    yield return null;
}
```

**Voiceover:**
> "Write a test that calls the shop API 20 times. With weighted responses, you'll hit all scenarios. Verify your UI doesn't crash, error messages show correctly."

**[SHOT: Run test, show results]**

**Voiceover:**
> "Run it. Test passes. Your shop handles all scenarios correctly. This kind of testing is difficult to achieve reliably against a shared live backend."

**[SHOT: Show test results panel]**

**Voiceover:**
> "All scenarios tested in seconds. No flaky network. Reproducible every time."

---

### SECTION 2: Session Replay & Debugging (3:00 - 6:00)

**[SHOT: API Mocking Toolkit window, Global Config]**

**Voiceover:**
> "Session replay records every API call during play mode, so you can inspect and replay the exact sequence when debugging."

**[ACTION: Enable session persistence]**

**[SHOT: Check "Enable Session Persistence"]**

**Voiceover:**
> "Enable session persistence in Global Config. Now every API call is recorded."

**[SHOT: Create bug scenario]**

**Voiceover:**
> "Let's simulate a bug report: 'Game crashes after buying 3 items.'"

**[ACTION: Play mode, demonstrate bug]**

**[SHOT: Buy items in game]**

1. Buy item 1 - Success
2. Buy item 2 - Success  
3. Buy item 3 - Server error
4. Try to refresh inventory - CRASH

**Voiceover:**
> "I'll reproduce it. Buy item 1... success. Item 2... success. Item 3... server error. Try to refresh inventory... crash! The session was automatically recorded."

**[SHOT: Exit play mode]**

**[SHOT: API Mocking Toolkit window, Sessions tab]**

**[ACTION: Click Sessions tab]**

**Voiceover:**
> "Exit play mode. Go to Sessions tab. There's our crash session, automatically saved."

**[SHOT: Click Load Session]**

**[ACTION: Select session, click Load]**

**[SHOT: Session viewer showing request sequence]**

```
1. GET /api/shop/items - 200 OK
2. POST /api/shop/buy (item 1) - 200 OK
3. GET /api/player/inventory - 200 OK
4. POST /api/shop/buy (item 2) - 200 OK
5. GET /api/player/inventory - 200 OK
6. POST /api/shop/buy (item 3) - 500 ERROR
7. GET /api/player/inventory - [ATTEMPTED - CRASH]
```

**Voiceover:**
> "Here's the exact sequence. Request 6: server error. Request 7: tried to get inventory... crash. Now we know exactly what happened."

**[SHOT: Open code, find the bug]**

**[ACTION: Show InventoryManager.cs with bug]**

```csharp
// BUG: Doesn't check if last purchase succeeded
public async void RefreshInventory() {
    var response = await ApiClient.GetAsync("/api/player/inventory");
    // Assumes response.Success is true - WRONG!
    var data = JsonUtility.FromJson<Inventory>(response.Body);
    UpdateUI(data); // Crashes if response.Body is null
}
```

**Voiceover:**
> "Found it! The inventory refresh doesn't check if the response succeeded. After a failed purchase, the response is null, causing a crash."

**[SHOT: Fix the code]**

```csharp
// FIXED
public async void RefreshInventory() {
    var response = await ApiClient.GetAsync("/api/player/inventory");
    
    if (response.Success) {
        var data = JsonUtility.FromJson<Inventory>(response.Body);
        UpdateUI(data);
    } else {
        ShowErrorMessage("Failed to load inventory");
    }
}
```

**Voiceover:**
> "Fix: check response.Success first. Simple."

**[SHOT: Load same session again, test fix]**

**Voiceover:**
> "Now reload the same session and verify the fix works. Same exact sequence, but now it handles errors correctly. No crash!"

**[SHOT: Session file in file explorer]**

**Voiceover:**
> "Sessions are saved as JSON files. You can send them to teammates so they can load the exact same scenario when investigating an issue."

---

### SECTION 3: OpenAPI Integration (6:00 - 7:30)

**[SHOT: API Mocking Toolkit window]**

**Voiceover:**
> "OpenAPI integration lets you work with backend teams using industry standards."

**[SHOT: Have an OpenAPI spec file ready]**

**[ACTION: Window > API Mocking Toolkit > Import]**

**Voiceover:**
> "Say your backend team sends you a Swagger spec. Click Import."

**[SHOT: Select .json file]**

**[ACTION: Select api-spec.json]**

**Voiceover:**
> "Select the file. API Mocking Toolkit reads it and creates endpoints automatically."

**[SHOT: Show created endpoints]**

**Voiceover:**
> "Look - all endpoints created instantly. URLs, methods, everything from the spec. No manual config needed."

**[SHOT: Show variable conversion]**

```
OpenAPI spec:      /users/{userId}/profile
Imported as:       /users/{{userId}}/profile
```

**Voiceover:**
> "Variable syntax is automatically converted. OpenAPI uses single braces, API Mocking Toolkit uses double. Seamless."

**[SHOT: Export workflow]**

**[ACTION: Click Export]**

**Voiceover:**
> "Going the other way: design your API in API Mocking Toolkit, export to OpenAPI spec, send to backend team. They implement to your spec."

**[SHOT: Show exported JSON file]**

**Voiceover:**
> "Standard OpenAPI 3.0 format. Any backend framework can import this."

---

### SECTION 4: Team Collaboration (7:30 - 9:00)

**[SHOT: File explorer showing collection assets]**

**Voiceover:**
> "Team collaboration is easy. Collections are assets, so they go in version control."

**[SHOT: Git interface or terminal]**

**[ACTION: Show git add, commit]**

```bash
git add Assets/Resources/GameAPI.asset
git commit -m "Add shop endpoints"
git push
```

**Voiceover:**
> "Add to git, commit, push. Your whole team gets the same endpoint configs."

**[SHOT: Show different collections for different purposes]**

**Voiceover:**
> "To create a new collection, right-click in the Project window: Assets, Create, API Mocking Toolkit, API Endpoint Collection. Give it a clear name so your team knows what it's for."

**[SHOT: Example folder organisation inside a collection]**

```
📁 Authentication
  └─ POST /login
  └─ POST /register

📁 Player
  └─ GET /profile
  └─ POST /save
```

**Voiceover:**
> "Use folders inside a collection to group endpoints by feature so large projects stay easy to navigate."

```
Assets/
├─ Collections/
│  ├─ Production.asset (real API configs)
│  ├─ Development.asset (local backend)
│  ├─ QA-EdgeCases.asset (all error scenarios)
│  ├─ QA-Performance.asset (large responses)
│  └─ Demo.asset (for demos)
```

**Voiceover:**
> "Create collections for different purposes. Production has real API configs. QA collections have specific test scenarios. Share them with your team."

**[SHOT: Show QA workflow]**

**Voiceover:**
> "QA workflow: Give QA the 'QA-EdgeCases' collection. They select it, enable offline mode, and test all error scenarios without needing backend access or coordination."

**[SHOT: Show environment configs]**

**Voiceover:**
> "Environments work the same way. Define Dev, Staging, Prod environments, each with its own variables. Everyone on the team uses the same configs. No hardcoded URLs in anyone's code."

**[SHOT: Add Development and Production environments]**

**Voiceover:**
> "For example, Development might point to localhost, Production to your real domain, but they share the same variable names."

```
Development:
  baseUrl = http://localhost:3000
  apiKey  = dev-key-123
  region  = us-west

Production:
  baseUrl = https://api.mygame.com
  apiKey  = prod-key-xyz
  region  = us-east
```

**Voiceover:**
> "In your endpoints you use variables with double curly braces."

```
URL: {{baseUrl}}/player/{{playerId}}/profile?key={{apiKey}}
```

**Voiceover:**
> "Switch environments and the URL updates automatically. Same endpoint definition, different values."

**[SHOT: Show code using variable URL]**

```csharp
// No hardcoded URLs
var response = await ApiClient.GetAsync("{{baseUrl}}/player/profile");
```

**Voiceover:**
> "In code you keep using the variable URL. When someone on the team switches from Dev to QA to Prod, they all get the right base URL and keys without touching code."

---

### SECTION 5: Building on Demo Scene (9:00 - 9:45)

**[SHOT: Demo scene running]**

**Voiceover:**
> "The demo scene is your starting point. Let's extend it."

**[ACTION: Open DemoController.cs]**

**Voiceover:**
> "Copy DemoController.cs to your own controller. Same pattern: button click, API call, display response."

**[SHOT: Show extending it]**

```csharp
// Your game controller
public class GameController : MonoBehaviour
{
    public async void OnLoadPlayerData()
    {
        SetLoadingState(true);
        
        var response = await ApiClient.GetAsync("{{baseUrl}}/player/profile");
        
        if (response.Success) {
            var player = JsonUtility.FromJson<Player>(response.Body);
            DisplayPlayer(player);
        } else {
            ShowError($"Failed to load player: {response.StatusCode}");
        }
        
        SetLoadingState(false);
    }
}
```

**Voiceover:**
> "Same pattern. Loading state, API call, success/error handling, update UI. Simple and reliable."

---

### OUTRO (9:45 - 10:00)

**[SHOT: Unity Editor, multiple features visible]**

**Voiceover:**
> "That's it for the advanced use cases. You've seen testing workflows, session replay debugging, OpenAPI integration, and team collaboration. You're ready to use API Mocking Toolkit in production."

**[SHOT: Text overlay with links]**

**Voiceover:**
> "Check the docs for more examples. Link in description. Subscribe for more Unity tutorials. Thanks for watching!"

---

## YouTube Description

```
API Mocking Toolkit - Advanced Use Cases

⏱️ Timestamps:
0:00 - Introduction
0:30 - Testing Workflows (automated testing, edge cases)
3:00 - Session Replay & Debugging (time-travel debugging)
6:00 - OpenAPI Integration (import/export)
7:30 - Team Collaboration (version control, QA workflows)
9:00 - Building on Demo Scene
9:45 - Conclusion

🔗 Links:
- Documentation: https://backendsimulator.dev/docs/guides
- Previous Video:
  - Get Started & Core Features: [link]

#Unity #GameDev #ApiMockingToolkit #Testing #Debugging
```

---

## Notes for Recording

1. **Prepare assets beforehand:**
   - OpenAPI spec file
   - Bug scenario endpoints
   - Multiple collections
   
2. **Show real code, not pseudo-code**

3. **Demonstrate actual bugs/fixes** (makes it authentic)

4. **Use a real game UI** if possible (more convincing than basic demo)

5. **Add captions** for technical terms (OpenAPI, Swagger, etc.)
