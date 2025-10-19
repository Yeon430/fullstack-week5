# 🚀 Supabase Todo App 설정 가이드

이 가이드는 현재 SQLite를 사용하는 Todo 앱을 Supabase로 마이그레이션하는 방법을 설명합니다.

## 📋 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 설정](#2-데이터베이스-스키마-설정)
3. [인증 설정](#3-인증-설정)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [프론트엔드 코드 수정](#5-프론트엔드-코드-수정)
6. [백엔드 코드 수정](#6-백엔드-코드-수정)
7. [테스트](#7-테스트)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성
1. [Supabase 웹사이트](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (권장)

### 1.2 새 프로젝트 생성
1. "New Project" 버튼 클릭
2. 프로젝트 정보 입력:
   - **Name**: `todo-app`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자)
3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 2-3분 대기

---

## 2. 데이터베이스 스키마 설정

### 2.1 SQL Editor 열기
1. Supabase 대시보드에서 왼쪽 메뉴의 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 2.2 스키마 실행
1. `supabase_schema.sql` 파일의 모든 내용을 복사
2. SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭하여 실행
4. 성공 메시지 확인

### 2.3 테이블 확인
1. 왼쪽 메뉴에서 **"Table Editor"** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `users`
   - `todos`
   - `categories`

---

## 3. 인증 설정

### 3.1 Authentication 설정
1. 왼쪽 메뉴에서 **"Authentication"** → **"Settings"** 클릭
2. **"Site URL"** 설정:
   - 개발용: `http://localhost:3000`
   - 프로덕션용: 실제 도메인
3. **"Redirect URLs"** 추가:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/success`

### 3.2 이메일 인증 설정 (선택사항)
1. **"Authentication"** → **"Providers"** 클릭
2. **"Email"** 프로바이더 활성화
3. 이메일 템플릿 커스터마이징 (선택사항)

---

## 4. 환경 변수 설정

### 4.1 Supabase 프로젝트 정보 확인
1. 왼쪽 메뉴에서 **"Settings"** → **"API"** 클릭
2. 다음 정보를 복사해두세요:
   - **Project URL**
   - **Project API keys** → **anon public**

### 4.2 .env 파일 생성
백엔드 폴더에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 설정
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 서버 설정
PORT=3000
NODE_ENV=development
```

### 4.3 .gitignore 업데이트
`.env` 파일이 Git에 커밋되지 않도록 `.gitignore`에 추가:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

---

## 5. 프론트엔드 코드 수정

### 5.1 Supabase 클라이언트 설정
`frontend/index.html` 파일에 Supabase CDN 추가:

```html
<!-- 기존 React CDN 아래에 추가 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 5.2 Supabase 초기화 코드 추가
`<script type="text/babel">` 태그 시작 부분에 다음 코드 추가:

```javascript
// Supabase 클라이언트 초기화
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 인증 상태 확인
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// 로그인 함수
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

// 회원가입 함수
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  return { data, error };
};

// 로그아웃 함수
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error;
};
```

### 5.3 Todo 관련 함수 수정
기존 fetch 코드를 Supabase 코드로 변경:

```javascript
// 할 일 목록 조회
const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('할 일 목록 조회 실패:', error);
    return [];
  }
  return data || [];
};

// 새 할 일 추가
const addTodo = async (text) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        text,
        completed: false,
        user_id: user.id
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('할 일 추가 실패:', error);
    throw error;
  }
  return data;
};

// 할 일 완료 상태 토글
const toggleTodo = async (id, completed) => {
  const { data, error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('할 일 업데이트 실패:', error);
    throw error;
  }
  return data;
};

// 할 일 삭제
const deleteTodo = async (id) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('할 일 삭제 실패:', error);
    throw error;
  }
};
```

---

## 6. 백엔드 코드 수정

### 6.1 필요한 패키지 설치
```bash
cd backend
npm install @supabase/supabase-js
```

### 6.2 server.js 수정
기존 SQLite 코드를 Supabase 코드로 변경:

```javascript
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// 할 일 목록 조회
app.get('/api/todos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('할 일 목록 조회 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 새 할 일 추가
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text가 필요합니다.' });
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text, completed: false }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('할 일 추가 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 할 일 수정
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('할 일 수정 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 할 일 삭제
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: '삭제 완료', id });
  } catch (error) {
    console.error('할 일 삭제 실패:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
  console.log('='.repeat(50));
});
```

---

## 7. 테스트

### 7.1 서버 실행
```bash
cd backend
npm start
```

### 7.2 프론트엔드 테스트
1. `frontend/index.html` 파일을 브라우저에서 열기
2. 할 일 추가/수정/삭제 기능 테스트
3. Supabase 대시보드에서 데이터 확인

### 7.3 Supabase 대시보드에서 확인
1. **Table Editor**에서 `todos` 테이블 확인
2. 추가된 할 일들이 제대로 저장되었는지 확인
3. 실시간으로 데이터 변경사항 확인

---

## 🔧 문제 해결

### 일반적인 문제들

1. **CORS 오류**
   - Supabase 대시보드에서 도메인 허용 설정 확인
   - `http://localhost:3000` 추가

2. **인증 오류**
   - API 키가 올바른지 확인
   - RLS 정책이 올바르게 설정되었는지 확인

3. **연결 오류**
   - Supabase URL이 올바른지 확인
   - 인터넷 연결 상태 확인

### 디버깅 팁

1. 브라우저 개발자 도구의 Console 탭 확인
2. Supabase 대시보드의 Logs 탭에서 서버 로그 확인
3. Network 탭에서 API 요청/응답 확인

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 실행 완료
- [ ] 환경 변수 설정 완료
- [ ] 프론트엔드 코드 수정 완료
- [ ] 백엔드 코드 수정 완료
- [ ] 기능 테스트 완료
- [ ] 에러 없이 동작 확인

---

🎉 **축하합니다!** Supabase로 Todo 앱 마이그레이션이 완료되었습니다!

