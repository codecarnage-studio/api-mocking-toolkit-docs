---
id: core-features
title: コア機能
sidebar_position: 2
---

コア機能の詳細解説。

---

## エディターウィンドウのレイアウト

開く：`Window > CodeCarnage > API Mocking Toolkit`

**3 つのタブ：** Endpoints（コレクション/フォルダー/エディター）、Sessions（録画/リプレイ）、Environments（セレクター/変数/インポート/エクスポート）

**左ペイン：** コレクションピッカー、フォルダーツリー、エンドポイント一覧、**+ Endpoint** ボタン。
**右ペイン：** Mock（Success/Error サブタブ、Body/Headers 付き）と Response（ライブビューアー、キャプチャボタン）。
**リクエストパネル：** メソッド、URL、Headers/Body、Send ボタン。変数ヒントチップが利用可能な `{{variable}}` を表示。
**ツールバー：** 有効、オフラインモード、コレクションドロップダウン、インポート/エクスポート（OpenAPI 3.0 + `x-amt-*`）。

---

## レスポンスストラテジー

各コールで返すレスポンスを制御：
- **Sequential** – 順番に再生；`LoopResponses` フラグによりループ
- **RoundRobin** – 永久にサイクル
- **Random** – 一様ランダム

### ショップページネーションの例

エンドポイント：`GET /api/shop/items` は 30 アイテムを 1 ページ 10 件で返す。

設定：エンドポイント `GET /api/shop/items` に 3 つのレスポンスを作成：

**レスポンス 1（ページ 1）：**
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

**レスポンス 2（ページ 2）：**
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

**レスポンス 3（ページ 3）：**
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

レスポンスストラテジーを **Sequential** に設定。コード例：

```csharp
// ゲームコード
for (int page = 1; page <= 5; page++)
{
    var response = await ApiClient.Get("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"Page {page}: {data.items.Length} items");
}

// 出力（LoopResponses = true の場合）：
// Page 1: 10 items（レスポンス 1）
// Page 2: 10 items（レスポンス 2）
// Page 3: 10 items（レスポンス 3）
// Page 4: 10 items（レスポンス 1 - ループ！）
// Page 5: 10 items（レスポンス 2）
```

バックエンドの協力なしにページネーションをテスト。

**ストラテジー：**
- Sequential: 1 → 2 → 3 → （ループまたは停止）
- RoundRobin: 1 → 2 → 3 → 1 → 2 → 3（常にサイクル）
- Random: 2 → 1 → 3 → 2 → 2 → 1

「主に成功、時々エラー」の混合には、`Responses[]` と `ErrorResponses[]` 両方に `Random` ストラテジーを使用。

---

## オフラインモードとエンドポイントごとのモックトグル

グローバルの **オフラインモード**（`ApiGlobalConfig`）とエンドポイントごとの **Mock Enabled**（`UseMock`）トグルがルーティングを制御。

**ルーティング順序：**
1. `ApiGlobalConfig.Enabled` が OFF → 実際のバックエンド（Toolkit バイパス）
2. `OfflineMode` が ON → すべてモック（エンドポイントが一致しない場合は失敗）
3. `OfflineMode` が OFF + エンドポイント一致 + `UseMock` が ON → モック
4. それ以外 → 実際のネットワーク

エンドポイントごとのトグルにより、エンドポイントの設定を保持しながら実際のバックエンドにルーティングできます — ライブレスポンスのキャプチャや A/B テストに便利。

**オフラインモードの有効化：**
```text
Window > CodeCarnage > API Mocking Toolkit
"Offline Mode" トグルを ON にする
```

**ランタイムでの読み取り：**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

バックエンドなしの開発、不安定なネットワークなしのテスト、カンファレンスデモに活用。

---

## 環境と変数

コード変更なしに異なるバックエンドを管理。

環境を作成：Development、Staging、Production。各環境に固有の `baseUrl` と変数を持つ。

**URL とボディでの変数補間：**
```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**スコープ優先度（高→低）：**
1. エンドポイント固有
2. 環境固有
3. グローバル

**ランタイムでの切り替え：**
```csharp
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

未解決の変数は `MissingEnvironmentVariableException` をスロー。ハードコードされた URL は不要。

### 本番ビルドの安全性

`BuildPreprocessor` がビルド前に実行。チェック内容：
1. `OfflineMode` が OFF であること
2. `BuildEnvironmentId` が登録済み環境を指していること
3. アクティブ環境がビルド環境と一致していること

**環境の管理：** `Window > CodeCarnage > API Mocking Toolkit > Manage Environments`
- **EDITOR：** Play Mode 用のアクティブ環境（自由に切り替え可）
- **BUILD：** ビルドにコンパイルされる環境（1 つのみ）

違反があると `BuildFailedException` でビルドが失敗。

**ベストプラクティス：** Development（Dev）、Staging（QA 向け）、Production（Build）。BUILD 環境のみリリース。

---

## コレクションとフォルダー

数百のエンドポイントを整理。

**コレクション：** エンドポイントグループを分離（ゲーム、API バージョン）。`ApiGlobalConfig.ActiveCollectionName` で一度に 1 つのみアクティブ。

