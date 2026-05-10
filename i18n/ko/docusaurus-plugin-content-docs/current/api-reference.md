---
id: api-reference
title: API 레퍼런스
sidebar_position: 3
---

코드 레퍼런스 및 예제.

---

## 목차

- [빠른 레퍼런스](#quick-reference)
- [ApiClient](#apiclient)
- [ApiGlobalConfig](#apiglobalconfig)
- [ApiEndpoint](#apiendpoint)
- [EnvironmentManager](#environmentmanager)
- [SessionManager](#sessionmanager)
- [구성](#configuration)
- [문제 해결](#troubleshooting)

---

## 빠른 레퍼런스

### API 호출 수행

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

모든 메서드는 선택적 `headers`와 `CancellationToken`을 허용:

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

### 응답 처리

```csharp
if (response.Success) {
    // 성공 - Status 200-299
    var data = JsonUtility.FromJson<MyData>(response.Body);
    Debug.Log($"Data: {data}");
} else {
    // 오류 - Status >= 400 (또는 전송 실패)
    Debug.LogError($"Error {response.StatusCode}: {response.Body}");
}
```

### 오프라인 모드

`OfflineMode`는 `ApiGlobalConfig` ScriptableObject의 직렬화된 필드입니다.
API Mocking Toolkit 창 또는 Inspector에서 전환:

```csharp
// 런타임에서 현재 상태 읽기
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.OfflineMode) {
    Debug.Log("Running in offline mode");
}
```

> 런타임 API는 읽기 전용입니다. 코드에서 값을 변경하려면 (Editor 전용)
> 에셋에서 `SerializedObject` / `EditorUtility.SetDirty`를 사용하세요; 프로퍼티에
> 직접 할당하지 마세요.

### 환경

```csharp
// 환경 매니저 가져오기
var envManager = EnvironmentManager.Instance;

// 활성 환경 전환
envManager.ActiveEnvironment = devEnvironment;

// 변수 해석 (활성 환경 우선, 그 다음 전역)
string baseUrl = envManager.ResolveVariable("baseUrl");
```

### 세션

```csharp
// 세션 지속성은 ApiGlobalConfig로 제어 (Editor UI를 통해 설정)
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool persistenceOn = config.EnableSessionPersistence;

// 세션 매니저 접근 (Editor 전용)
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
var session = sessionManager.CurrentSession;
sessionManager.EndCurrentSession();
#endif
```

---

## ApiClient

정적 진입점. Editor: `ApiInterceptor`가 요청을 라우팅. 빌드: 실제 백엔드로 `UnityWebRequest`.

### 메서드

#### Get / Post / Put / Patch / Delete

```csharp
public static Task<ApiResponse> Get(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Post(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Put(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Patch(string url, string body, Dictionary<string, string> headers = null, CancellationToken ct = default)
public static Task<ApiResponse> Delete(string url, Dictionary<string, string> headers = null, CancellationToken ct = default)
```

```csharp
// 예시
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

**사용 예시:**
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

> 모의 응답에서 시뮬레이션된 지연은 인터셉터 내부에서 `await Task.Delay`로 적용됩니다
> — 응답 객체의 필드가 아닙니다.

---

## ApiGlobalConfig

`Resources/ApiGlobalConfig`의 ScriptableObject. 런타임에서 읽기 전용. 툴킷 창 또는 Inspector에서 편집.

```csharp
bool OfflineMode { get; }            // 미구성도 포함 모두 모의 처리
bool Enabled { get; }                // 마스터 스위치
bool EnableSessionPersistence { get; } // 세션을 디스크에 저장
string ActiveCollectionName { get; set; } // 활성 컬렉션
```

**런타임에서 읽기:**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
if (config.Enabled && config.OfflineMode) Debug.Log("Toolkit active, offline mode");
```

**Editor 스크립트에서 편집:**
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

`ApiEndpointCollection`의 직렬화 가능한 엔드포인트 모델. 툴킷 창을 통해 편집; 게임 코드에서 직접 생성하는 경우는 드뭄.

```csharp
string Id { get; set; }              // 안정적인 GUID (URL/메서드 편집 후에도 유지)
string Name { get; set; }            // 친숙한 이름
string Url { get; set; }             // URL 또는 템플릿 ({{baseUrl}}/users)
string Method { get; set; }          // GET, POST, PUT, PATCH, DELETE, HEAD
MatchType MatchType { get; set; }    // Exact | Contains

bool UseMock { get; set; }           // 엔드포인트별 토글
bool SimulateError { get; set; }     // false → Responses[]; true → ErrorResponses[]

string Headers { get; set; }         // 줄당 "Key: Value" 형식의 원시 헤더
string RequestBody { get; set; }     // POST/PUT/PATCH용 JSON 바디

List<MockFlowNode> Responses { get; }       // 성공 응답
List<MockFlowNode> ErrorResponses { get; }  // 오류 응답

ResponseStrategy ResponseStrategy { get; set; }
bool LoopResponses { get; set; }
int CurrentResponseIndex { get; set; }      // Sequential/RoundRobin 커서

ResponseStrategy ErrorResponseStrategy { get; set; }
bool ErrorLoopResponses { get; set; }
int CurrentErrorResponseIndex { get; set; } // 오류 커서
```

**라우팅:** `Enabled` OFF → 실제. `OfflineMode` ON → 모두 모의. `UseMock` ON → 모의. 그 외 → 실제.
`SimulateError`로 전략에 따라 `Responses[]`와 `ErrorResponses[]` 사이 선택.

### 예시

```csharp
#if UNITY_EDITOR
var collection = Resources.Load<ApiEndpointCollection>("ApiEndpointCollection");
var ep = collection.Endpoints.First(e => e.Name == "Get Profile");

ep.UseMock = true;                     // 이 엔드포인트를 모의로 라우팅
ep.SimulateError = false;              // Responses[]에서 제공
ep.ResponseStrategy = ResponseStrategy.Sequential;
ep.LoopResponses = true;

UnityEditor.EditorUtility.SetDirty(collection);
UnityEditor.AssetDatabase.SaveAssets();
#endif
```

> `Id`는 URL/메서드 편집 및 OpenAPI
> 가져오기/내보내기 왕복 전반에 걸쳐 보존됩니다 (내보낸 스펙에 `x-amt-id`로 저장). ID를
> 직접 생성하지 마세요; 툴킷이 할당하도록 하세요.

---

## EnvironmentManager

영구 싱글톤. 환경과 전역 변수를 `Application.persistentDataPath/ApiMockingToolkit/Environments/`에 저장.

**프로퍼티:**
```csharp
IReadOnlyList<ApiEnvironment> Environments { get; }
ApiEnvironment ActiveEnvironment { get; set; }      // 등록되지 않은 경우 무시
string BuildEnvironmentId { get; set; }             // 빌드에 컴파일되는 환경
ApiEnvironment BuildEnvironment { get; }
IReadOnlyDictionary<string, string> GlobalVariables { get; }
```

**메서드:**
```csharp
void AddEnvironment(ApiEnvironment env);
bool RemoveEnvironment(ApiEnvironment env);        // null이거나 하나만 남은 경우 false
void SetGlobalVariable(string key, string value);
bool RemoveGlobalVariable(string key);
string ResolveVariable(string key);                // 활성 환경 우선, 그 다음 전역
ApiRequest InterpolateRequest(ApiRequest req);     // 엄격; 미해석 시 예외 발생
void SaveEnvironments();
```

**ApiEnvironment:**
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

**예시:**
```csharp
var envManager = EnvironmentManager.Instance;
var devEnv = new ApiEnvironment("Development", "http://localhost:3000");
devEnv.SetVariable("apiKey", "dev-key-123");
envManager.AddEnvironment(devEnv);
envManager.ActiveEnvironment = devEnv;
string url = envManager.ResolveVariable("baseUrl") + "/api/data";
```

**빌드 강제:** `BuildPreprocessor`가 `OfflineMode` OFF, `BuildEnvironmentId` 등록 여부, 활성 환경이 빌드 환경과 일치하는지 확인. Play Mode에는 제한 없음. 위반 시 `BuildFailedException`으로 빌드 실패.

---

## SessionManager

Editor 전용. 세션을 `Application.persistentDataPath/ApiMockingToolkitSessions/`에 저장.

**프로퍼티:**
```csharp
Session CurrentSession { get; }
static event Action OnSessionChanged;   // 시작/종료/삭제 시 발생
```

**메서드:**
```csharp
void StartNewSession();
void EndCurrentSession();               // 디스크에도 저장
void AddLogToCurrentSession(LogEntry log);
void SaveSession(Session session);
List<Session> LoadAllSessions();
Session LoadSession(string sessionId);  // 파일 경로가 아닌 ID로
void DeleteSession(string sessionId);
void DeleteAllSessions();
int GetSavedSessionCount();
string GetSessionFolderPath();
```

**예시:**
```csharp
#if UNITY_EDITOR
var sessionManager = SessionManager.Instance;
sessionManager.StartNewSession();
// ... 플레이, API 호출 ...
sessionManager.EndCurrentSession();   // 자동 저장
var session = sessionManager.LoadSession("a1b2c3d4-...");
Debug.Log($"Session: {session.TotalRequests} requests, {session.GetDurationSeconds()}s duration");
#endif
```

`EnableSessionPersistence`로 제어. 디스크에 최대 1,000개 세션; 오래된 것은 자동 삭제.

---

## 구성

**ResponseStrategy:**
```csharp
Sequential   // 1 → 2 → 3 → 1 (LoopResponses 시 반복)
RoundRobin   // 영구 순환
Random       // 호출당 균일 무작위
```

**MatchType:**
```csharp
Exact       // request.url == endpoint.url
Contains    // request.url.Contains(endpoint.url)
```

**HTTP 메서드 (Constants.HttpMethods):**
```csharp
Get    // "GET"
Post   // "POST"
Put    // "PUT"
Patch  // "PATCH"
Delete // "DELETE"
Head   // "HEAD"
```

게임 코드는 `ApiClient` 메서드를 직접 호출; 메서드 문자열 지정 불필요.

---

## 문제 해결

**엔드포인트 매칭 안 됨:** `Enabled` 여부? 오프라인 모드 설정? URL 일치 (대소문자 구분)? MatchType (Exact vs Contains)? 올바른 컬렉션? HTTP 메서드 일치? `UseMock` ON (오프라인 모드 OFF 시)?

**변수가 교체되지 않음:** 활성 환경/전역에 존재? 문법 `{{variableName}}`? 오타? 활성 환경 설정? 사용 가능한 변수와 함께 `MissingEnvironmentVariableException` 발생.

**세션이 저장되지 않음:** `EnableSessionPersistence` true? Editor에서 실행 중 (세션은 Editor 전용)? `EndCurrentSession()` 호출 또는 Play Mode 종료? Console에서 `[SessionManager]` 오류 확인.

**데모 씬 오작동:** Package Manager에서 Samples 다시 가져오기. "Demo Scene Collection" 선택. Console 확인.

**빌드 오류:** `OfflineMode` ON (비활성화). 빌드 환경 미설정 또는 활성 환경 불일치. `async/await`를 위한 스크립팅 백엔드/API 호환성 수준 확인.

**성능:** 응답 바디 크기 제한. 지연 줄이기. 불필요 시 세션 지속성 비활성화.
