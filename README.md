# Week 5 Assignment: Todo App with AI Task Breakdown

> AI 기능이 추가된 Todo 애플리케이션

## 📋 프로젝트 개요

기존 Supabase Todo 앱에 **AI Task Breakdown** 기능을 추가하여, 큰 작업을 AI가 자동으로 여러 작은 단계로 나눠주는 스마트 Todo 앱입니다.

## ✨ 주요 기능

### 기존 기능
- ✅ 사용자 인증 (회원가입/로그인)
- ✅ Todo CRUD (생성, 읽기, 수정, 삭제)
- ✅ 검색 기능
- ✅ 진행률 표시
- ✅ Supabase RLS (Row Level Security)

### 🆕 새로 추가된 AI 기능
- ✅ **AI Task Breakdown**: 큰 작업을 3-5개의 작은 단계로 자동 분해
- ✅ 단계별 선택/해제 기능
- ✅ 선택한 단계를 Todo 리스트에 일괄 추가
- ✅ Rate Limiting (1분에 10회 제한)
- ✅ 로딩 상태 표시
- ✅ 프로페셔널한 UI/UX

## 🛠 기술 스택

### Frontend
- React (CDN)
- Tailwind CSS
- Supabase Client

### Backend
- Node.js + Express
- Google Gemini AI (gemini-2.5-flash)
- Supabase
- Express Rate Limit

## 📁 프로젝트 구조

```
week4-assignment/
├── backend/
│   ├── .env                 # 환경 변수 (API 키)
│   ├── .env.example         # 환경 변수 템플릿
│   ├── server.js            # Express 서버 + AI API
│   ├── package.json         # 의존성
│   └── node_modules/
├── frontend/
│   └── index.html           # React Todo 앱
└── README.md
```

## 🚀 설치 및 실행

### 1. 패키지 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`backend/.env` 파일 생성:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3002
```

**Gemini API 키 발급:**
1. https://ai.google.dev/ 접속
2. "Get API Key" 클릭
3. 무료로 발급 가능

### 3. 백엔드 서버 실행

```bash
cd backend
node server.js
```

서버가 `http://localhost:3002`에서 실행됩니다.

### 4. 프론트엔드 실행

```bash
# 브라우저에서 frontend/index.html 열기
open frontend/index.html
```

## 📸 스크린샷

### AI Task Breakdown 기능
- 큰 작업 입력 시 AI가 자동으로 단계 분해
- 체크박스로 원하는 단계만 선택
- Todo 리스트에 일괄 추가

### 프로페셔널한 디자인
- 블랙/화이트 미니멀 디자인
- SVG 아이콘 사용
- 로딩 애니메이션
- 반응형 UI

## 💡 사용 예시

**입력:**
```
프로젝트 발표 준비
```

**AI 출력:**
1. 발표 자료 구성 및 목차 작성하기
2. 슬라이드 디자인 및 내용 작성하기
3. 발표 연습 및 피드백 받기
4. 최종 수정 및 리허설하기

→ 원하는 항목 선택 → Todo 리스트에 추가! ✅

## 🔧 API 엔드포인트

### AI Task Breakdown
```http
POST http://localhost:3002/api/ai/generate
Content-Type: application/json

{
  "prompt": "일본 여행 준비"
}
```

**Response:**
```json
{
  "success": true,
  "text": "항공권 예매하기\n숙소 예약하기\n환전하기\n여행 일정 계획하기\n짐 챙기기",
  "originalPrompt": "일본 여행 준비"
}
```

## 🚨 주요 구현 사항

### 1. Express 프록시 서버
- API 키를 백엔드에 안전하게 보관
- 프론트엔드에서 직접 LLM API 호출 방지

### 2. Rate Limiting
```javascript
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1분
  max: 10,                   // 최대 10회
});
```

### 3. AI 응답 파싱
- 줄바꿈으로 단계 분리
- 번호/기호 자동 제거 (1., -, • 등)
- 너무 짧은 줄 필터링

### 4. 에러 처리
- 서버 연결 실패
- API 키 오류
- Rate limit 초과
- 사용자 친화적인 에러 메시지

## 📚 학습 내용

이 프로젝트를 통해 다음을 학습했습니다:

1. ✅ **Express 서버를 API 프록시로 사용하는 방법**
2. ✅ **LLM API 안전하게 호출하기** (API 키 보호)
3. ✅ **React와 Express 서버 연동** (프론트엔드 ↔ 백엔드)
4. ✅ **비동기 처리** (async/await, fetch API)
5. ✅ **Rate Limiting으로 서버 보호**
6. ✅ **AI 응답 파싱 및 React 상태 업데이트**
7. ✅ **프로페셔널한 UI/UX 디자인**

## 🐛 문제 해결

### 서버가 연결되지 않을 때
```bash
cd backend
node server.js
```

### CORS 에러
- `server.js`에 `app.use(cors())` 확인

### API 키 오류
- `backend/.env` 파일의 `GEMINI_API_KEY` 확인
- API 키에 따옴표 없이 입력

## ✅ 테스트 체크리스트

- [x] Express 서버가 `http://localhost:3002`에서 실행됨
- [x] 큰 작업 입력 시 AI가 3-5개 단계로 분해
- [x] 단계 선택/해제 가능
- [x] 선택한 단계가 Supabase Todo에 추가됨
- [x] Rate limiting 작동 (10회 요청 후 제한)
- [x] 브라우저 콘솔에 에러 없음
- [x] `.env` 파일이 `.gitignore`에 포함됨

## 👨‍💻 작성자

**이름:** [본인 이름]  
**이메일:** yeon430@ewhain.net  
**제출일:** 2025년 10월 19일

## 📝 어려웠던 점 및 해결 방법

### 1. Gemini 모델명 문제
**문제:** `gemini-pro` 모델이 404 에러 반환  
**해결:** 사용 가능한 모델 리스트 조회 후 `gemini-2.5-flash`로 변경

### 2. AI 응답 파싱
**문제:** AI가 다양한 형식으로 응답 (번호, 기호 등)  
**해결:** 정규표현식으로 번호/기호 제거 및 필터링

### 3. 프로페셔널한 디자인
**문제:** 초기 디자인이 너무 화려함  
**해결:** 블랙/화이트 미니멀 디자인으로 변경, SVG 아이콘 사용

## 📄 라이센스

MIT License

