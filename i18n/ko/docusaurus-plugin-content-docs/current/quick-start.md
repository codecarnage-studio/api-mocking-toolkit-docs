---
id: quick-start
title: 빠른 시작
sidebar_position: 1
toc_max_heading_level: 3
---

백엔드 서비스를 기다리지 않고 Unity에서 게임의 API 호출을 개발하고 테스트하세요.

---

import VideoTimestamp from '@site/src/components/VideoTimestamp';
import CodeBlock from '@theme/CodeBlock';

## 동영상

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

## 문제점

백엔드가 지연되나요? 네트워크가 불안정한가요? 오프라인으로 작업하고 싶나요? 에러를 테스트해야 하나요?

- 백엔드가 준비되지 않음 → API 계약을 직접 정의하고 지금 바로 구축한 뒤, 나중에 실제 백엔드로 전환
- 에러 테스트 필요 → 성공/오류/타임아웃/잘못된 응답을 필요에 따라 구성
- 오프라인 개발 원함 → 네트워크 없이 게임 실행, VPN 불필요
- 페이지네이션 테스트 → 다양한 응답을 자동으로 순환

API 호출을 다음으로 라우팅:
- 실제 백엔드 (프로덕션, 스테이징)
- QA 서버
- 로컬호스트
- 모의 응답 (커스텀 상태 코드, 지연, 데이터)

![API Mocking Toolkit 라우팅](/img/diagram-amt-optimized.png)

---

## 설치

1. Unity Asset Store 열기
2. "API Mocking Toolkit" 검색 → `가져오기`
3. 모든 파일 가져오기

**요구사항:** Unity 2021.3 이상, 외부 의존성 없음

---

## 데모 씬

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. 데모 씬 열기</strong></td>
      <td><code>Assets &gt; CodeCarnage &gt; ApiMockingToolkit &gt; Samples &gt; DemoScene &gt; DemoScene.unity</code></td>
    </tr>
    <tr>
      <td><strong>2. Play 누르기</strong></td>
      <td>씬이 두 버튼과 함께 로드됨: <code>Get Users</code> 및 <code>Get Posts</code></td>
    </tr>
    <tr>
      <td><strong>3. "Get Users" 클릭</strong></td>
      <td>요청 전송 → 툴킷 가로채기 → 인터넷 없이 즉시 모의 데이터 반환</td>
    </tr>
    <tr>
      <td><strong>4. "Get Posts" 여러 번 클릭</strong></td>
      <td>1페이지 → 2페이지 → 3페이지 → 1페이지 순환 (응답 전략 동작)</td>
    </tr>
  </tbody>
</table>

---

## 동작 방식

`DemoController.cs` 열기:

```csharp
public async void OnGetUsersClicked()
{
    var response = await ApiClient.Get("{{baseUrl}}/users");
    DisplayResponse(response);
}
```

표준 API 호출. `{{baseUrl}}`은 활성 환경에 따라 해석됩니다. 툴킷이 매칭되는 URL을 가로채고 모의 데이터를 반환합니다. `if (testing)` 검사 없음. 동일한 코드가 모의 또는 실제 백엔드와 함께 작동합니다.

---

## 첫 번째 엔드포인트 만들기

JSONPlaceholder의 `/comments` 엔드포인트를 대용으로 사용해 게임의 API를 모킹하세요. 모의 데이터로 오프라인 작동, 또는 실제 API에 온라인 연결 모두 가능합니다.

<table className="steps-table">
  <tbody>
    <tr>
      <td><strong>1. 툴킷 창 열기</strong></td>
      <td><code>Window &gt; CodeCarnage &gt; API Mocking Toolkit</code></td>
    </tr>
    <tr>
      <td><strong>2. 엔드포인트 생성</strong></td>
      <td>
        "+ Endpoint" 클릭, 설정:
        <ul>
          <li><strong>이름:</strong> <code>Create Comment</code></li>
          <li><strong>메서드:</strong> <code>POST</code></li>
          <li><strong>URL:</strong> <code>https://jsonplaceholder.typicode.com/comments</code></li>
          <li><strong>매칭 유형:</strong> <code>Exact</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>3. 모의 응답 추가</strong></td>
      <td>
        상태 코드: <code>201</code>
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
      <td><strong>4. 오프라인 모드 활성화</strong></td>
      <td>상단에서 ON으로 전환</td>
    </tr>
    <tr>
      <td><strong>5. 테스트</strong></td>
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

## 다음 단계

- [핵심 기능](/docs/core-features) – 응답 전략, 환경, 세션, OpenAPI, 오류 시뮬레이션
- [가이드](/docs/guides) – 실제 워크플로우
- [API 레퍼런스](/docs/api-reference) – 전체 API

---

## 문제 해결

**아무 일도 일어나지 않나요?** 오프라인 모드가 ON인지, URL이 정확히 일치하는지(대소문자 구분) 확인하고 Console에서 오류를 확인하세요.

**데모 씬이 작동하지 않나요?** "Demo Scene Collection"이 선택되어 있는지 확인하고, Package Manager에서 Samples를 다시 가져오세요.

**질문이 있나요?** [문제 해결 FAQ](/docs/api-reference#troubleshooting)를 확인하거나 `support@codecarnage.com`으로 이메일을 보내세요.
