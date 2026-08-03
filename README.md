# TEAMMAKER (MWFC)

**MY WAY FUTSAL CLUB**용 팀(조) 편성 웹 앱입니다.  
팀원을 등록하고, 드래그 앤 드롭 또는 실력 기반 밸런스 랜덤으로 팀을 나눈 뒤, 명단을 복사하거나 이미지로 저장할 수 있습니다.

배포 예시: [https://mwfc-feature.vercel.app](https://mwfc-feature.vercel.app)

---

## 주요 기능

- **팀원 CRUD** — 이름·실력 추가 / 카드 안에서 인라인 수정 / 삭제
- **명단 일괄 등록** — 명단 이미지를 올리면 Tesseract.js OCR로 이름을 읽어 검수 후 등록
- **실력 등급** — 최하(1) ~ 최상(7), 밸런스 조짜기 합산에 그대로 사용
- **드래그 앤 드롭 편성** — 왼쪽 핸들로 대기 인원 ↔ 팀 이동, 팀 안 순서 변경
- **밸런스 랜덤 조짜기** — 실력 합·인원 수를 고르게 맞춰 자동 배정
- **리스트 복사** — `1팀: 이름, 이름, ...` 형식으로 클립보드 복사
- **각 팀별 이미지 저장** — 팀마다 PNG로 바로 다운로드
- **로컬 저장** — `localStorage`에 데이터 유지 (새로고침해도 유지)

---

## 기술 스택

| 구분 | 사용 |
| --- | --- |
| UI | React, TypeScript, Vite |
| 스타일 | styled-components |
| DnD | @dnd-kit |
| 이미지 내보내기 | html-to-image |
| 저장소 | localStorage |

---

## 시작하기

```bash
npm install
npm run dev
```

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | Oxlint |

---

## 사용 흐름

1. 팀원 이름과 실력을 선택해 추가합니다.
2. 팀 개수를 정한 뒤 **밸런스 랜덤 조짜기**를 실행하거나, 핸들로 직접 옮깁니다.
3. 팀 카드의 **리스트 복사**로 채팅에 붙여넣거나, **각 조별 이미지 저장**으로 공유용 이미지를 받습니다.

---

## 프로젝트 구조 (요약)

```
src/
  components/   # 팀원 카드, 팀 컬럼, 컨트롤, 내보내기 UI
  constants/    # 실력 등급 등
  styles/       # 테마, 글로벌 스타일
  utils/        # 랜덤 배정, 복사, 이미지 저장, DnD 충돌
  storage.ts    # localStorage 로드/저장
  App.tsx       # 앱 상태와 화면 구성
```

---

## 참고

- 소셜 미리보기(OG) 이미지는 `public/mwfc-og.jpg`를 사용합니다.
- `.env` 등 환경 변수 파일은 git에 올리지 않습니다. 필요 시 `.env.example`을 참고하세요.
