# Video 1: Get Started & Core Features

**Duration:** 10–12 minutes  
**Goal:** Get users from zero to first mock API **and** showcase the core features  
**Audience:** Complete beginners

---

## Script & Shots

### INTRO (0:00 - 0:30)

**[SHOT: Unity Editor with game running]**

**Voiceover:**
> "Hi, I'm [Name]. In this tutorial, we'll set up API Mocking Toolkit in Unity, run the demo scene, and create a mocked API endpoint you can call from your game."

**[SHOT: Show final result - Demo Scene running]**

**Voiceover:**
> "By the end of this video, you'll have this working - making API calls, getting responses, all completely offline."

---

### SECTION 1: What is API Mocking Toolkit? (0:30 - 2:00)

**[SHOT: Slide or text overlay]**

**Title:** "What is API Mocking Toolkit?"

**Voiceover:**
> "API Mocking Toolkit lets you mock any HTTP API in Unity. Here's why you'd want to use it:"

**[SHOT: Text bullets appearing one by one]**

**Points:**
1. "Develop without a backend - Work offline, on planes, anywhere"
2. "Test thoroughly - Simulate errors, edge cases, any scenario"
3. "Ship faster - No waiting for backend teams"

**[SHOT: Architecture diagram (prepare beforehand)]**

```
Your Game Code → ApiClient → API Mocking Toolkit → Mock Response
                              ↓ (if no mock)
                              Real API → Real Response
```

**Voiceover:**
> "It intercepts your API calls. If a mock is configured, you get the mock. Otherwise, it passes through to the real API. Simple."

---

### SECTION 2: Installation (2:00 - 3:00)

**[SHOT: Unity Editor, Package Manager window]**

**Voiceover:**
> "Let's install it. Open Unity Package Manager."

**[ACTION: Window > Package Manager]**

**[SHOT: Click + button, select "Add package from git URL"]**

**Voiceover:**
> "Click the plus button, select 'Add package from git URL'."

**[SHOT: Type the git URL]**

