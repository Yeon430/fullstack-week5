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
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 🚀 서버 설정
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// 🚨 Rate Limiter 설정 (AI API 남용 방지)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1분 (60초)
  max: 10,                   // 1분에 최대 10번 요청 가능
  message: { 
    success: false, 
    error: '너무 많은 요청을 보냈습니다. 1분 후에 다시 시도해주세요.' 
  },
  standardHeaders: true,     // Rate limit 정보를 헤더에 포함
  legacyHeaders: false,      // X-RateLimit-* 헤더 비활성화
});

// 🔥 Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🤖 Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ✅ [R] 전체 조회 (Read)
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

// ✅ [C] 새 할 일 추가 (Create)
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

// ✅ [U] 할 일 수정 (Update)
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

// ✅ [D] 할 일 삭제 (Delete)
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

// 🤖 [AI] Todo 분해 엔드포인트
app.post('/api/ai/generate', aiLimiter, async (req, res) => {
  try {
    // 1️⃣ 클라이언트에서 보낸 데이터 받기
    const { prompt } = req.body;
    
    // 2️⃣ 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '작업 내용을 입력해주세요.'
      });
    }

    // 3️⃣ AI에게 보낼 프롬프트 만들기
    const systemPrompt = `당신은 큰 작업을 작은 단계로 나누는 전문가입니다.

사용자가 입력한 작업을 3-5개의 구체적이고 실행 가능한 작은 단계로 나누세요.

규칙:
- 각 단계는 한 줄로 작성
- 실행 가능한 동사로 시작 (예: "~하기", "~예약하기", "~준비하기")
- 3개에서 5개 사이의 단계로만 작성
- 각 줄은 단계 내용만 작성 (번호나 기호 없이)
- 구체적이고 실행 가능한 단계여야 함

작업: "${prompt}"

응답 형식 예시:
항공권 예매하기
숙소 예약하기
환전하기
짐 챙기기`;

    // 4️⃣ Gemini API 호출
    console.log('🤖 AI 요청 시작:', prompt);
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI 응답:', text);

    // 5️⃣ 성공 응답
    res.json({
      success: true,
      text: text.trim(),
      originalPrompt: prompt
    });

  } catch (error) {
    // 6️⃣ 에러 처리
    console.error('❌ AI 생성 오류:', error);
    
    // API 키 오류인지 확인
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'API 키가 유효하지 않습니다. .env 파일을 확인해주세요.'
      });
    }
    
    // 일반적인 에러
    res.status(500).json({
      success: false,
      error: 'AI 요청 처리 중 오류가 발생했습니다.'
    });
  }
});

// 🚀 서버 실행
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
  console.log(`🤖 AI 엔드포인트: http://localhost:${PORT}/api/ai/generate`);
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

