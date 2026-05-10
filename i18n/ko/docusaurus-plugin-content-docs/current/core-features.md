---
id: core-features
title: 핵심 기능
sidebar_position: 2
---

핵심 기능 심층 분석.

---

## 에디터 창 레이아웃

열기: `Window > CodeCarnage > API Mocking Toolkit`

**세 가지 탭:** Endpoints (컬렉션/폴더/에디터), Sessions (녹화/재생), Environments (선택기/변수/가져오기/내보내기)

**왼쪽 패널:** 컬렉션 선택기, 폴더 트리, 엔드포인트 목록, **+ Endpoint** 버튼.
**오른쪽 패널:** Mock (Success/Error 하위 탭, Body/Headers 포함) 및 Response (실시간 뷰어, 캡처 버튼).
**요청 패널:** 메서드, URL, Headers/Body, Send 버튼. 변수 힌트 칩에 사용 가능한 `{{variable}}`s 표시.
**툴바:** Enabled, Offline Mode, 컬렉션 드롭다운, Import/Export (OpenAPI 3.0 + `x-amt-*`).

---

## 응답 전략

각 호출마다 반환할 응답을 제어:
- **Sequential** – 순서대로 재생; `LoopResponses` 플래그에 따라 반복
- **RoundRobin** – 영구 순환
- **Random** – 균일 무작위

### 상점 페이지네이션 예제

엔드포인트: `GET /api/shop/items`는 10개씩 총 30개 아이템 반환.

설정: `GET /api/shop/items` 엔드포인트를 3개의 응답과 함께 생성:

**응답 1 (1페이지):**
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

**응답 2 (2페이지):**
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

**응답 3 (3페이지):**
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

응답 전략을 **Sequential**로 설정. 코드:

```csharp
// 게임 코드
for (int page = 1; page <= 5; page++)
{
    var response = await ApiClient.Get("/api/shop/items");
    var data = JsonUtility.FromJson<ShopData>(response.Body);

    Debug.Log($"Page {page}: {data.items.Length} items");
}

// 출력 (LoopResponses = true 시):
// Page 1: 10 items (응답 1)
// Page 2: 10 items (응답 2)
// Page 3: 10 items (응답 3)
// Page 4: 10 items (응답 1 - 반복!)
// Page 5: 10 items (응답 2)
```

백엔드 협업 없이 페이지네이션 테스트 완료.

**전략:**
- Sequential: 1 → 2 → 3 → (반복 또는 중지)
- RoundRobin: 1 → 2 → 3 → 1 → 2 → 3 (항상 순환)
- Random: 2 → 1 → 3 → 2 → 2 → 1

"주로 성공, 가끔 오류" 혼합은 `Responses[]`와 `ErrorResponses[]` 모두 사용하는 `Random` 전략으로.

---

## 오프라인 모드 및 엔드포인트별 모의 토글

전역 **오프라인 모드** (`ApiGlobalConfig`)와 엔드포인트별 **Mock Enabled** (`UseMock`) 토글이 라우팅을 제어합니다.

**라우팅 순서:**
1. `ApiGlobalConfig.Enabled` OFF → 실제 백엔드 (툴킷 우회)
2. `OfflineMode` ON → 모두 모의 처리 (또는 엔드포인트 미매칭 시 실패)
3. `OfflineMode` OFF + 매칭 엔드포인트 + `UseMock` ON → 모의 처리
4. 그 외 → 실제 네트워크

엔드포인트별 토글은 엔드포인트를 구성된 상태로 유지하면서 실제 백엔드로 라우팅할 수 있게 해줍니다 — 실시간 응답 캡처나 A/B 테스트에 유용합니다.

**오프라인 모드 활성화:**
```text
Window > CodeCarnage > API Mocking Toolkit
"Offline Mode" ON으로 전환
```

**런타임에서 읽기:**
```csharp
var config = Resources.Load<ApiGlobalConfig>("ApiGlobalConfig");
bool offline = config.OfflineMode;
```

백엔드 없는 개발, 불안정한 네트워크 없는 테스트, 컨퍼런스 데모에 사용.

---

## 환경 및 변수

코드 변경 없이 다른 백엔드를 관리합니다.

환경 생성: Development, Staging, Production. 각각 고유한 `baseUrl`과 변수 보유.

**URL 및 바디의 변수 보간:**
```text
{{baseUrl}}/users/{{userId}}?key={{apiKey}}
```

**범위 우선순위 (높음에서 낮음):**
1. 엔드포인트별
2. 환경별
3. 전역

**런타임에서 전환:**
```csharp
EnvironmentManager.Instance.ActiveEnvironment = devEnvironment;
var response = await ApiClient.Get("{{baseUrl}}/users/{{userId}}?key={{apiKey}}");
```

미해석 변수는 `MissingEnvironmentVariableException` 발생. 하드코딩된 URL 없음.

### 프로덕션 빌드 안전성

`BuildPreprocessor`가 빌드 전에 실행. 확인 사항:
1. `OfflineMode`가 OFF이어야 함
2. `BuildEnvironmentId`가 등록된 환경을 가리켜야 함
3. 활성 환경이 빌드 환경과 일치해야 함

**환경 관리:** `Window > CodeCarnage > API Mocking Toolkit > Manage Environments`
- **EDITOR:** Play Mode용 활성 환경 (자유롭게 전환 가능)
- **BUILD:** 빌드에 컴파일되는 환경 (하나만)

