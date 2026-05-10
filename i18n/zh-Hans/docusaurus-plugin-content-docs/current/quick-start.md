---
id: quick-start
title: 快速开始
sidebar_position: 1
toc_max_heading_level: 3
---

在 Unity 中开发和测试游戏 API 调用，无需等待后端服务。

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## 视频

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

## 问题场景

后端未就绪？网络不稳定？需要离线工作？需要测试错误？

- 后端未准备好 → 自行定义 API 契约，先构建，之后再切换到真实后端
- 需要测试错误 → 按需配置成功/错误/超时/无效响应
- 离线开发 → 无网络运行，无需 VPN
- 分页测试 → 自动循环切换不同响应

将 API 调用路由到：
- 真实后端（生产、Staging）
- QA 服务器
- 本地服务器
- 模拟响应（自定义状态码、延迟、数据）

![API Mocking Toolkit 路由示意图](/img/diagram-amt-optimized.png)

---

## 安装

1. 打开 Unity Asset Store
2. 搜索 "API Mocking Toolkit" → `Import`
3. 导入所有文件

**前提条件：** Unity 2021.3+，无外部依赖

---

## 示例场景

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. 打开示例场景</strong></td>
      <td><code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code></td>
    </tr>
    <tr>
      <td><strong>2. 点击 Play</strong></td>
      <td>场景加载后显示两个按钮：<code>Get Users</code> 和 <code>Get Posts</code></td>
    </tr>
    <tr>
      <td><strong>3. 点击 "Get Users"</strong></td>
      <td>发送请求 → Toolkit 拦截 → 无需网络，立即返回模拟数据</td>
    </tr>
    <tr>
      <td><strong>4. 多次点击 "Get Posts"</strong></td>
      <td>循环切换第 1 → 2 → 3 → 1 页（响应策略演示）</td>
    </tr>
  </tbody>
</table>

---

## 工作原理

打开 `DemoController.cs`：

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("{{baseUrl}}/users");
    DisplayResponse(response);
}
```

标准 API 调用。`{{baseUrl}}` 根据当前激活的环境解析。Toolkit 拦截匹配的 URL 并返回您的模拟数据。无需 `if (testing)` 判断。同一代码在模拟和真实后端下均可运行。

---

## 创建您的第一个端点

以 JSONPlaceholder 的 `/comments` 接口为例，模拟您的游戏 API。使用模拟时离线可用，调用真实 API 时需联网。

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. 打开工具包窗口</strong></td>
      <td><code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code></td>
    </tr>
    <tr>
      <td><strong>2. 创建端点</strong></td>
      <td>
        点击 "+ Endpoint"，设置：
        <ul>
          <li><strong>名称：</strong> <code>Create Comment</code></li>
          <li><strong>方法：</strong> <code>POST</code></li>
          <li><strong>URL：</strong> <code>https://jsonplaceholder.typicode.com/comments</code></li>
          <li><strong>匹配类型：</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>3. 添加模拟响应</strong></td>
      <td>
        状态码：<code>201</code>
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
      <td><strong>4. 启用离线模式</strong></td>
      <td>打开顶部开关</td>
    </tr>
    <tr>
      <td><strong>5. 测试</strong></td>
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

## 后续步骤

- [核心功能](/docs/core-features) – 响应策略、环境、会话、OpenAPI、错误模拟
- [使用指南](/docs/guides) – 真实工作流示例
- [API 参考](/docs/api-reference) – 完整 API 接口

---

## 故障排查

**没有任何反应？** 检查离线模式是否已开启，URL 是否完全匹配（区分大小写），查看 Console 中的错误信息。

**示例场景无法运行？** 确认已选择 "Demo Scene Collection"，从 Package Manager 重新导入 Samples。

**有疑问？** 查阅[故障排查 FAQ](/docs/api-reference#故障排查) 或发送邮件至 `support@codecarnage.com`
