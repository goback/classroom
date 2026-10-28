# 해밀리 Dev 연결 테스트

GitHub Pages에서 개발앱 실행과 스토어 이동을 확인하는 정적 페이지입니다. 서버, API 키, 빌드, 외부 라이브러리가 필요하지 않습니다.

## 테스트 주소

- 수동 시험: https://goback.github.io/classroom/?videoId=e9b2ebb8-6e7f-41ff-8ca4-c488730daf12
- 페이지 진입 시 자동 연결 시험: https://goback.github.io/classroom/?videoId=e9b2ebb8-6e7f-41ff-8ca4-c488730daf12&auto=1
- `videoId`를 생략하면 위 강의를 기본값으로 사용합니다. 앱에서 공유한 다른 강의 ID도 같은 방식으로 전달합니다.

## 준비할 것

1. 강의 딥링크 처리를 반영한 최신 해밀리 Dev 앱을 설치한 Android 또는 iPhone. 이전 앱은 실행되어도 홈으로 이동할 수 있습니다.
2. 앱이 없는 상태를 확인할 별도 기기 또는 앱을 제거해도 되는 테스트 환경. 앱 삭제 시 앱 데이터가 사라질 수 있으므로 별도 기기가 편합니다.

개발앱은 스토어에 등록되어 있지 않습니다. 스토어 연결은 운영 해밀리헬스 페이지를 사용하며, 운영앱의 URL 스킴은 호출하지 않습니다.

## GitHub Pages 설정

저장소 Settings → Pages → Build and deployment에서 Source를 `Deploy from a branch`, Branch를 `main`, Folder를 `/(root)`로 설정합니다. 배포가 완료되면 위 주소를 휴대폰에서 엽니다.

## 확인 순서

1. 설치된 개발앱에서: **해밀리 Dev에서 열기**를 누릅니다. 지정된 강의 상세가 열리는지 확인합니다. 로그인·필수 가입 절차가 남아 있으면 완료 후 해당 강의로 이동합니다.
2. **Google Play**와 **App Store** 버튼이 해밀리헬스 페이지를 여는지 각각 확인합니다.
3. **앱 실행 + 스토어 전환 시험**을 누릅니다. Android의 지원 브라우저는 Intent fallback을 사용합니다. iPhone은 페이지가 계속 보일 때 3초 뒤 App Store로 이동하는 추정 방식입니다.
4. 개발앱이 없는 기기에서도 같은 버튼으로 스토어 이동을 확인합니다.
5. **링크를 열면 자동 연결 시험**을 켜고 링크를 복사해 메시지와 다른 앱에서 엽니다. 자동 실행이 차단되면 버튼을 누릅니다.

앱 실행 성공 여부를 웹페이지가 확정해서 표시하지 않습니다. 페이지가 숨겨지는 것만으로 성공으로 기록하지 않으며, 숨김·페이지 이탈·취소·뒤로 돌아오기 시 예약된 iOS 스토어 이동을 취소합니다. iOS 실행 확인창이나 앱 실행 차단 때문에 설치되어 있어도 스토어로 이동할 수 있습니다.

이번 검증은 **웹페이지 → URL 스킴/Android Intent → 개발앱 강의 상세 또는 스토어**입니다. HTTPS App Links/Universal Links 연결 파일은 배포하지 않습니다. 앱의 강의 상세에서 **공유 → 다른 앱으로**를 선택하면 현재 강의 ID와 `auto=1`이 포함된 이 Pages 주소를 OS 공유창에 전달합니다. 이 외부 공유 버튼은 개발앱에서만 활성화합니다.

## 연결 값

- URL 스킴: `hemily-dev`
- Android 패키지: `com.hemilyHealth.app.dev`
- 실행 URL: `hemily-dev://hemily.tlchealthcare.co.kr/hemily-dev-link/classroom/videos/{videoId}`
- Google Play: https://play.google.com/store/apps/details?id=com.hemilyHealth.app
- App Store: https://apps.apple.com/kr/app/id6804555560

외부 주소를 임의 입력받지 않습니다. 앱 실행과 스토어 주소는 `links.mjs`의 고정값만 사용합니다. 사용자 데이터, 인증값, 원격 분석 도구, 외부 폰트는 포함하지 않습니다.

## 로컬 확인

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node --test links.test.mjs
```

컴퓨터에서는 앱 실행 버튼을 비활성화하며 스토어 링크와 복사 기능을 확인할 수 있습니다. 로컬 컴퓨터의 `127.0.0.1`은 휴대폰에서 접근할 수 있는 공개 테스트 주소가 아닙니다.
