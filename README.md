# Na Lab

Na Lab은 동료의 익명 피드백을 모아 자신의 직무 강점을 발견하고 커리어 DNA로 정리하는 웹 애플리케이션입니다.

![Na Lab home](.github/assets/portfolio/na-lab-home.png)

## Product flow

1. 피드백 질문 폼을 만듭니다.
2. 링크를 공유해 동료의 익명 응답을 받습니다.
3. 응답을 강점과 협업 피드백으로 정리합니다.
4. 결과를 커리어 DNA와 공유 이미지로 활용합니다.

주요 화면은 survey, feedback, result, review, gallery, DNA 흐름으로 구성됩니다.

## 주요 기능

- 질문 폼 생성과 공유
- 익명 피드백 수집
- 응답 결과와 강점 요약
- 커리어 DNA 카드 생성
- 갤러리와 결과 이미지 공유

## Stack

- Next.js / React
- TypeScript
- Emotion
- TanStack React Query
- Vitest

## 시작하기

```bash
corepack enable
yarn install
yarn build
yarn test --run
```

인증, 분석 및 외부 서비스 연동은 로컬 환경변수로 별도 설정해야 합니다.
