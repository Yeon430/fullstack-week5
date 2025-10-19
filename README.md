# Week 5 Assignment: Todo App with AI Task Breakdown

> AI 기능이 추가된 스마트 Todo 애플리케이션

## 📋 프로젝트 개요

Supabase 기반 Todo 앱에 **AI Task Breakdown** 기능을 추가하여, 큰 작업을 자동으로 여러 단계로 분해해주는 애플리케이션입니다.

## ✨ 주요 기능

### 기존 기능
- 사용자 인증 (회원가입/로그인)
- Todo CRUD (생성, 읽기, 수정, 삭제)
- 검색 및 진행률 표시

### 🆕 AI 기능
- **AI Task Breakdown**: 큰 작업을 3-5개의 작은 단계로 자동 분해
- 단계별 선택/해제 및 Todo 리스트 일괄 추가
- Rate Limiting (1분에 10회 제한)

## 🛠 기술 스택

**Frontend:** React (CDN), Tailwind CSS, Supabase Client  
**Backend:** Node.js, Express, Gemini AI (2.5-flash), Supabase  
**Security:** Express Rate Limit, Row Level Security (RLS)

## 🚀 설치 및 실행

### 1. 패키지 설치
```bash
cd backend
npm install
```

### 2. 환경 변수 설정
`backend/.env` 파일 생성:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3002
```

### 3. 서버 실행
```bash
# Backend
cd backend
node server.js

# Frontend
open frontend/index.html
```

## 💡 사용 예시

**입력:** "프로젝트 발표 준비"

**AI 출력:**
1. 발표 자료 구성 및 목차 작성하기
2. 슬라이드 디자인 및 내용 작성하기
3. 발표 연습 및 피드백 받기
4. 최종 수정 및 리허설하기

→ 원하는 항목 선택 → Todo 리스트에 추가 ✅
