---
id: core-features
title: 核心功能
sidebar_position: 2
---

核心功能深度解析。

---

## 编辑器窗口布局

打开：`Window > CodeCarnage > API Mocking Toolkit`

**三个标签页：** Endpoints（集合/文件夹/编辑器）、Sessions（录制/回放）、Environments（选择器/变量/导入/导出）

**左侧面板：** 集合选择器、文件夹树、端点列表、**+ Endpoint** 按钮。
**右侧面板：** Mock（成功/错误子标签，包含 Body/Headers）和 Response（实时查看器、捕获按钮）。
**请求面板：** 方法、URL、Headers/Body、发送按钮。变量指示器列出可用的 `{{变量}}`。
**工具栏：** 启用、离线模式、集合下拉菜单、导入/导出（OpenAPI 3.0 + `x-amt-*`）。

---

## 响应策略

控制每次调用返回哪个响应：
- **Sequential（顺序）** – 按顺序读取；根据 `LoopResponses` 标志循环
- **RoundRobin（轮询）** – 无限循环
- **Random（随机）** – 均匀随机

### 商店分页示例

端点：`GET /api/shop/items` 返回 30 件商品，每页 10 件。

配置：创建 `GET /api/shop/items` 端点，添加 3 个响应：

**响应 1（第 1 页）：**
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

**响应 2（第 2 页）：**
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

**响应 3（第 3 页）：**
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

将响应策略设置为 **Sequential**。代码示例：

```csharp
// 游戏代码
for (int page = 1; page <= 5; page++)
{
    var response = await ApiClient.Get("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"第 {page} 页：{data.items.Length} 件商品");
}

// 输出（LoopResponses = true 时）：
// 第 1 页：10 件商品（响应 1）
// 第 2 页：10 件商品（响应 2）
// 第 3 页：10 件商品（响应 3）
// 第 4 页：10 件商品（响应 1 - 已循环！）
// 第 5 页：10 件商品（响应 2）
```

无需后端协调即可完成分页测试。

**策略说明：**
- Sequential：1 → 2 → 3 → （循环或停止）
- RoundRobin：1 → 2 → 3 → 1 → 2 → 3（永久循环）
- Random：2 → 1 → 3 → 2 → 2 → 1

需要"大部分成功，偶尔失败"时，对 `Responses[]` 和 `ErrorResponses[]` 使用 `Random` 策略。

---

## 全局离线模式与端点级模拟切换

全局 **离线模式**（`ApiGlobalConfig`）和每端点的 **Mock 启用**（`UseMock`）控制路由。

**路由顺序：**
1. `ApiGlobalConfig.Enabled` 关闭 → 真实后端（绕过 toolkit）
2. `OfflineMode` 开启 → 全部模拟（或无匹配端点时失败）
3. `OfflineMode` 关闭 + 匹配端点 + `UseMock` 开启 → 模拟
4. 否则 → 真实网络

端点级切换允许保留已配置的端点同时路由到真实后端——适用于捕获实时响应或 A/B 测试。

**启用离线模式：**
```text
Window > CodeCarnage > API Mocking Toolkit
开启 "Offline Mode"
```

**运行时读取：**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

适用于无后端开发、无不稳定网络测试、大会演示。

---

## 环境与变量

无需修改代码即可管理不同后端。

创建环境：Development、Staging、Production。每个环境有独立的 `baseUrl` 和变量。

**URL 和请求体中的变量插值：**
```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**作用域优先级（从高到低）：**
1. 端点专属
2. 环境专属
3. 全局

**运行时切换：**
```csharp
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

未解析的变量会抛出 `MissingEnvironmentVariableException`。不使用硬编码 URL。

### 生产构建安全

`BuildPreprocessor` 在构建前运行。检查项：
1. `OfflineMode` 必须关闭
2. `BuildEnvironmentId` 必须指向已注册的环境
3. 激活环境必须与构建环境匹配

**管理环境：** `Window > CodeCarnage > API Mocking Toolkit > Manage Environments`
- **EDITOR：** Play 模式使用的激活环境（可自由切换）
- **BUILD：** 编译进构建包的环境（仅一个）

违规将以 `BuildFailedException` 使构建失败。

**最佳实践：** Development（开发）、Staging（QA）、Production（构建）。仅 BUILD 环境随包发布。

---

## 集合与文件夹

管理数百个端点。

**集合：** 独立的端点分组（不同游戏、不同 API 版本）。通过 `ApiGlobalConfig.ActiveCollectionName` 一次只能激活一个。

