/**
 * 🛠️ Hands-On 실습 1: 간단한 API 만들기 (15분)
 *
 * ⚠️ 중요: 이 실습을 반드시 완료하세요!
 * 이 실습을 건너뛰면 server.js 수업 이해가 어려울 수 있습니다.
 *
 * ⚠️ 주의: 이 파일은 hands_on_fetch.html과 무관합니다!
 * hands_on_fetch.html은 simple_server.js를 사용합니다.
 * 이 파일은 독립적인 코딩 실습용입니다.
 *
 * 🎯 목표: Express로 기본 API 엔드포인트를 직접 만들어보기
 *
 * 💡 이 파일의 특징:
 * - TODO 형식의 빈 템플릿 (학생이 직접 코드 작성)
 * - 정답은 파일 하단 주석으로 제공
 * - hands_on_fetch.html과 무관 (독립적인 실습)
 *
 * 🚀 사용 방법:
 * 1. TODO 부분에 코드 작성
 * 2. node hands_on_simple_api.js 실행
 * 3. 브라우저 주소창에 http://localhost:3000/api/hello 입력
 * 4. Thunder Client로 테스트도 가능
 *
 * 📝 실습 단계:
 * 1. Express 서버 기본 설정 (이미 완료)
 * 2. GET 엔드포인트 만들기 (TODO)
 * 3. JSON 응답 보내기 (TODO)
 * 4. 브라우저/Thunder Client로 테스트
 *
 * 💪 학습 팁:
 * - 에러가 나도 괜찮습니다! 에러 메시지를 읽고 수정하는 것도 학습입니다.
 * - 막히면 파일 하단의 정답 코드를 참고하세요.
 * - 하지만 복붙하지 말고 이해하며 직접 타이핑하세요!
 * - 이 실습이 server.js 이해의 기초가 됩니다.
 */

//const express = require('express');
//const app = express();
//const PORT = 3000;

// JSON 파싱 미들웨어
//app.use(express.json());

// ============================================
// 📝 TODO 1: 루트 경로 만들기
// ============================================
// GET / → "안녕하세요! 제 첫 API입니다" 메시지 반환

// 🎯 여기에 코드를 작성하세요:
/*app.get('/', (req, res) => {
  res.json({ message: '안녕하세요! 제 첫 API입니다' });
});


// ============================================
// 📝 TODO 2: /api/hello 엔드포인트 만들기
// ============================================
// GET /api/hello → { greeting: "Hello, World!" } 반환

// 🎯 여기에 코드를 작성하세요:
app.get('/api/hello', (req, res) => {
  res.json({ greeting: "Hello, World!"});
});



// ============================================
// 📝 TODO 3: /api/time 엔드포인트 만들기
// ============================================
// GET /api/time → 현재 시간을 반환
// 힌트: new Date().toLocaleString('ko-KR') 사용

// 🎯 여기에 코드를 작성하세요:
app.get('/api/time', (req, res) => {
  const currentTime = new Date().toLocaleString('ko-KR');
  res.json({
    message: '현재 시간입니다',
    time: currentTime
  });
});







// ============================================
// 📝 TODO 4: URL 파라미터 사용하기
// ============================================
// GET /api/hello/:name → "안녕하세요, {name}님!" 메시지 반환
// 예: /api/hello/철수 → { message: "안녕하세요, 철수님!" }

/* 🎯 여기에 코드를 작성하세요:
app.get('/api/hello/:name', (req, res) => {
  const name = req.params.name;
  res.json({
    message: `안녕하세요, ${name}님!`
  });
});

let todos = [];

// 전체 Todo 목록 조회
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

//새 TODO 추가
app.post('api/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    title: req.body.title,
    completed: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({error: 'Todo not found'});

  todo.title = req.body.title ?? todo.title;
  todo.completed = req.body.completed ?? todo.completed;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({error: 'Todo not found'});

  todos.splice(index, 1);
  res.json({ message: 'Deleted'});
});

app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다`);
});
*/

// 📦 패키지 불러오기
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// 🚀 서버 설정
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// 🧱 SQLite DB 연결 및 테이블 생성
const db = new Database('database/todos.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

// ✅ [R] 전체 조회 (Read)
app.get('/api/todos', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos').all();
  const formatted = todos.map(t => ({
    ...t,
    completed: Boolean(t.completed),
  }));
  res.json(formatted);
});

// ✅ [C] 새 할 일 추가 (Create)
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text가 필요합니다.' });

  const stmt = db.prepare('INSERT INTO todos (text) VALUES (?)');
  const result = stmt.run(text);
  const newTodo = { id: result.lastInsertRowid, text, completed: false };
  res.status(201).json(newTodo);
});

// ✅ [U] 할 일 수정 (Update)
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  db.prepare('UPDATE todos SET completed = ? WHERE id = ?')
    .run(completed ? 1 : 0, id);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  updated.completed = Boolean(updated.completed);
  res.json(updated);
});

// ✅ [D] 할 일 삭제 (Delete)
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.json({ message: '삭제 완료', id });
});

// 🚀 서버 실행
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
  console.log('='.repeat(50));
});






// ============================================
// 🎓 참고: 완성 예시 (아래 주석 해제해서 테스트해보세요)
// ============================================

/*
// TODO 1 정답
app.get('/', (req, res) => {
  res.json({ message: '안녕하세요! 제 첫 API입니다' });
});

// TODO 2 정답
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'Hello, World!' });
});

// TODO 3 정답
app.get('/api/time', (req, res) => {
  const currentTime = new Date().toLocaleString('ko-KR');
  res.json({
    message: '현재 시간입니다',
    time: currentTime
  });
});

// TODO 4 정답
app.get('/api/hello/:name', (req, res) => {
  const name = req.params.name;
  res.json({
    message: `안녕하세요, ${name}님!`
  });
});
*/

// ============================================
// 서버 시작
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
  console.log('='.repeat(50));
  console.log('\n📝 TODO를 완성하고 테스트해보세요:');
  console.log(`   1. http://localhost:${PORT}/`);
  console.log(`   2. http://localhost:${PORT}/api/hello`);
  console.log(`   3. http://localhost:${PORT}/api/time`);
  console.log(`   4. http://localhost:${PORT}/api/hello/철수`);
  console.log('\n종료: Ctrl + C\n');
  console.log('='.repeat(50));
});

/**
 * 🎯 학습 포인트
 *
 * 1. app.get(경로, 콜백함수)
 *    - 첫 번째 파라미터: URL 경로
 *    - 두 번째 파라미터: 요청이 들어왔을 때 실행할 함수
 *
 * 2. res.json(객체)
 *    - JavaScript 객체를 JSON으로 변환해서 응답
 *    - 자동으로 Content-Type: application/json 설정
 *
 * 3. req.params
 *    - URL 파라미터 접근
 *    - /api/hello/:name → req.params.name
 *
 * 4. 실행 방법
 *    - node hands_on_simple_api.js
 *    - 브라우저에서 http://localhost:3000 접속
 *
 * 💡 팁: 코드를 수정하면 서버를 재시작해야 합니다!
 *       (Ctrl + C로 종료 → node hands_on_simple_api.js로 재실행)
 */
