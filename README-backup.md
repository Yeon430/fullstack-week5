# Todo App

React, Express, SQLite를 사용한 풀스택 Todo 애플리케이션입니다.

## 기능

- 할 일 추가/삭제/완료
- 검색 기능
- 진행률 추적
- 깔끔한 디자인

## 기술 스택

**Frontend:** React 18, Tailwind CSS  
**Backend:** Node.js, Express.js, SQLite

## 프로젝트 구조

```
├── backend/
│   ├── database/todos.db
│   ├── package.json
│   └── server.js
├── frontend/
│   └── index.html
└── README.md
```

## 실행 방법

### 백엔드
```bash
cd backend
npm install
npm start
```

### 프론트엔드
`frontend/index.html` 파일을 브라우저에서 열거나 로컬 서버를 실행합니다.

## API

- `GET /api/todos` - 할 일 목록 조회
- `POST /api/todos` - 할 일 추가
- `PUT /api/todos/:id` - 할 일 수정
- `DELETE /api/todos/:id` - 할 일 삭제

### 요청 예시
```javascript
// 할 일 추가
POST /api/todos
{
  "text": "새로운 할 일"
}

// 할 일 완료
PUT /api/todos/1
{
  "completed": true
}
```

## 데이터베이스

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 환경 요구사항

- Node.js 14.0 이상
- 모던 웹 브라우저