创建：在 Project 窗口右键 → `Create > CodeCarnage > API Mocking Toolkit > Endpoint Collection`。

**文件夹：** 在集合内组织端点（Authentication、Player Data、Leaderboard）。

最佳实践：**集合**用于游戏/版本/测试套件；**文件夹**用于功能/服务。

---

## 会话管理

在 Play 模式下录制所有 API 请求，保存并在之后回放。

**录制：** 在 `ApiGlobalConfig` 上启用 **Session Persistence** → 进入 Play 模式 → 调用自动录制 → 退出 → 保存至 `Application.persistentDataPath/ApiMockingToolkitSessions/`。

**REC 横幅：** 点击 **Stop** 可在不退出 Play 模式的情况下结束会话（适合分割长会话）。非录制状态下横幅自动隐藏。

**回放：** Sessions 标签页 → 选择会话 → Load Session → 查看请求/响应。

适用于 Bug 复现、性能瓶颈分析、团队共享。仅编辑器可用（不编译进构建包）。最多保留 1000 个会话，旧会话自动删除。

**使用场景：** 复杂长流程 Bug、精确故障场景、性能分析。

---

## OpenAPI 集成

**导入：** Toolkit → Import → 选择 `.json` 或 `.yaml` → 自动创建端点

OpenAPI 示例：
```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: 获取所有用户
      responses:
        '200':
          description: 成功
```

结果：创建含 URL、方法、200 响应的端点。

**变量转换：** OpenAPI `{variable}` → Toolkit `{{variable}}`

**导出：** 配置端点 → Export → 保存 `.json` → 发送给后端

安全往返：Export → Import → Export = 同一文件。Toolkit 专属数据（文件夹、策略、延迟、多响应）通过 `x-amt-*` 扩展保留。后端工具忽略扩展，使用标准 OpenAPI 3.0。

---

## 错误模拟

无需破坏真实后端即可测试错误和延迟处理。

添加端点 → 添加错误响应（4xx/5xx）→ 在响应上设置延迟（ms）：

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

对 `ErrorResponses[]` 使用 `Random` 策略模拟偶发故障，或用 `Sequential` 实现确定性行为：
```text
Responses[]:        成功 200（延迟 100ms）
ErrorResponses[]:   错误  500（延迟 1500ms）
                    错误  404（延迟 100ms）
```

**延迟使用场景：** 加载条可见性、慢但成功的 UX、模拟糟糕网络（移动端、Wi-Fi 中断）。

代码处理：
```csharp
var response = await ApiClient.Get("/api/data");
if (!response.Success) {
    switch (response.StatusCode) {
        case 401: ShowLoginScreen(); break;
        case 429: ShowRateLimitMessage(); break;
        case 500: ShowErrorDialog("服务器错误"); break;
    }
}
```

---

## 捕获实时 API 响应

在真实 API 和模拟开发之间搭建桥梁。

**配置：** 用真实 URL 配置端点 → 关闭离线模式 → 点击"Send"。

**捕获：** 收到响应后，点击"Save Body as Success Mock"或"Save Body as Error Mock"（Body 标签）/"Save Headers as..."（Headers 标签）。

**菜单选项：**
- 添加为新响应
- 替换所有响应
- 按名称替换特定响应

**自定义：** 响应名称、状态码、延迟（ms）、Body、Headers。全部从捕获内容预填充。点击确认。

Toolkit 自动启用 `UseMock`，即可离线使用。

**示例：**
```csharp
// 配置：https://api.mygame.com/leaderboard/global，离线模式关闭
var response = await ApiClient.Get("https://api.mygame.com/leaderboard/global");

// 在编辑器中：点击"Save Body as Success Mock" → 名称："Production Leaderboard"
// 开启离线模式 → 使用缓存响应，无需网络调用
var cachedResponse = await ApiClient.Get("https://api.mygame.com/leaderboard/global");
```

**使用场景：** 离线测试 Staging 数据、复现生产 Bug、构建错误库、性能测试、团队共享。

**变量支持：** 编辑捕获的响应，用 `{{baseUrl}}`、`{{apiKey}}` 替换硬编码值。切换环境无需修改模拟。

**防误操作：** 破坏性操作（替换全部/替换特定）有确认对话框。

**最佳实践：** 使用描述性名称（"User Profile - Premium Tier"）。主动捕获错误（401、404、500）。用延迟测试 spinner/超时。结合响应策略使用。通过 Git 对集合进行版本控制。
