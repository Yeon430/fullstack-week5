-- =====================================================
-- 📋 Todo App Supabase Database Schema
-- =====================================================
-- 이 파일은 React Todo 앱을 위한 Supabase 데이터베이스 스키마입니다.
-- 
-- 🚀 사용 방법:
-- 1. Supabase 대시보드에서 SQL Editor 열기
-- 2. 아래 코드를 복사해서 실행
-- 3. 또는 Supabase CLI를 사용해서 파일 실행
--
-- 📝 테이블 구조:
-- - todos: 할 일 목록을 저장하는 메인 테이블
-- - users: 사용자 정보 (향후 확장용)
-- - categories: 할 일 카테고리 (향후 확장용)
-- =====================================================

-- =====================================================
-- 🔐 1. 사용자 테이블 (Supabase Auth와 연동)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 🏷️ 2. 카테고리 테이블 (todos 테이블보다 먼저 생성)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6', -- 헥스 컬러 코드
    icon TEXT DEFAULT '📝', -- 이모지 아이콘
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 📝 3. 메인 Todo 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) > 0),
    completed BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5), -- 1: 낮음, 5: 높음
    due_date TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 📊 4. 인덱스 생성 (성능 최적화)
-- =====================================================

-- 사용자별 할 일 조회 최적화
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- 완료 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);

-- 생성일 기준 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- 사용자별 카테고리 조회 최적화
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- =====================================================
-- 🔒 5. Row Level Security (RLS) 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 할 일 관련 정책
CREATE POLICY "Users can view own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- 카테고리 관련 정책
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 🔄 6. 자동 업데이트 트리거 함수
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON public.todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 📋 7. 사용자별 기본 카테고리 생성 함수
-- =====================================================

-- 사용자가 회원가입할 때 기본 카테고리를 자동으로 생성하는 함수
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 사용자에게 기본 카테고리 생성
    INSERT INTO public.categories (user_id, name, color, icon) VALUES
        (NEW.id, '일반', '#3B82F6', '📝'),
        (NEW.id, '업무', '#EF4444', '💼'),
        (NEW.id, '개인', '#10B981', '🏠'),
        (NEW.id, '쇼핑', '#F59E0B', '🛒'),
        (NEW.id, '운동', '#8B5CF6', '🏃‍♂️');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 테이블에 INSERT 트리거 추가
CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- =====================================================
-- 📊 8. 유용한 뷰 생성
-- =====================================================

-- 사용자별 할 일 통계 뷰
CREATE OR REPLACE VIEW public.user_todo_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(t.id) as total_todos,
    COUNT(CASE WHEN t.completed = TRUE THEN 1 END) as completed_todos,
    COUNT(CASE WHEN t.completed = FALSE THEN 1 END) as pending_todos,
    ROUND(
        CASE 
            WHEN COUNT(t.id) > 0 THEN 
                (COUNT(CASE WHEN t.completed = TRUE THEN 1 END)::DECIMAL / COUNT(t.id)) * 100 
            ELSE 0 
        END, 2
    ) as completion_percentage,
    COUNT(CASE WHEN t.due_date < NOW() AND t.completed = FALSE THEN 1 END) as overdue_todos
FROM public.users u
LEFT JOIN public.todos t ON u.id = t.user_id
GROUP BY u.id, u.username;

-- =====================================================
-- 🎯 9. 유용한 함수들
-- =====================================================

-- 할 일 완료율 계산 함수
CREATE OR REPLACE FUNCTION get_completion_rate(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_count INTEGER;
    completed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.todos WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO completed_count FROM public.todos WHERE user_id = p_user_id AND completed = TRUE;
    
    IF total_count = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_count::DECIMAL / total_count) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- 사용자의 오늘 할 일 조회 함수
CREATE OR REPLACE FUNCTION get_today_todos(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    text TEXT,
    completed BOOLEAN,
    priority INTEGER,
    due_date TIMESTAMP WITH TIME ZONE,
    category_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.text,
        t.completed,
        t.priority,
        t.due_date,
        c.name as category_name
    FROM public.todos t
    LEFT JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
    AND DATE(t.created_at) = CURRENT_DATE
    ORDER BY t.priority DESC, t.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ✅ 스키마 생성 완료 메시지
-- =====================================================

-- 성공 메시지 출력 (PostgreSQL에서는 실제로 출력되지 않지만 주석으로 남김)
/*
🎉 Supabase Todo App 스키마가 성공적으로 생성되었습니다!

📋 생성된 테이블:
- users: 사용자 정보
- todos: 할 일 목록  
- categories: 카테고리

🔒 보안 설정:
- Row Level Security (RLS) 활성화
- 사용자별 데이터 접근 제한

📊 추가 기능:
- 자동 업데이트 트리거
- 통계 뷰
- 유용한 함수들

🚀 다음 단계:
1. Supabase 대시보드에서 인증 설정
2. 프론트엔드에서 Supabase 클라이언트 설정
3. API 엔드포인트를 Supabase로 변경
*/
