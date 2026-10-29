# 해밀리 Dev 연결 테스트

GitHub Pages에서 개발앱 실행과 스토어 이동을 확인하는 정적 페이지입니다. 서버, API 키, 빌드, 외부 라이브러리가 필요하지 않습니다.

## 테스트 주소

- 기본 자동 연결: https://goback.github.io/classroom/?videoId=e9b2ebb8-6e7f-41ff-8ca4-c488730daf12
- 수동 시험 전용: https://goback.github.io/classroom/?videoId=e9b2ebb8-6e7f-41ff-8ca4-c488730daf12&auto=0
- 위 ID는 테스트 링크의 예시입니다. 앱은 현재 강의 ID를 전달하고 페이지는 전달받은 `videoId`만 사용합니다. ID가 없거나 잘못되면 안내만 표시하며 앱 실행이나 자동 스토어 이동을 하지 않습니다.

## 준비할 것

1. 강의 딥링크 처리를 반영한 최신 해밀리 Dev 앱을 설치한 Android 또는 iPhone. 이전 앱은 실행되어도 홈으로 이동할 수 있습니다.
2. 앱이 없는 상태를 확인할 별도 기기 또는 앱을 제거해도 되는 테스트 환경. 앱 삭제 시 앱 데이터가 사라질 수 있으므로 별도 기기가 편합니다.

개발앱은 스토어에 등록되어 있지 않습니다. 스토어 연결은 운영 해밀리헬스 페이지를 사용하며, 운영앱의 URL 스킴은 호출하지 않습니다.

## GitHub Pages 설정

저장소 Settings → Pages → Build and deployment에서 Source를 `Deploy from a branch`, Branch를 `main`, Folder를 `/(root)`로 설정합니다. 배포가 완료되면 위 주소를 휴대폰에서 엽니다.

## 확인 순서

1. 기본 링크를 열면 버튼을 누르지 않고 개발앱 또는 스토어로 연결을 시도합니다. 지정된 강의 상세가 열리는지 확인합니다. 로그인·필수 가입 절차가 남아 있으면 완료 후 해당 강의로 이동합니다.
2. 자동 연결이 막힌 경우 **앱 열기 또는 설치하기** 버튼 하나로 다시 시도합니다. Android의 지원 브라우저는 개발앱을 열 수 없으면 Intent fallback으로 Google Play에 연결합니다. iPhone은 앱 실행 후 페이지가 계속 보일 때 2초 뒤 App Store로 이동하는 추정 방식입니다.
3. 개발앱이 없는 기기에서도 같은 버튼으로 운영 해밀리헬스 스토어 이동을 확인합니다. 별도의 앱 실행·스토어 이동 버튼은 표시하지 않습니다.
4. 자동 연결은 기본으로 켜져 있습니다. 링크를 복사해 메시지와 다른 앱에서 엽니다. 자동 실행이 차단되면 같은 연결 버튼을 누릅니다. `auto=0`은 자동 전환 없이 페이지를 확인할 때만 사용합니다.

앱 실행 성공 여부를 웹페이지가 확정해서 표시하지 않습니다. 페이지가 숨겨지는 것만으로 성공으로 기록하지 않으며, 숨김·페이지 이탈·취소·뒤로 돌아오기 시 예약된 iOS 스토어 이동을 취소합니다. iOS 실행 확인창이나 앱 실행 차단 때문에 설치되어 있어도 스토어로 이동할 수 있습니다.

이번 검증은 **웹페이지 → URL 스킴/Android Intent → 개발앱 강의 상세 또는 스토어**입니다. HTTPS App Links/Universal Links 연결 파일은 배포하지 않습니다. 앱의 강의 상세에서 **공유 → 다른 앱으로**를 선택하면 현재 강의 ID만 포함된 이 Pages 주소를 OS 공유창에 전달합니다. 자동 연결은 기본 동작이므로 별도 파라미터를 붙이지 않습니다. 이 외부 공유 버튼은 개발앱에서만 활성화합니다.

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

컴퓨터에서는 연결 버튼을 비활성화하며 복사 기능을 확인할 수 있습니다. 로컬 컴퓨터의 `127.0.0.1`은 휴대폰에서 접근할 수 있는 공개 테스트 주소가 아닙니다. JavaScript가 꺼져 있을 때는 별도 noscript 안내에 스토어 링크를 제공합니다.
