---
id: quick-start
title: Quick Start
sidebar_position: 1
toc_max_heading_level: 3
---

Develop and test your game's API calls in Unity without waiting for backend services.

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## Video

<iframe
  id="demo-video"
  width="560"
  height="315"
  src="https://www.youtube.com/embed/T5L8wV9waKk?enablejsapi=1"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
/>

---

## The Problem

Backend's behind? Network unstable? Want to work offline? Need to test errors?

- Backend’s not ready → define the API contract yourself, build now, switch to real backend later
- Need to test errors → configure success/error/timeout/invalid responses on demand
- Want offline dev → run the game without network, no VPN needed
- Testing pagination → cycle through different responses automatically

Route API calls to:
- Real backends (production, staging)
- QA servers
- Localhost
- Mock responses (custom status codes, latency, data)

![API Mocking Toolkit Routing](/img/diagram-amt-optimized.png)

---

## Installation

1. Open Unity Asset Store
2. Search "API Mocking Toolkit" → `Import`
3. Import all files

**Requirements:** Unity 2021.3+, no external dependencies

---

## Demo Scene

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. Open demo scene</strong></td>
      <td><code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code></td>
    </tr>
    <tr>
      <td><strong>2. Press Play</strong></td>
      <td>Scene loads with two buttons: <code>Get Users</code> and <code>Get Posts</code></td>
    </tr>
    <tr>
      <td><strong>3. Click "Get Users"</strong></td>
      <td>Sends request → Toolkit intercepts → Returns mock data instantly, no internet needed</td>
    </tr>
    <tr>
      <td><strong>4. Click "Get Posts" multiple times</strong></td>
      <td>Cycles through pages 1 → 2 → 3 → 1 (Response Strategies in action)</td>
    </tr>
  </tbody>
</table>

---

## How It Works

Open `DemoController.cs`:

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("{{baseUrl}}/users");
    DisplayResponse(response);
}
```

Standard API call. `{{baseUrl}}` resolves per active environment. Toolkit intercepts matching URLs and returns your mock data. No `if (testing)` checks. Same code works with mocks or real backends.

---

## Create Your First Endpoint

Mock your game's API using JSONPlaceholder's `/comments` endpoint as a stand-in. Works offline with mocks, or online hitting the real API.

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. Open toolkit window</strong></td>
      <td><code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code></td>
    </tr>
    <tr>
      <td><strong>2. Create endpoint</strong></td>
      <td>
        Click "+ Endpoint", set:
        <ul>
          <li><strong>Name:</strong> <code>Create Comment</code></li>
          <li><strong>Method:</strong> <code>POST</code></li>
          <li><strong>URL:</strong> <code>https://jsonplaceholder.typicode.com/comments</code></li>
          <li><strong>Match Type:</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>3. Add mock response</strong></td>
      <td>
        Status Code: <code>201</code>
        <CodeBlock language="json">{`{
  "id": 501,
  "postId": 1,
  "name": "Demo comment from Unity",
  "email": "player@example.com",
  "body": "Returned from mock"
}`}</CodeBlock>
      </td>
    </tr>
    <tr>
      <td><strong>4. Enable Offline Mode</strong></td>
      <td>Toggle ON at the top</td>
    </tr>
    <tr>
      <td><strong>5. Test</strong></td>
      <td>
        <CodeBlock language="csharp">{`using System.Collections.Generic;
using UnityEngine;
using CodeCarnage.ApiMockingToolkit;

public class ProfileTest : MonoBehaviour
{
    async void Start()
    {
        var requestBody = "{\n  \"postId\": 1,\n  \"name\": \"Demo comment\",\n  \"email\": \"player@example.com\"\n}";
        var headers = new Dictionary<string, string> { { "Content-Type", "application/json" } };
        var response = await ApiClient.Post("https://jsonplaceholder.typicode.com/comments", requestBody, headers);
        Debug.Log($"Status: {response.StatusCode}");
    }
}`}</CodeBlock>
      </td>
    </tr>
  </tbody>
</table>

---

## Next Steps

- [Core Features](/docs/core-features) – Response strategies, environments, sessions, OpenAPI, error simulation
- [Guides](/docs/guides) – Real-world workflows
- [API Reference](/docs/api-reference) – Full API surface

---

## Troubleshooting

**Nothing happening?** Make sure Offline Mode is ON, URL matches exactly (case-sensitive), check Console for errors.

**Demo scene not working?** Check "Demo Scene Collection" is selected, re-import Samples from Package Manager.

**Questions?** Check [Troubleshooting FAQ](/docs/api-reference#troubleshooting) or email `support@codecarnage.com`
