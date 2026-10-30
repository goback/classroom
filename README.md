# 해밀리헬스 강의 연결 페이지

GitHub Pages에서 공유 강의를 개발앱으로 열고, 연결할 수 없으면 스토어로 안내하는 정적 페이지입니다. 서버, API 키, 빌드, 외부 라이브러리가 필요하지 않습니다.

피그마의 Android `5368:18127`, iOS `5368:18142` 웹페이지를 구현합니다. 상단의 카카오 인앱 브라우저 예시 영역은 웹페이지에 포함하지 않습니다. 본문은 중앙, 버튼은 하단에 배치하며 360×720 기준 좌우 여백 16px, 버튼 높이 64px, 모서리 12px를 사용합니다.

- Android: ‘해밀리헬스 앱으로 / 이동합니다’, ‘앱이 열리지 않으면 / 아래 버튼을 눌러 주세요’, 파란색 ‘앱으로 이동하기’ 버튼 하나.
- iOS: ‘해밀리헬스 앱에서 / 강의를 볼 수 있어요’, ‘앱이 없으면 설치 후 볼 수 있어요’, 파란색 ‘앱으로 이동하기’와 회색 ‘앱 설치하기’ 버튼.

로고와 플랫폼별 제목은 페이지가 열리는 즉시 표시합니다. 아래 안내와 연결 버튼만 HTML에서부터 숨긴 상태로 시작하고 2초 뒤 함께 나타납니다. 안내 자리를 미리 확보해 등장할 때 본문이 움직이지 않습니다. 앱 전환·페이지 이탈 시 표시 예약을 취소하고, 다시 돌아오면 2초 후 표시합니다. 앱 자동 실행은 즉시 시도하며 iOS에는 자동 스토어 이동 타이머가 없습니다.

`hemily-symbol.svg`는 피그마 시안에서 받은 원본 심볼입니다. 원본 SVG 크기는 71.0197×65.2422이고, 64×66 로고 슬롯의 왼쪽 위(0, 0.3)에 배치합니다. 앱 아이콘 `app-icon.png`는 파비콘으로 유지합니다. 글꼴은 앱의 Pretendard Regular/SemiBold/Bold를 현재 페이지 문자와 ASCII만 담은 WOFF2로 변환해 `fonts/`에서 제공합니다. SIL Open Font License는 `fonts/OFL.txt`에 함께 배포합니다. 문구가 바뀌면 다음 명령으로 웹폰트를 다시 생성합니다(fonttools, brotli 필요).

```sh
python3 scripts/subset-fonts.py /path/to/flutter-hemily-app/assets/fonts
```

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

1. 기본 링크를 열면 버튼을 누르지 않고 개발앱 실행을 시도합니다. 지정된 강의 상세가 열리는지 확인합니다. 로그인·필수 가입 절차가 남아 있으면 완료 후 해당 강의로 이동합니다.
2. Android의 지원 브라우저는 개발앱을 열 수 없으면 Intent fallback으로 Google Play에 연결합니다. 자동 연결이 차단되면 2초 후 표시되는 **앱으로 이동하기** 버튼으로 같은 연결을 다시 시도합니다.
3. iPhone은 URL 스킴으로 앱 실행만 요청합니다. 시스템 확인창이 떠 있거나 앱이 실행되지 않아도 자동으로 App Store로 이동하지 않습니다. 2초 후 **앱으로 이동하기**와 **앱 설치하기** 버튼 두 개를 표시합니다. 첫 버튼은 앱 실행만 다시 시도하고, 설치 버튼을 직접 눌렀을 때만 App Store로 이동합니다.
4. 앱에서 공유한 링크를 메시지와 다른 앱에서 엽니다. 자동 연결은 기본 동작이며 설정 UI는 제공하지 않습니다. `auto=0`은 자동 전환 없이 페이지를 확인할 때만 사용할 수 있습니다.

앱 설치·실행 성공 여부를 웹페이지가 확정할 수는 없습니다. iOS 시스템 실행 확인창에서 사용자가 ‘열기’를 선택한 시점도 웹페이지에서는 감지할 수 없으므로 스토어 자동 전환을 예약하지 않습니다.

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
node --test links.test.mjs page.test.mjs
```

컴퓨터에서도 로고와 제목은 즉시 표시하고, 아래 안내와 비활성 연결 버튼은 2초 후 표시합니다. 강의 ID가 없거나 잘못되면 링크를 확인하라는 안내는 즉시 표시하고 비활성 버튼은 2초 후 표시합니다. 로컬 컴퓨터의 `127.0.0.1`은 휴대폰에서 접근할 수 있는 공개 테스트 주소가 아닙니다. JavaScript가 꺼져 있으면 브라우저 설정 안내를 제공합니다.

`links.test.mjs`는 URL 생성·플랫폼 감지·지연 표시·앱 실행을 검증합니다. `page.test.mjs`는 실제 HTML과 페이지 초기화 코드를 사용해 iOS의 두 버튼 및 수동 스토어 이동, Android의 기존 단일 버튼, 2초 전후 표시와 페이지 복귀 동작을 검증합니다.
