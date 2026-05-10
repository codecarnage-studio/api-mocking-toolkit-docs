---
id: quick-start
title: クイックスタート
sidebar_position: 1
toc_max_heading_level: 3
---

バックエンドサービスを待たずに、Unity でゲームの API コールを開発・テストできます。

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## 動画

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

## 問題

バックエンドが遅れている？ネットワークが不安定？オフラインで作業したい？エラーをテストしたい？

- バックエンドが未完成 → API コントラクトを自分で定義し、今すぐビルド、後で実際のバックエンドに切り替え
- エラーをテストしたい → 成功/エラー/タイムアウト/無効なレスポンスをオンデマンドで設定
- オフライン開発 → ネットワークなし、VPN 不要でゲームを実行
- ページネーションのテスト → 異なるレスポンスを自動的にサイクル

API コールのルーティング先：
- 実際のバックエンド（本番、ステージング）
- QA サーバー
- ローカルホスト
- モックレスポンス（カスタムステータスコード、レイテンシ、データ）

![API Mocking Toolkit ルーティング](/img/diagram-amt-optimized.png)

---

## インストール

1. Unity Asset Store を開く
2. "API Mocking Toolkit" を検索 → `Import`（インポート）
3. すべてのファイルをインポート

**要件:** Unity 2021.3 以上、外部依存なし

---

## デモシーン

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. デモシーンを開く</strong></td>
      <td><code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code></td>
    </tr>
    <tr>
      <td><strong>2. Play を押す</strong></td>
      <td>シーンが読み込まれ、2 つのボタンが表示されます：<code>Get Users</code> と <code>Get Posts</code></td>
    </tr>
    <tr>
      <td><strong>3. "Get Users" をクリック</strong></td>
      <td>リクエスト送信 → Toolkit が傍受 → インターネット不要でモックデータを即時返却</td>
    </tr>
    <tr>
      <td><strong>4. "Get Posts" を複数回クリック</strong></td>
      <td>ページ 1 → 2 → 3 → 1 とサイクル（レスポンスストラテジーの動作確認）</td>
    </tr>
  </tbody>
</table>

---

## 仕組み

`DemoController.cs` を開く：

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("{{baseUrl}}/users");
    DisplayResponse(response);
}
```

標準的な API コール。`{{baseUrl}}` はアクティブな環境に応じて解決されます。Toolkit は一致する URL を傍受し、モックデータを返します。`if (testing)` チェックは不要。同じコードがモックでも実際のバックエンドでも動作します。

---

## 最初のエンドポイントを作成

JSONPlaceholder の `/comments` エンドポイントをスタンドインとして使い、ゲームの API をモックします。モックではオフライン、実際の API ではオンラインで動作します。

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. Toolkit ウィンドウを開く</strong></td>
      <td><code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code></td>
    </tr>
    <tr>
      <td><strong>2. エンドポイントを作成</strong></td>
      <td>
        "+ Endpoint" をクリックして設定：
        <ul>
          <li><strong>名前：</strong> <code>Create Comment</code></li>
          <li><strong>メソッド：</strong> <code>POST</code></li>
          <li><strong>URL：</strong> <code>https://jsonplaceholder.typicode.com/comments</code></li>
          <li><strong>マッチタイプ：</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>3. モックレスポンスを追加</strong></td>
      <td>
        ステータスコード：<code>201</code>
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
      <td><strong>4. オフラインモードを有効化</strong></td>
      <td>上部のトグルを ON にする</td>
    </tr>
    <tr>
      <td><strong>5. テスト</strong></td>
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

## 次のステップ

- [コア機能](/docs/core-features) – レスポンスストラテジー、環境、セッション、OpenAPI、エラーシミュレーション
- [ガイド](/docs/guides) – 実際のワークフロー
- [API リファレンス](/docs/api-reference) – API の全仕様

---

## トラブルシューティング

**何も起きない？** オフラインモードが ON になっているか確認。URL が完全一致しているか（大文字・小文字を区別）、Console でエラーを確認。

**デモシーンが動かない？** "Demo Scene Collection" が選択されているか確認。Package Manager からサンプルを再インポート。

**質問？** [トラブルシューティング FAQ](/docs/api-reference#troubleshooting) を確認するか、`support@codecarnage.com` にメール。