作成：Project ウィンドウを右クリック → `Create > CodeCarnage > API Mocking Toolkit > Endpoint Collection`。

**フォルダー：** コレクション内でエンドポイントを整理（Authentication、Player Data、Leaderboard）。

ベストプラクティス：ゲーム/バージョン/テストスイートには **コレクション** を使用。機能/サービスには **フォルダー** を使用。

---

## セッション管理

Play Mode 中のすべての API リクエストを記録し、保存、後でリプレイ。

**録画：** `ApiGlobalConfig` で **Session Persistence** を有効化 → Play Mode → コールが自動記録 → 終了 → `Application.persistentDataPath/ApiMockingToolkitSessions/` に保存。

**REC バナー：** **Stop** をクリックすると Play Mode を終了せずにセッションを早期終了（長いセッションの分割に便利）。非アクティブ時はバナーが自動非表示。

**リプレイ：** Sessions タブ → セッションを選択 → Load Session → リクエスト/レスポンスを確認。

バグの再現、パフォーマンスのボトルネック分析、チーム共有に活用。エディター専用（ビルドにはコンパイルされない）。最大 1,000 セッションを保持；古いものは自動削除。

**ユースケース：** 長くて複雑なバグ、失敗シナリオの特定、パフォーマンス分析。

---

## OpenAPI 統合

**インポート：** Toolkit → Import → `.json` または `.yaml` を選択 → エンドポイントが自動作成

OpenAPI の例：
```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Success
```

結果：URL、メソッド、200 レスポンスでエンドポイントが作成される。

**変数の変換：** OpenAPI の `{variable}` → Toolkit の `{{variable}}`

**エクスポート：** エンドポイントを設定 → Export → `.json` を保存 → バックエンドに送信

ラウンドトリップ安全：Export → Import → Export = 同じファイル。Toolkit 固有データ（フォルダー、ストラテジー、レイテンシ、複数レスポンス）は `x-amt-*` 拡張で保持。バックエンドツールは拡張を無視し、標準 OpenAPI 3.0 を使用。

---

## エラーシミュレーション

実際のバックエンドを壊さずにエラーとレイテンシ処理をテスト。

エンドポイントを追加 → エラーレスポンス（4xx/5xx）を追加 → レスポンスにレイテンシ（ms）を設定：

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

`ErrorResponses[]` に `Random` ストラテジーを使うと時折失敗、`Sequential` では決定論的：
```text
Responses[]:        成功 200（レイテンシ 100 ms）
ErrorResponses[]:   エラー 500（レイテンシ 1500 ms）
                    エラー 404（レイテンシ 100 ms）
```

**レイテンシのユースケース：** ローディングバーの視認性、遅いが成功する UX、劣悪なネットワーク状況（モバイル、Wi-Fi 切断）。

コードでの処理：
```csharp
var response = await ApiClient.Get("/api/data");
if (!response.Success) {
    switch (response.StatusCode) {
        case 401: ShowLoginScreen(); break;
        case 429: ShowRateLimitMessage(); break;
        case 500: ShowErrorDialog("Server error"); break;
    }
}
```

---

## ライブ API レスポンスのキャプチャ

実際の API とモック開発を橋渡し。

**設定：** 実際の URL でエンドポイントを設定 → オフラインモードを OFF → "Send" をクリック。

**キャプチャ：** レスポンス受信後、"Save Body as Success Mock" または "Save Body as Error Mock"（Body タブ）/ "Save Headers as..."（Headers タブ）をクリック。

**メニューオプション：**
- 新しいレスポンスとして追加
- すべてのレスポンスを置換
- 名前で特定のレスポンスを置換

**カスタマイズ：** レスポンス名、ステータスコード、レイテンシ（ms）、ボディ、ヘッダー。キャプチャから自動入力。Confirm をクリック。

Toolkit が自動で `UseMock` を ON に設定し、オフラインで使用可能に。

**例：**
```csharp
// 設定：https://api.mygame.com/leaderboard/global、オフラインモード OFF
var response = await ApiClient.Get("https://api.mygame.com/leaderboard/global");

// エディターで："Save Body as Success Mock" をクリック → 名前："Production Leaderboard"
// オフラインモードを ON → キャッシュされたレスポンスを使用、ネットワークコールなし
var cachedResponse = await ApiClient.Get("https://api.mygame.com/leaderboard/global");
```

**ユースケース：** ステージングデータのオフラインテスト、本番バグの再現、エラーライブラリの構築、パフォーマンステスト、チーム共有。

**変数サポート：** キャプチャされたレスポンスを編集して、ハードコードされた値の代わりに `{{baseUrl}}`、`{{apiKey}}` を使用。モックを変更せずに環境を切り替え。変数スコープ：エンドポイント固有（最高）→ 環境 → グローバル。

**防止策：** 破壊的な操作（すべて置換/特定の置換）には確認ダイアログを表示。

**ベストプラクティス：** レスポンスに説明的な名前を付ける（"User Profile - Premium Tier"）。エラーを意図的にキャプチャ（401、404、500）。レイテンシを使ってスピナー/タイムアウトをテスト。レスポンスストラテジーと組み合わせる。Git でコレクションをバージョン管理。
