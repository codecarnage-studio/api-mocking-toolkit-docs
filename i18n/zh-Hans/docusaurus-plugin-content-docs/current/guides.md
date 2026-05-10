---
id: guides
title: 使用指南
sidebar_position: 2
---

真实工作流与使用场景。

---

## 开发流程

无需等待后端即可开始构建。

### 后端 API 未就绪

与后端团队定义契约：

```json
// POST /api/login
请求：
{
  "username": "string",
  "password": "string"
}

响应（成功）：
{
  "token": "string",
  "userId": "number",
  "username": "string"
}

响应（错误）：
{
  "error": "Invalid credentials"
}
```

在 Toolkit 中创建模拟端点：
- 端点：`POST /api/login`
- 成功（200）：`{"token": "mock-jwt-token-12345", "userId": 1001, "username": "testuser"}`
- 错误（401）：`{"error": "Invalid credentials"}`
- 使用 `Random` 策略混合响应，或 `Sequential`（第 1 次成功 → 第 2 次错误 → 循环）

构建 UI：

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
            ShowError("登录失败");
        }
    }
}
```

后端就绪后，关闭离线模式。代码无需任何修改。生产构建必须关闭离线模式；`BuildPreprocessor` 会强制执行此项。编辑器专属类型（`ApiInterceptor`、`SessionManager`）已用 `#if UNITY_EDITOR` 包裹，不会进入构建包。

---

## 测试与 QA

无需后端协调，创建可复现的测试场景。

### 错误处理

端点配置：
```
端点：GET /api/player/inventory
策略：Random
Responses[]：        成功 200
ErrorResponses[]：   状态 408（超时，延迟 5000ms）
                     状态 500（服务器错误）
                     状态 401（认证错误）
```

切换 `SimulateError` 以在 `Responses[]` 和 `ErrorResponses[]` 之间切换。

运行自动化测试：

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // 运行前在 Toolkit 窗口启用离线模式
    // （Window > CodeCarnage > API Mocking Toolkit > Offline Mode）

    // 多次调用 API
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.Get("/api/player/inventory");
        
        // 验证错误处理是否正常工作
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "应当显示错误对话框");
        }
    }
}
```

QA 测试用例：启用离线模式 → 选择集合 → 触发场景 → 验证错误处理。

### 边界情况

测试空响应：

```json
// 空库存
[]

// 空数据
null

// 缺少字段
{
  "items": null
}
```

**测试大响应：**

```json
// 库存中 1000 个物品
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"},
  ...
  {"id": 1000, "name": "Item 1000"}
]
```

**测试特殊字符：**

```json
{
  "username": "test<script>alert('xss')</script>",
  "message": "第一行\n第二行\t带制表符"
}
```

使用 `Sequential` 策略在每次调用时循环切换边界情况。

---

## API 原型设计

在后端实现之前先进行设计。

### 好友系统

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

构建 UI，迭代响应结构，然后导出 → 发送给后端。后端按规范实现。通过 `x-amt-*` 扩展保留 Toolkit 专属细节，OpenAPI 往返安全。

---

## 会话调试

回放会话实现"时光旅行"式调试。

### Bug 复现

在 `ApiGlobalConfig` 上启用 Session Persistence。测试员进行游玩，崩溃发生，退出 Play 模式时会话自动保存。在 REC 横幅上点击 **Stop** 可在中途捕获会话。

在 Toolkit 的 Sessions 标签页加载会话。分析精确的请求序列：

```
1. GET /api/shop/items - 成功
2. POST /api/shop/buy - Item 1 - 成功
3. GET /api/player/inventory - 成功
4. POST /api/shop/buy - Item 2 - 成功
5. GET /api/player/inventory - 成功
6. POST /api/shop/buy - Item 3 - 错误 500
7. GET /api/player/inventory - [崩溃]
```

游戏未处理购买失败后的库存刷新。修复后，重新加载同一会话进行验证。

在卡顿段落进行游玩，加载会话。查看 API 延迟：

```
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← 慢
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

与后端协作优化慢速端点。

---

## 团队协作

### 版本控制

集合默认位于 `Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/`（通过 `Resources.Load` 加载）。提交到 Git：

```bash
git add Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/ApiEndpointCollection.asset
git commit -m "Add API mock configurations"
```

所有开发者拉取 → 端点保持一致。

### QA 工作流

创建 QA 集合：`QA-Edge-Cases.asset`、`QA-Performance.asset`、`QA-Happy-Path.asset`。在 Toolkit 中选择，启用离线模式，运行测试。

### 后端协调

创建端点 → 导出 OpenAPI 规范 → 发送给后端 → 按规范实现 → 关闭离线模式 → 用真实后端测试。

---

## 扩展示例场景

示例展示 "Get Users" / "Get Posts" 按钮：

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/users");
    rightText.text = FormatResponse(response);
}
```

### 添加新按钮

添加端点 → `GET https://jsonplaceholder.typicode.com/comments` → 复制 "Get Posts" 按钮 → 添加处理器：

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/comments");
    UpdateUI(response);
}
```

将按钮的 OnClick 连接到该处理器。

### 使用响应策略实现分页

为 `GET /posts` 添加 3 个响应（第 1、2、3 页）。将响应策略设置为 **Sequential**。每次点击返回下一页，第 4 次点击时循环。

### 错误模拟

添加错误响应（500）。将**错误响应策略**设置为 `Sequential` 或 `Random`。切换 **Simulate Error** 以在成功和错误路径间切换。代码处理：

```csharp
if (!response.Success) {
    rightText.text = $"错误：{response.StatusCode}";
    return;
}
```

---

**下一步：** [API 参考](api-reference.md) - 代码速查表