위반 시 `BuildFailedException`으로 빌드 실패.

**모범 사례:** Development (개발), Staging (QA 선택), Production (빌드). BUILD 환경만 배포.

---

## 컬렉션 및 폴더

수백 개의 엔드포인트를 체계적으로 관리합니다.

**컬렉션:** 별도의 엔드포인트 그룹 (게임, API 버전). `ApiGlobalConfig.ActiveCollectionName`을 통해 한 번에 하나 활성화.

생성: Project 창 우클릭 → `Create > CodeCarnage > API Mocking Toolkit > Endpoint Collection`.

**폴더:** 컬렉션 내 엔드포인트 정리 (Authentication, Player Data, Leaderboard).

모범 사례: **컬렉션**은 게임/버전/테스트 스위트에. **폴더**는 기능/서비스에.

---

## 세션 관리

Play Mode 중 모든 API 요청을 기록하고, 저장하고, 나중에 재생합니다.

**녹화:** `ApiGlobalConfig`에서 **Session Persistence** 활성화 → Play Mode → 호출 자동 기록 → 종료 → `Application.persistentDataPath/ApiMockingToolkitSessions/`에 저장.

**REC 배너:** **Stop** 클릭으로 Play Mode를 나가지 않고 세션 조기 종료 (긴 세션 분할에 유용). 비활성 시 배너 자동 숨김.

**재생:** Sessions 탭 → 세션 선택 → Load Session → 요청/응답 검토.

버그 재현, 성능 병목 분석, 팀 공유에 사용. Editor 전용 (빌드에 컴파일되지 않음). 최대 1,000개 세션 유지; 오래된 것은 자동 삭제.

**사용 사례:** 길고 복잡한 버그; 정확한 실패 시나리오; 성능 분석.

---

## OpenAPI 연동

**가져오기:** 툴킷 → Import → `.json` 또는 `.yaml` 선택 → 엔드포인트 자동 생성

OpenAPI 예시:
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

결과: URL, 메서드, 200 응답을 가진 엔드포인트 생성.

**변수 변환:** OpenAPI `{variable}` → 툴킷 `{{variable}}`

**내보내기:** 엔드포인트 구성 → Export → `.json` 저장 → 백엔드로 전송

왕복 안전: Export → Import → Export = 동일 파일. 툴킷 전용 데이터 (폴더, 전략, 지연, 다중 응답)는 `x-amt-*` 확장을 통해 보존. 백엔드 도구는 확장을 무시하고 표준 OpenAPI 3.0 사용.

---

## 오류 시뮬레이션

실제 백엔드를 건드리지 않고 오류와 지연 처리를 테스트합니다.

엔드포인트 추가 → 오류 응답 추가 (4xx/5xx) → 응답에 지연 설정 (ms):

```json
{
  "status": 500,
  "error": "Internal Server Error"
}
```

가끔 실패에는 `Random` 전략으로 `ErrorResponses[]` 사용, 결정론적 테스트에는 `Sequential`:
```text
Responses[]:        Success 200 (지연 100 ms)
ErrorResponses[]:   Error   500 (지연 1500 ms)
                    Error   404 (지연 100 ms)
```

**지연 사용 사례:** 로딩 바 가시성, 느리지만 성공하는 UX, 불량 네트워크 조건 (모바일, Wi-Fi 끊김).

코드에서 처리:
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

## 실시간 API 응답 캡처

실제 API와 모의 개발 사이를 연결합니다.

**설정:** 실제 URL로 엔드포인트 구성 → 오프라인 모드 OFF → "Send" 클릭.

**캡처:** 응답 수신 후 "Save Body as Success Mock" 또는 "Save Body as Error Mock" 클릭 (Body 탭) / "Save Headers as..." (Headers 탭).

**메뉴 옵션:**
- 새 응답으로 추가
- 모든 응답 교체
- 이름으로 특정 응답 교체

**커스터마이즈:** 응답 이름, 상태 코드, 지연 (ms), 바디, 헤더. 캡처에서 모두 미리 채워짐. Confirm 클릭.

툴킷이 자동으로 `UseMock` ON 설정, 오프라인 사용 준비 완료.

**예시:**
```csharp
// 구성: https://api.mygame.com/leaderboard/global, 오프라인 모드 OFF
var response = await ApiClient.Get("https://api.mygame.com/leaderboard/global");

// 에디터에서: "Save Body as Success Mock" 클릭 → 이름: "Production Leaderboard"
// 오프라인 모드 ON → 이제 캐시된 응답 사용, 네트워크 호출 없음
var cachedResponse = await ApiClient.Get("https://api.mygame.com/leaderboard/global");
```

**사용 사례:** 스테이징 데이터 오프라인 테스트, 프로덕션 버그 재현, 오류 라이브러리 구축, 성능 테스트, 팀 공유.

**변수 지원:** 캡처된 응답을 편집하여 하드코딩된 값 대신 `{{baseUrl}}`, `{{apiKey}}` 사용. 모의 수정 없이 환경 전환. 변수 범위: 엔드포인트별 (최우선) → 환경 → 전역.

**보호 장치:** 파괴적인 작업 (Replace All/Replace Specific)에 대한 확인 대화상자.

**모범 사례:** 응답을 설명적으로 명명 ("User Profile - Premium Tier"). 의도적으로 오류 캡처 (401, 404, 500). 지연으로 스피너/타임아웃 테스트. 응답 전략과 결합. Git으로 컬렉션 버전 관리.
