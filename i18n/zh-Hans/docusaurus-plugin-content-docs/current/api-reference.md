---
id: api-reference
title: API 参考
sidebar_position: 3
---

代码参考与示例。

---

## 目录

- [快速参考](#快速参考)
- [ApiClient](#apiclient)
- [ApiGlobalConfig](#apiglobalconfig)
- [ApiEndpoint](#apiendpoint)
- [EnvironmentManager](#environmentmanager)
- [SessionManager](#sessionmanager)
- [配置](#配置)
- [故障排查](#故障排查)

---

## 快速参考

### 发起 API 调用

```csharp
using CodeCarnage.ApiMockingToolkit;

// GET
var response = await ApiClient.Get("https://api.example.com/data");

// POST
var response = await ApiClient.Post("https://api.example.com/data", "{\"key\":\"value\"}");

// PUT
var response = await ApiClient.Put("https://api.example.com/data/123", "{\"key\":\"updated\"}");

// PATCH
var response = await ApiClient.Patch("https://api.example.com/data/123", "{\"key\":\"patched\"}");

// DELETE
var response = await ApiClient.Delete("https://api.example.com/data/123");
```

所有方法均接受可选的 `headers` 和 `CancellationToken`：

```csharp
var headers = new Dictionary<string, string> {
    { "Authorization", "Bearer {{token}}" }
};
var cts = new CancellationTokenSource();

var response = await ApiClient.Get(
    "https://api.example.com/me",
    headers,
    cts.Token
);
```

### 处理响应

```csharp
if (response.Success) {
    // 成功 - 状态码 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"数据：{data}");
} else {
    // 错误 - 状态码 >= 400（或传输失败）
    Debug.LogError($"错误 {response.StatusCode}: {response.Body}");
}
```

### 离线模式

`OfflineMode` 是 `ApiGlobalConfig` ScriptableObject 上的序列化字段。
通过 API Mocking Toolkit 窗口或 Inspector 切换：

```csharp
// 运行时读取当前状态
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.OfflineMode) {
    Debug.Log("以离线模式运行");
}
```

> 运行时 API 为只读。如需通过代码修改值（仅编辑器），
> 请使用 `SerializedObject` / `EditorUtility.SetDirty` 操作 asset；
> 不要直接给属性赋值。

### 环境

```csharp
// 获取环境管理器
var envManager = EnvironmentManager.Instance;

// 切换激活环境
envManager.ActiveEnvironment = devEnvironment;

// 解析变量（优先激活环境，其次全局）
string baseUrl = envManager.ResolveVariable("baseUrl");
```

### 会话

```csharp
// 会话持久化由 ApiGlobalConfig 控制（通过编辑器 UI 设置）
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool persistenceOn = config.EnableSessionPersistence;

// 访问会话管理器（仅编辑器）
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
var session = sessionManager.CurrentSession;
sessionManager.EndCurrentSession();
#endif
```

---

## ApiClient

静态入口点。编辑器中：`ApiInterceptor` 路由请求。构建包中：`UnityWebRequest` 调用真实后端。

### 方法

#### Get / Post / Put / Patch / Delete

```csharp
public static Task<ApiResponse> Get(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Post(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Put(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Patch(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Delete(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
```

```csharp
// 示例
var response = await ApiClient.Get("https://api.example.com/users/123");

var json = JsonUtility.ToJson(new LoginRequest { username = "user", password = "pass" });
var response = await ApiClient.Post("https://api.example.com/login", json);

var response = await ApiClient.Delete("https://api.example.com/player/items/456");
```

### ApiResponse

```csharp
public class ApiResponse
{
    public bool Success { get; }
    public int StatusCode { get; }
    public string Body { get; }
    public IReadOnlyDictionary<string, string> Headers { get; }
    public long Size { get; } // 字节
}
```

**使用示例：**
```csharp
var response = await ApiClient.Get("/api/data");

Debug.Log($"成功：{response.Success}");
Debug.Log($"状态码：{response.StatusCode}");
Debug.Log($"Body：{response.Body}");
Debug.Log($"大小：{response.Size} 字节");

if (response.Headers != null && response.Headers.TryGetValue("Content-Type", out var ct)) {
    Debug.Log($"Content-Type：{ct}");
}
```

> 模拟响应中配置的延迟以 `await Task.Delay` 形式在拦截器内部应用
> ——它不是响应对象上的字段。

---

## ApiGlobalConfig

来自 `Resources/ApiGlobalConfig` 的 ScriptableObject。运行时只读。通过 Toolkit 窗口或 Inspector 修改。

```csharp
bool OfflineMode { get; }            // 模拟全部，包括未配置的端点
bool Enabled { get; }                // 主开关
bool EnableSessionPersistence { get; } // 将会话保存到磁盘
string ActiveCollectionName { get; set; } // 激活集合
```

**运行时读取：**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.Enabled && config.OfflineMode) Debug.Log("Toolkit 激活，离线模式");
```

**通过编辑器脚本修改：**
```csharp
#if UNITY_EDITOR
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
var so = new UnityEditor.SerializedObject(config);
so.FindProperty("_offlineMode").boolValue = true;
so.ApplyModifiedProperties();
UnityEditor.EditorUtility.SetDirty(config);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

---

## ApiEndpoint

`ApiEndpointCollection` 中的可序列化端点模型。通过 Toolkit 窗口修改；游戏代码中极少直接构建。

```csharp
string Id { get; set; }              // 稳定的 GUID（URL/方法变更后仍保留）
string Name { get; set; }            // 友好名称
string Url { get; set; }             // URL 或模板（{{baseUrl}}/users）
string Method { get; set; }          // GET, POST, PUT, PATCH, DELETE, HEAD
MatchType MatchType { get; set; }    // Exact | Contains

bool UseMock { get; set; }           // 端点级切换
bool SimulateError { get; set; }     // false → Responses[]；true → ErrorResponses[]

string Headers { get; set; }         // 原始"Key: Value"每行一个
string RequestBody { get; set; }     // POST/PUT/PATCH 的 JSON 请求体

List<MockFlowNode> Responses { get; }       // 成功响应
List<MockFlowNode> ErrorResponses { get; }  // 错误响应

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Sequential/RoundRobin 游标

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // 错误游标
```

**路由：** `Enabled` 关闭 → 真实。`OfflineMode` 开启 → 模拟全部。`UseMock` 开启 → 模拟。否则 → 真实。
`SimulateError` 通过策略在 `Responses[]` 和 `ErrorResponses[]` 之间选择。

### 示例

```csharp
#if UNITY_EDITOR
var collection = Resources.Load<ApiEndpointCollection>("ApiEndpointCollection");
var ep = collection.Endpoints.First(e => e.Name == "Get Profile");

ep.UseMock = true;                     // 将此端点路由到模拟
ep.SimulateError = false;              // 从 Responses[] 提供
ep.ResponseStrategy = ResponseStrategy.Sequential;
ep.LoopResponses = true;

UnityEditor.EditorUtility.SetDirty(collection);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

> `Id` 在 URL/方法修改以及 OpenAPI 导入/导出往返中得以保留
> （在导出规范中存储为 `x-amt-id`）。不要自行生成 ID；
> 让 Toolkit 来分配。

---

## EnvironmentManager

持久化单例。将环境和全局变量存储在 `Application.persistentDataPath/ApiMockingToolkit/Environments/`。

**属性：**
```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // 未注册时忽略
string BuildEnvironmentId { get; set; }             // 编译进构建包的环境
ApiEnvironment BuildEnvironment { get; }
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

**方法：**
```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);        // 为 null 或唯一剩余时返回 false
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);                // 优先激活环境，其次全局
ApiRequest InterpolateRequest(ApiRequest req);     // 严格模式；未解析时抛出异常
void SaveEnvironments();
```

**ApiEnvironment：**
```csharp
public class ApiEnvironment {
    public string Id { get; }              // GUID
    public string Name { get; set; }
    public string BaseUrl { get; set; }
    public Dictionary<string, string> Variables { get; set; }

    public void   SetVariable(string key, string value);
    public string GetVariable(string key);
    public bool   RemoveVariable(string key);
    public bool   HasVariable(string key);
    public int    VariableCount { get; }
    public ApiEnvironment Clone();
}
```

**示例：**
```csharp
var envManager = EnvironmentManager.Instance;
var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;
string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

**构建控制：** `BuildPreprocessor` 验证 `OfflineMode` 关闭、`BuildEnvironmentId` 已注册、激活环境与构建环境匹配。Play 模式无限制。违规以 `BuildFailedException` 使构建失败。

---

## SessionManager

仅编辑器。将会话持久化到 `Application.persistentDataPath/ApiMockingToolkitSessions/`。

**属性：**
```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // 会话启动/结束/删除时触发
```

**方法：**
```csharp
void StartNewSession();
void EndCurrentSession();               // 同时保存到磁盘
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);
List<Session> LoadAllSessions();
Session LoadSession(string sessionId);  // 按 ID 而非文件路径
void DeleteSession(string sessionId);
void DeleteAllSessions();
int GetSavedSessionCount();
string GetSessionFolderPath();
```

**示例：**
```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
sessionManager.StartNewSession();
// ... 游玩，发起 API 调用 ...
sessionManager.EndCurrentSession();   // 自动保存
var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"会话：{session.TotalRequests} 次请求，持续 {session.GetDurationSeconds()} 秒");
#endif
```

由 `EnableSessionPersistence` 控制。磁盘最多保留 1000 个会话；旧会话自动删除。

---

## 配置

**ResponseStrategy：**
```csharp
Sequential   // 1 → 2 → 3 → 1（LoopResponses 为 true 时循环）
RoundRobin   // 规律循环，无限次
Random       // 每次调用均匀随机
```

**MatchType：**
```csharp
Exact       // request.url == endpoint.url
Contains    // request.url.Contains(endpoint.url)
```

**HTTP 方法（Constants.HttpMethods）：**
```csharp
Get    // "GET"
Post   // "POST"
Put    // "PUT"
Patch  // "PATCH"
Delete // "DELETE"
Head   // "HEAD"
```

游戏代码直接调用 `ApiClient` 方法；无需指定方法字符串。

---

## 故障排查

**端点不匹配：** `Enabled` 是否开启？离线模式是否启用？URL 是否完全匹配（区分大小写）？MatchType（Exact vs Contains）？集合是否正确？HTTP 方法是否匹配？`UseMock` 是否开启（离线模式关闭时）？

**变量未替换：** 变量是否存在于激活环境/全局中？语法是否为 `{{variableName}}`？有无拼写错误？是否设置了激活环境？会抛出 `MissingEnvironmentVariableException` 并列出可用变量。

**会话未保存：** `EnableSessionPersistence` 是否为 true？是否在编辑器中运行（会话仅限编辑器）？是否调用了 `EndCurrentSession()` 或退出了 Play 模式？查看 Console 中的 `[SessionManager]` 错误。

**示例场景损坏：** 从 Package Manager 重新导入 Samples。选择 "Demo Scene Collection"。查看 Console。

**构建错误：** `OfflineMode` 是否开启（请关闭）。是否未定义构建环境或激活环境不匹配。`async/await` 所需的脚本后端/API 兼容性级别。

**性能：** 限制响应体大小。减少延迟。若不需要，禁用会话持久化。
