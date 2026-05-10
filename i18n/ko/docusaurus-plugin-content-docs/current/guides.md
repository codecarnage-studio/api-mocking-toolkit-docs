---
id: guides
title: 가이드
sidebar_position: 2
---

워크플로우 및 실제 사용 사례.

---

## 개발 워크플로우

백엔드를 기다리지 않고 구축합니다.

### 백엔드 API 미준비 상태

백엔드 팀과 계약 정의:

```json
// POST /api/login
Request:
{
  "username": "string",
  "password": "string"
}

Response (Success):
{
  "token": "string",
  "userId": "number",
  "username": "string"
}

Response (Error):
{
  "error": "Invalid credentials"
}
```

툴킷에서 모의 엔드포인트 생성:
- 엔드포인트: `POST /api/login`
- Success (200): `{"token": "mock-jwt-token-12345", "userId": 1001, "username": "testuser"}`
- Error (401): `{"error": "Invalid credentials"}`
- 응답 혼합에는 `Random` 전략, 또는 `Sequential` (1번째 성공 → 2번째 오류 → 반복) 사용

UI 구축:

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

백엔드 준비 완료 시 오프라인 모드 OFF로 전환. 코드는 그대로 작동. 프로덕션 빌드에서는 오프라인 모드 비활성화 필수; `BuildPreprocessor`가 이를 강제. Editor 전용 타입 (`ApiInterceptor`, `SessionManager`)은 `#if UNITY_EDITOR`로 래핑되어 빌드에 포함되지 않음.

---

## 테스트 및 QA

백엔드 협업 없이 재현 가능한 테스트 시나리오 생성.

### 오류 처리

엔드포인트 설정:
```
엔드포인트: GET /api/player/inventory
전략: Random
Responses[]:        Success 200
ErrorResponses[]:   Status 408 (타임아웃, 지연 5000 ms)
                    Status 500 (서버 오류)
                    Status 401 (인증 오류)
```

`SimulateError` ON/OFF로 `Responses[]`와 `ErrorResponses[]` 사이 전환.

자동화 테스트 실행:

```csharp
[UnityTest]
public IEnumerator TestInventoryErrorHandling()
{
    // 실행 전 툴킷 창에서 오프라인 모드 활성화
    // (Window > CodeCarnage > API Mocking Toolkit > Offline Mode)

    // API를 여러 번 호출
    for (int i = 0; i < 20; i++) {
        var response = await ApiClient.Get("/api/player/inventory");
        
        // 오류 처리 작동 확인
        if (!response.Success) {
            Assert.IsTrue(errorDialogShown, "Error dialog should be shown");
        }
    }
}
```

QA 테스트 사례: 오프라인 모드 활성화 → 컬렉션 선택 → 시나리오 트리거 → 오류 처리 검증.

### 엣지 케이스

빈 응답 테스트:

```json
// 빈 인벤토리
[]

// Null 데이터
null

// 누락된 필드
{
  "items": null
}
```

**대용량 응답 테스트:**

```json
// 인벤토리에 1000개 아이템
[
  {"id": 1, "name": "Item 1"},
  {"id": 2, "name": "Item 2"},
  ...
  {"id": 1000, "name": "Item 1000"}
]
```

**특수 문자 테스트:**

```json
{
  "username": "test<script>alert('xss')</script>",
  "message": "Line 1\nLine 2\tTabbed"
}
```

각 호출마다 엣지 케이스를 순환하려면 `Sequential` 전략 사용.

---

## API 프로토타이핑

백엔드 구현 전에 설계합니다.

### 친구 시스템

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

UI 구축, 응답 스키마 반복, Export → 백엔드로 전송. 백엔드가 스펙에 맞게 구현. `x-amt-*` 확장으로 툴킷 전용 세부 사항을 보존하는 OpenAPI 왕복 안전.

---

## 세션으로 디버깅

타임트래블 디버깅을 위한 세션 재생.

### 버그 재현

`ApiGlobalConfig`에서 Session Persistence 활성화. 테스터 플레이 중 크래시 발생, Play Mode 종료 시 세션 자동 저장. REC 배너의 **Stop**을 눌러 세션 중간 캡처.

툴킷 → Sessions 탭에서 세션 로드. 정확한 요청 순서 분석:

```
1. GET /api/shop/items - Success
2. POST /api/shop/buy - Item 1 - Success
3. GET /api/player/inventory - Success
4. POST /api/shop/buy - Item 2 - Success
5. GET /api/player/inventory - Success
6. POST /api/shop/buy - Item 3 - Error 500
7. GET /api/player/inventory - [CRASH]
```

구매 실패 후 인벤토리 조회를 처리하지 못함. 수정 후 동일 세션 다시 로드하여 검증.

느린 구간을 플레이하고 세션 로드. API 지연 검토:

```
GET /api/player/profile     | 120ms   | 200
GET /api/player/inventory   | 2400ms  | 200  ← 느림
GET /api/player/friends     | 95ms    | 200
GET /api/shop/items         | 150ms   | 200
```

백엔드와 협력하여 느린 엔드포인트 최적화.

---

## 팀 협업

### 버전 관리

컬렉션은 기본적으로 `Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/` 아래에 위치 (`Resources.Load`로 로드). Git에 커밋:

```bash
git add Assets/CodeCarnage/ApiMockingToolkit/Editor/Resources/ApiEndpointCollection.asset
git commit -m "Add API mock configurations"
```

모든 개발자가 Pull → 동일한 엔드포인트.

### QA 워크플로우

QA 컬렉션 생성: `QA-Edge-Cases.asset`, `QA-Performance.asset`, `QA-Happy-Path.asset`. 툴킷에서 선택, 오프라인 모드 활성화, 테스트 실행.

### 백엔드 협업

엔드포인트 생성 → OpenAPI 스펙 내보내기 → 백엔드로 전송 → 스펙에 맞게 구현 → 오프라인 모드 OFF → 실제 백엔드로 테스트.

---

## 데모 씬 확장

데모는 "Get Users" / "Get Posts" 버튼을 보여줌:

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/users");
    rightText.text = FormatResponse(response);
}
```

### 새 버튼 추가

엔드포인트 추가 → `GET https://jsonplaceholder.typicode.com/comments` → "Get Posts" 버튼 복제 → 핸들러 추가:

```csharp
public async void OnGetCommentsClicked()
{
    var response = await ApiClient.Get("https://jsonplaceholder.typicode.com/comments");
    UpdateUI(response);
}
```

버튼 OnClick에 핸들러 연결.

### 응답 전략으로 페이지네이션

`GET /posts`에 3개 응답 추가 (1페이지, 2페이지, 3페이지). 응답 전략을 **Sequential**로 설정. 각 클릭마다 다음 페이지 반환, 4번째 클릭에서 반복.

### 오류 시뮬레이션

오류 응답 추가 (500). **Error Response Strategy**를 `Sequential` 또는 `Random`으로 설정. **Simulate Error** ON/OFF로 성공과 오류 경로 전환. 코드에서 처리:

```csharp
if (!response.Success) {
    rightText.text = $"ERROR: {response.StatusCode}";
    return;
}
```

---

**다음:** [API 레퍼런스](api-reference.md) - 코드 치트 시트
