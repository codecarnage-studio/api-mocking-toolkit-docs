---
id: api-reference
title: API リファレンス
sidebar_position: 3
---

コードリファレンスと例。

---

## 目次

- [クイックリファレンス](#quick-reference)
- [ApiClient](#apiclient)
- [ApiGlobalConfig](#apiglobalconfig)
- [ApiEndpoint](#apiendpoint)
- [EnvironmentManager](#environmentmanager)
- [SessionManager](#sessionmanager)
- [設定](#configuration)
- [トラブルシューティング](#troubleshooting)

---

## クイックリファレンス

### API コールの作成

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

すべてのメソッドはオプションで `headers` と `CancellationToken` を受け取る：

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

### レスポンスの処理

```csharp
if (response.Success) {
    // 成功 - ステータス 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"Data: {data}");
} else {
    // エラー - ステータス >= 400（またはトランスポート障害）
    Debug.LogError($"Error {response.StatusCode}: {response.Body}");
}
```

### オフラインモード

`OfflineMode` は `ApiGlobalConfig` ScriptableObject のシリアライズドフィールドです。
API Mocking Toolkit ウィンドウまたは Inspector からトグルできます：

```csharp
// ランタイムで現在の状態を読み取る
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.OfflineMode) {
    Debug.Log("Running in offline mode");
}
```

> ランタイム API は読み取り専用です。コードから値を変更するには（エディター専用）、
> アセットに対して `SerializedObject` / `EditorUtility.SetDirty` を使用します；
> プロパティに直接代入しないでください。

### 環境

```csharp
// 環境マネージャーを取得
var envManager = EnvironmentManager.Instance;

// アクティブ環境を切り替え
envManager.ActiveEnvironment = devEnvironment;

// 変数を解決（アクティブ環境を優先、次にグローバル）
string baseUrl = envManager.ResolveVariable("baseUrl");
```

### セッション

```csharp
// セッションの永続化は ApiGlobalConfig で制御（エディター UI 経由で設定）
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool persistenceOn = config.EnableSessionPersistence;

// セッションマネージャーにアクセス（エディター専用）
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
var session = sessionManager.CurrentSession;
sessionManager.EndCurrentSession();
#endif
```

---

## ApiClient

静的エントリーポイント。エディター：`ApiInterceptor` がリクエストをルーティング。ビルド：`UnityWebRequest` で実際のバックエンドへ。

### メソッド

#### Get / Post / Put / Patch / Delete

```csharp
public static Task<ApiResponse> Get(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Post(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Put(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Patch(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Delete(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
```

```csharp
// 例
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
    public long Size { get; } // bytes
}
```

**使用例：**
```csharp
var response = await ApiClient.Get("/api/data");

Debug.Log($"Success: {response.Success}");
Debug.Log($"Status: {response.StatusCode}");
Debug.Log($"Body: {response.Body}");
Debug.Log($"Size: {response.Size} bytes");

if (response.Headers != null && response.Headers.TryGetValue("Content-Type", out var ct)) {
    Debug.Log($"Content-Type: {ct}");
}
```

> モックレスポンスでシミュレートされるレイテンシは、インターセプター内で
> `await Task.Delay` として適用されます — レスポンスオブジェクトのフィールドではありません。

---

## ApiGlobalConfig

`Resources/ApiGlobalConfig` からの ScriptableObject。ランタイムでは読み取り専用。Toolkit ウィンドウまたは Inspector から編集。

```csharp
bool OfflineMode { get; }            // 未設定のものを含めすべてをモック
bool Enabled { get; }                // マスタースイッチ
bool EnableSessionPersistence { get; } // セッションをディスクに保存
string ActiveCollectionName { get; set; } // アクティブコレクション
```

**ランタイムでの読み取り：**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.Enabled && config.OfflineMode) Debug.Log("Toolkit active, offline mode");
```

**エディタースクリプトからの編集：**
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

`ApiEndpointCollection` 内のシリアライズ可能なエンドポイントモデル。Toolkit ウィンドウ経由で編集；ゲームコードで直接構築することはほぼない。

```csharp
string Id { get; set; }              // 安定した GUID（URL/メソッド編集後も保持）
string Name { get; set; }            // フレンドリーな名前
string Url { get; set; }             // URL またはテンプレート（{{baseUrl}}/users）
string Method { get; set; }          // GET, POST, PUT, PATCH, DELETE, HEAD
MatchType MatchType { get; set; }    // Exact | Contains

bool UseMock { get; set; }           // エンドポイントごとのトグル
bool SimulateError { get; set; }     // false → Responses[]; true → ErrorResponses[]

string Headers { get; set; }         // 生の "Key: Value" 1 行ずつ
string RequestBody { get; set; }     // POST/PUT/PATCH の JSON ボディ

List<MockFlowNode> Responses { get; }       // 成功レスポンス
List<MockFlowNode> ErrorResponses { get; }  // エラーレスポンス

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Sequential/RoundRobin カーソル

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // エラーカーソル
```

**ルーティング：** `Enabled` が OFF → 実際。`OfflineMode` が ON → すべてモック。`UseMock` が ON → モック。それ以外 → 実際。
`SimulateError` がストラテジーを通じて `Responses[]` と `ErrorResponses[]` を選択。

### 例

```csharp
#if UNITY_EDITOR
var collection = Resources.Load<ApiEndpointCollection>("ApiEndpointCollection");
var ep = collection.Endpoints.First(e => e.Name == "Get Profile");

ep.UseMock = true;                     // このエンドポイントをモックにルーティング
ep.SimulateError = false;              // Responses[] からサーブ
ep.ResponseStrategy = ResponseStrategy.Sequential;
ep.LoopResponses = true;

UnityEditor.EditorUtility.SetDirty(collection);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

> `Id` は URL/メソッドの編集後も、および OpenAPI インポート/エクスポートのラウンドトリップ後も
> 保持されます（エクスポートされた仕様に `x-amt-id` として格納）。
> ID を自分で生成しないでください；Toolkit に割り当てさせてください。

---

## EnvironmentManager

永続シングルトン。`Application.persistentDataPath/ApiMockingToolkit/Environments/` に環境とグローバルを保存。

**プロパティ：**
```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // 未登録の場合は無視
string BuildEnvironmentId { get; set; }             // ビルドにコンパイルされる環境
ApiEnvironment BuildEnvironment { get; }
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

**メソッド：**
```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);        // null または 1 つしかない場合は false
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);                // アクティブ環境を優先、次にグローバル
ApiRequest InterpolateRequest(ApiRequest req);     // 厳格；未解決の場合はスロー
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

**例：**
```csharp
var envManager = EnvironmentManager.Instance;
var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;
string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

**ビルド強制：** `BuildPreprocessor` が `OfflineMode` OFF、`BuildEnvironmentId` 登録済み、アクティブ環境がビルド環境と一致をチェック。Play Mode には制限なし。違反があると `BuildFailedException` でビルドが失敗。

---

## SessionManager

エディター専用。`Application.persistentDataPath/ApiMockingToolkitSessions/` にセッションを永続化。

**プロパティ：**
```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // 開始/終了/削除時に発火
```

**メソッド：**
```csharp
void StartNewSession();
void EndCurrentSession();               // ディスクにも保存
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);
List<Session> LoadAllSessions();
Session LoadSession(string sessionId);  // ファイルパスではなく ID で
void DeleteSession(string sessionId);
void DeleteAllSessions();
int GetSavedSessionCount();
string GetSessionFolderPath();
```

**例：**
```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
sessionManager.StartNewSession();
// ... プレイ、API コールを実行 ...
sessionManager.EndCurrentSession();   // 自動保存
var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"Session: {session.TotalRequests} requests, {session.GetDurationSeconds()}s duration");
#endif
```

`EnableSessionPersistence` でゲーティング。ディスク上の最大 1,000 セッション；古いものは自動削除。

---

## 設定

**ResponseStrategy：**
```csharp
Sequential   // 1 → 2 → 3 → 1（LoopResponses の場合はループ）
RoundRobin   // 均等にサイクル、永久
Random       // コールごとに一様ランダム
```

**MatchType：**
```csharp
Exact       // request.url == endpoint.url
Contains    // request.url.Contains(endpoint.url)
```

**HTTP メソッド（Constants.HttpMethods）：**
```csharp
Get    // "GET"
Post   // "POST"
Put    // "PUT"
Patch  // "PATCH"
Delete // "DELETE"
Head   // "HEAD"
```

ゲームコードは `ApiClient` メソッドを直接呼び出す；メソッド文字列の指定は不要。

---

## トラブルシューティング

**エンドポイントが一致しない：** `Enabled` になっているか？オフラインモードは設定されているか？URL が一致しているか（大文字・小文字を区別）？MatchType（Exact vs Contains）？正しいコレクションか？HTTP メソッドが一致しているか？`UseMock` が ON か（オフラインモードが OFF の場合）？

**変数が置換されない：** アクティブ環境/グローバルに存在するか？構文は `{{variableName}}` か？タイポはないか？アクティブ環境は設定されているか？利用可能な変数とともに `MissingEnvironmentVariableException` がスロー。

**セッションが保存されない：** `EnableSessionPersistence` が true か？エディターで実行しているか（セッションはエディター専用）？`EndCurrentSession()` が呼ばれたか、または Play Mode を終了したか？Console で `[SessionManager]` エラーを確認。

**デモシーンが壊れている：** Package Manager からサンプルを再インポート。"Demo Scene Collection" を選択。Console を確認。

**ビルドエラー：** `OfflineMode` が ON（無効化）。ビルド環境が未設定またはアクティブ環境の不一致。`async/await` のためのスクリプティングバックエンド/API 互換性レベル。

**パフォーマンス：** レスポンスボディサイズを制限。レイテンシを低減。不要な場合はセッション永続化を無効化。