**[ACTION: Type: https://github.com/your repo/api-mocking-toolkit.git]**

**Voiceover:**
> "Paste this URL - it's in the description below - and click Add."

**[SHOT: Package importing, progress bar]**

**Voiceover:**
> "Wait for it to import... and done!"

**[SHOT: Package appears in list]**

**Voiceover:**
> "API Mocking Toolkit is now installed. Let's see it in action."

---

### SECTION 3: Run the Demo Scene (3:00 - 5:00)

**[SHOT: Project window, navigate to folder]**

**Voiceover:**
> "The fastest way to understand it is to run the demo scene. Navigate to Assets, CodeCarnage, ApiMockingToolkit, Samples, DemoScene."

**[ACTION: Navigate folder tree]**

**[SHOT: Double-click DemoScene.unity]**

**Voiceover:**
> "Double-click DemoScene to open it."

**[SHOT: Scene view showing the demo UI]**

**Voiceover:**
> "Here's our demo scene. It's a simple UI with two buttons: Get Users and Get Posts."

**[SHOT: Click Play button]**

**Voiceover:**
> "Let's run it. Click Play."

**[SHOT: Game view, demo running]**

**[ACTION: Click "Get Users" button]**

**Voiceover:**
> "I'll click 'Get Users'... and we get mock user data from the toolkit instead of a live backend. This all runs locally inside Unity."

**[SHOT: Point to the response panel]**

**Voiceover:**
> "See the response? Status 200, user data in JSON format. This is a mocked API response."

**[ACTION: Click "Get Posts" button]**

**Voiceover:**
> "Click 'Get Posts'... same thing. Instant mock response."

**[SHOT: Click "Get Posts" multiple times]**

**Voiceover:**
> "Watch what happens if I click it multiple times... different responses! This is called Response Strategies \\u2013 we'll dig into how this works later in this video."

**[SHOT: Stop Play mode]**

---

### SECTION 4: How the Demo Works (5:00 - 6:30)

**[SHOT: Open DemoController.cs in IDE]**

**Voiceover:**
> "Let's see how this works. Open DemoController.cs."

**[SHOT: Scroll to OnGetUsersClicked method]**

**Voiceover:**
> "Here's the code. When you click 'Get Users', it calls this method."

**[HIGHLIGHT: The API call line]**

```csharp
var response = await ApiClient.GetAsync(
    "https://jsonplaceholder.typicode.com/users"
);
```

**Voiceover:**
> "It makes a GET request to this URL using ApiClient. That's it. API Mocking Toolkit intercepts it and returns mock data."

**[SHOT: Expand method to show full body]**

**Voiceover:**
> "If we look at the whole handler, it's following a simple pattern: show loading, call the API, display the result, hide loading."

```csharp
public async void OnGetUsersClicked()
{
    SetLoading(true);
    
    var response = await ApiClient.GetAsync(
        "https://jsonplaceholder.typicode.com/users"
    );
    
    DisplayResponse(response);
    SetLoading(false);
}
```

**Voiceover:**
> "DisplayResponse handles both success and errors \\u2013 it checks response.Success, parses the JSON, and updates the UI."

**[SHOT: Show UI setup in Scene]**

**Voiceover:**
> "The demo scene is just UI components and buttons. Request panel on the left, response on the right. All the endpoints live in a Demo Scene collection asset that you can duplicate or extend for your own project."

**[SHOT: Switch to Unity Editor, open API Mocking Toolkit window]**

**[ACTION: Window > API Mocking Toolkit]**

**Voiceover:**
> "How does it know what to return? Let's open the API Mocking Toolkit window."

**[SHOT: API Mocking Toolkit window showing endpoints]**

**Voiceover:**
> "See these endpoints? This one matches our URL. It has pre-configured mock responses. When the code calls that URL, API Mocking Toolkit returns this mock data."

**[SHOT: Select endpoint, show response JSON]**

**Voiceover:**
> "Here's the mock response data. You can edit this to return anything you want."

---

### SECTION 5: Create Your First Endpoint (6:30 - 9:00)

**[SHOT: API Mocking Toolkit window, endpoints tab]**

**Voiceover:**
> "Now let's create your own custom endpoint. Click the '+ Endpoint' button."

**[ACTION: Click + Endpoint]**

**[SHOT: Endpoint editor appears]**

**Voiceover:**
> "Fill in these fields."

**[ACTION: Type in fields while explaining]**

**Fields:**
- Name: "Get Player Profile"
- Method: GET
- URL: "https://api.mygame.com/player/profile"
- Match Type: Exact

**Voiceover:**
> "Name it 'Get Player Profile', method is GET, URL is your game's API endpoint, and Match Type is Exact."

**[SHOT: Scroll to Response section]**

**[ACTION: Add response]**

**Voiceover:**
> "Now add a response. Status code 200 for success."

**[ACTION: Type JSON in body field]**

```json
{
  "playerId": 123,
  "username": "TestPlayer",
  "level": 42,
  "coins": 9999
}
```

**Voiceover:**
> "Here's your mock player data. Type whatever JSON you want."

**[SHOT: Click Save]**

**[ACTION: Click Save button]**

**Voiceover:**
> "Click Save. Your endpoint is now configured."

**[SHOT: Toggle Offline Mode ON]**

**[ACTION: Toggle Offline Mode]**

**Voiceover:**
> "Enable Offline Mode. This ensures all API calls use mocks."

**[SHOT: Create simple test script]**

**[ACTION: Create new C# script: ProfileTest.cs]**

**Voiceover:**
> "Let's test it. Create a new script called ProfileTest."

**[SHOT: Type code in IDE]**

```csharp
using UnityEngine;
using CodeCarnage.ApiMockingToolkit;

public class ProfileTest : MonoBehaviour
{
    async void Start()
    {
        var response = await ApiClient.GetAsync(
            "https://api.mygame.com/player/profile"
        );
        
        Debug.Log($"Status: {response.StatusCode}");
        Debug.Log($"Body: {response.Body}");
    }
}
```

**Voiceover:**
> "Simple script. On Start, call your API and log the response."

**[SHOT: Attach script to GameObject, run]**

**[ACTION: Create empty GameObject, attach script, Play]**

**[SHOT: Console showing the mock response]**

**Voiceover:**
> "Run it... and there's your mock data! Status 200, player profile JSON, exactly what you configured."

---

### SECTION 6: Core Features Tour (9:00 - 12:00)

**[SHOT: Back to API Mocking Toolkit window, Endpoints tab]**

**Voiceover:**
> "Before we wrap up, let me quickly show you some of the core features you'll use a lot with API Mocking Toolkit. We'll look at Response Strategies, Offline Mode, Environments, and Collections."

#### 6.1 Response Strategies

**[SHOT: Highlight Response Strategy dropdown on a multi-response endpoint]**

**Voiceover:**
> "First, Response Strategies. When an endpoint has multiple responses, the strategy decides which one gets returned each time you call it. Sequential for pagination, Random for variety, Weighted for 'mostly success with occasional errors'."

**[SHOT: Small overlay diagram with Sequential / Random / Weighted arrows]**

**Voiceover:**
> "This is how we got different post responses when clicking the button earlier. It's great for testing pagination and error handling without touching your backend."

#### 6.2 Offline Mode

**[SHOT: Global toolbar, toggle Offline Mode on]**

**Voiceover:**
> "Next, Offline Mode. Flip this toggle on, and all API calls are intercepted. Configured endpoints get mock responses, and anything you haven't configured will fail fast instead of silently hitting a real server. This is useful when you're working without reliable network access or when backend services are not available."

#### 6.3 Environments & Variables

**[SHOT: Switch to Environments tab]**

**Voiceover:**
> "Environments let you swap between dev, staging, and production style configs without changing your game code. You define variables like `baseUrl` and `apiKey`, then use `{{baseUrl}}` in your URLs. Changing the active environment changes all of those in one go."

**[SHOT: Show `{{baseUrl}}/user/profile` resolving differently in Dev vs Prod]**

**Voiceover:**
> "So the same code in your game can talk to a local server today, a mock server tomorrow, and the real backend later, just by switching environments."

**[SHOT: Click "Manage Environments" button, show Environment Management dialog]**

**Voiceover:**
> "Now here's an important production safety feature. See these radio buttons next to each environment? Only ONE environment can be marked for production builds. Click any radio button, and the others automatically deselect."

**[ACTION: Click radio button next to "Production" environment - show it turning green, others deselecting]**

**Voiceover:**
> "This prevents you from accidentally shipping your game with dev or staging environment settings. When you build your game, Unity will enforce that exactly one environment is marked. In Play Mode, though, you can freely switch between any environment for testing."

**[SHOT: Close dialog, return to main window]**

#### 6.4 Collections & Folders

**[SHOT: Endpoints tab, expand folder tree]**

**Voiceover:**
> "Finally, Collections and Folders. Collections are like separate projects \\u2013 you might have one per game or one per API version. Inside a collection, folders let you group endpoints by feature: Auth, Player, Shop, Leaderboards, and so on. This keeps big projects from turning into a flat, unmanageable list."

**[SHOT: Scroll through a nicely organized tree of endpoints]**

**Voiceover:**
> "Together, these features make it realistic to manage hundreds of endpoints without losing your mind."

---

### OUTRO (12:00 - 12:30)

**[SHOT: Unity Editor, demo scene visible]**

**Voiceover:**
> "That's it for this video! You've installed API Mocking Toolkit, run the demo, created your first mock API, and seen the core features you'll use every day."

**[SHOT: Text overlay with links]**

**Voiceover:**
> "If you want to go deeper, check out the Advanced Use Cases video. There we cover sessions, OpenAPI integration, and real production workflows. Links are in the description."

**[SHOT: End screen with subscribe button]**

**Voiceover:**
> "Subscribe for more Unity tutorials. Thanks for watching!"

---

## B-Roll Ideas (Optional)

- Code snippets appearing on screen
- Diagram animations showing request flow
- Time-lapse of API calls being made
- Split-screen: real API vs mocked API

---

## Notes for Recording

### Critical for "People Don't Want to Read Much"

1. ✅ **Keep it FOCUSED** - aim for ~10-12 min, but keep every minute valuable
2. ✅ **Fast-paced** - Don't dwell, keep moving
3. ✅ **Visual focus** - Show, don't tell
4. ✅ **Chapters/timestamps** - Let people jump to sections
5. ✅ **Thumbnail matters** - Clear text: "5 Min Tutorial"

### Technical Quality

1. **Clear audio** - Use good microphone
2. **Slow mouse** - Move cursor slowly, highlight what you're clicking
3. **Zoom in** - Zoom Unity Editor for important parts
4. **Pause after actions** - Give viewers time to see results
5. **Add timestamps** in YouTube description
6. **Show errors** - If something goes wrong, show how to fix it

### Making Video Skimmable

- Add **text overlays** for key points
- Use **arrows/highlights** to show what you're clicking
- **Color code** sections (green = success, red = error)
- **Progress indicator** (Step 1/4, Step 2/4, etc.)

---

## YouTube Description Template

```
API Mocking Toolkit - Get Started & Core Features

⏱️ Timestamps:
0:00 - Introduction
0:30 - What is API Mocking Toolkit?
2:00 - Installation
3:00 - Run the Demo Scene
5:00 - How it Works
6:30 - Create Your First Endpoint
9:00 - Core Features Tour
12:00 - Conclusion

🔗 Links:
- Documentation: https://backendsimulator.dev
- Asset Store: [link]
- GitHub: [link]
- Discord: [link]

📥 Installation URL:
https://github.com/yourrepo/api-mocking-toolkit.git

📚 Next Videos:
- Advanced Use Cases

#Unity #GameDev #ApiMockingToolkit #API #Tutorial
```
