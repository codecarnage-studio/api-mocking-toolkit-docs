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

You're building a Unity game that talks to a backend server. You need login systems, player profiles, leaderboards, shop/inventory, multiplayer matchmaking—but development is painful.

**See yourself in these situations?**

| Scenario                | Without API Mocking Toolkit                                                                 | With API Mocking Toolkit                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Backend team is behind  | <ul><li>Blocked, UI untestable</li><li>Fake data everywhere</li><li>Big refactor later</li></ul> | <ul><li>You define the API contract</li><li>Build & test the client now</li><li>Switch to real backend when it's ready</li></ul> |
| Testing edge cases      | <ul><li>Depend on backend team to simulate errors</li><li>Unstable network</li><li>Bugs hard to reproduce</li></ul> | <ul><li>Configure success/error/timeout/invalid responses yourself</li><li>Replay scenarios instantly as often as needed</li></ul> |
| Working offline         | <ul><li>Game can’t run without network/VPN</li><li>Progress stalls</li></ul>                | <ul><li>Game uses only mocked APIs in Unity</li><li>Keep working wherever you are</li></ul>             |
| Capturing real API data | <ul><li>Copy-paste JSON from Postman/browser</li><li>Format manually</li><li>Keep updating when backend changes</li></ul> | <ul><li>Click "Send" → "Save as Mock"</li><li>Captured with exact headers, status, latency</li><li>Customize before saving</li><li>Work offline instantly</li></ul> |

**Sound familiar? API Mocking Toolkit solves all of this.**

Run your entire game without a backend API server. Test any scenario. Capture real API responses with one click. Work completely offline.

**How it works:**

Your game talks to the API Mocking Toolkit, which can route calls to:

- **Real Backend** – Production or staging servers
- **QA Server** – Testing environment
- **Localhost** – Local development server
- **Mock Responses** – Instant success/error responses with custom status codes, latency, and data

![API Mocking Toolkit Routing](/img/diagram-amt-optimized.png)

**↑ One tool, four ways to test** – Switch between real servers and mocks instantly

---

## What You'll Learn

In this quick guide, you'll:
1. ✅ Install API Mocking Toolkit
2. ✅ Run the demo scene (see it working instantly!)
3. ✅ Create your first mock API endpoint

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
        In Unity, open <code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code>. A new window opens—this is your control center.
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

## What's Next?

🎉 **Congratulations!** You've:
- Installed API Mocking Toolkit
- Run the demo scene
- Created your first endpoint

**Continue learning:**
- [Core Features (Deep Dive)](/docs/core-features) – Response strategies, offline mode, environments, sessions, OpenAPI, error simulation, and more
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
