---
id: guides
title: ガイド
sidebar_position: 2
---

ワークフローと実際のユースケース。

---

## 開発ワークフロー

バックエンドを待たずにビルド。

### バックエンド API が未完成の場合

バックエンドチームとコントラクトを定義：

```json
// POST /api/login
リクエスト：
{
  "username": "string",
  "password": "string"
}

レスポンス（成功）：
{
  "token": "string",
  "userId": "number",
  "username": "string"
}

レスポンス（エラー）：
{
  "error": "Invalid credentials"
}
```

Toolkit でモックエンドポイントを作成：
- エンドポイント：`POST /api/login`
- 成功（200）：`{"token": "mock-jwt-token-12345", "userId": 1001, "username": "testuser"}`
- エラー（401）：`{"error": "Invalid credentials"}`
- `Random` ストラテジーでレスポンスを混合、または `Sequential`（1 番目成功 → 2 番目エラー → ループ）

UI のビルド：

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

バックエンドが完成したら、オフラインモードを OFF にする。コードは変更不要。本番ビルドではオフラインモードを無効にする必要があり、`BuildPreprocessor` がこれを強制。エディター専用の型（`ApiInterceptor`、`SessionManager`）は `#if UNITY_EDITOR` でラップされ、ビルドには含まれない。

---

## テスト & QA

バックエンドの協力なしに再現可能なテストシナリオを作成。

### エラーハンドリング

エンドポイントを設定：
```
エンドポイント：GET /api/player/inventory
ストラテジー：Random
Responses[]:        成功 200
ErrorResponses[]:   ステータス 408（タイムアウト、レイテンシ 5000 ms）
                    ステータス 500（サーバーエラー）
                    ステータス 401（認証エラー）
```

`SimulateError` を ON/OFF して `Responses[]` と `ErrorResponses[]` を切り替え。

自動テストの実行：

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // テスト実行前に Toolkit ウィンドウでオフラインモードを有効化
    // （Window > CodeCarnage > API Mocking Toolkit > Offline Mode）

    // API を複数回コール
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.Get("/api/player/inventory");
        
        // エラーハンドリングの動作確認
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "Error dialog should be shown");
        }
    }
}
```

QA テストケース：オフラインモードを有効化 → コレクションを選択 → シナリオをトリガー → エラーハンドリングを確認。

### エッジケース

空のレスポンスをテスト：

```json
// 空のインベントリ
[]

// Null データ
null

// フィールドが欠けている
{
  "items": null
}
```

**大きなレスポンスをテスト：**

```json
// インベントリに 1000 アイテム
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"},
  ...
  {"id": 1000, "name": "Item 1000"}
]
```

**特殊文字をテスト：**

```json
{
  "username": "test<script>alert('xss')</script>",
  "message": "Line 1\nLine 2\tTabbed"
}
```

各コールでエッジケースをサイクルするには `Sequential` ストラテジーを使用。

---

## API のプロトタイピング

バックエンドが実装する前にデザイン。

### フレンドシステム

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

UI をビルドし、レスポンススキーマを反復、その後 Export → バックエンドに送信。バックエンドは仕様に従って実装。`x-amt-*` 拡張で Toolkit 固有の詳細を保持しながら OpenAPI ラウンドトリップ安全。

---

## セッションを使ったデバッグ

タイムトラベルデバッグのためにセッションをリプレイ。

### バグの再現

`ApiGlobalConfig` で Session Persistence を有効化。テスターがプレイ、クラッシュ発生、Play Mode 終了時にセッションが自動保存。REC バナーの **Stop** をクリックしてセッション中に保存。

Toolkit でセッションを読み込む → Sessions タブ。正確なリクエストシーケンスを分析：

```
1. GET /api/shop/items - 成功
2. POST /api/shop/buy - アイテム 1 - 成功
3. GET /api/player/inventory - 成功
4. POST /api/shop/buy - アイテム 2 - 成功
5. GET /api/player/inventory - 成功
6. POST /api/shop/buy - アイテム 3 - エラー 500
7. GET /api/player/inventory - [CRASH]
```

購入失敗後のインベントリ取得をゲームが処理していない。修正し、同じセッションを再度読み込んで確認。

スローな部分をプレイし、セッションを読み込む。API レイテンシを確認：

```
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← 遅い
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

バックエンドと協力してスローなエンドポイントを最適化。

---

## チームコラボレーション

### バージョン管理

コレクションはデフォルトで `Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/` 以下（`Resources.Load` 経由で読み込み）。Git にコミット：

```bash
git add Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/ApiEndpointCollection.asset
git commit -m "Add API mock configurations"
```

すべての開発者がプル → 同一のエンドポイント。

### QA ワークフロー

QA コレクションを作成：`QA-Edge-Cases.asset`、`QA-Performance.asset`、`QA-Happy-Path.asset`。Toolkit で選択し、オフラインモードを有効化してテストを実行。

### バックエンドとの連携

エンドポイントを作成 → OpenAPI 仕様をエクスポート → バックエンドに送信 → バックエンドが仕様に従って実装 → オフラインモードを OFF → 実際のバックエンドでテスト。

---

## デモシーンの拡張

デモには "Get Users" / "Get Posts" ボタンが表示：

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/users");
    rightText.text = FormatResponse(response);
}
```

### 新しいボタンを追加

エンドポイントを追加 → `GET https://jsonplaceholder.typicode.com/comments` → "Get Posts" ボタンを複製 → ハンドラーを追加：

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/comments");
    UpdateUI(response);
}
```

ボタンの OnClick にハンドラーを接続。

### レスポンスストラテジーによるページネーション

`GET /posts` に 3 つのレスポンスを追加（ページ 1、ページ 2、ページ 3）。レスポンスストラテジーを **Sequential** に設定。クリックするたびに次のページが返され、4 回目でループ。

### エラーシミュレーション

エラーレスポンス（500）を追加。**Error Response Strategy** を `Sequential` または `Random` に設定。**Simulate Error** を ON/OFF して成功パスとエラーパスを切り替え。コードでの処理：

```csharp
if (!response.Success) {
    rightText.text = $"ERROR: {response.StatusCode}";
    return;
}
```

---

**次：** [API リファレンス](api-reference.md) - コードチートシート
