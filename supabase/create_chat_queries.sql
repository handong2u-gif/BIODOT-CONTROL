-- 챗봇 검색 질문 로그 테이블
-- 사용자가 실제로 입력한 질문을 기록하여 추천 질문 생성에 활용
CREATE TABLE IF NOT EXISTS chat_queries (
  id         bigserial PRIMARY KEY,
  query_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 인덱스: 빠른 집계를 위해 query_text에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_chat_queries_text ON chat_queries(query_text);

-- RLS 비활성화 (내부 어드민 툴이므로 퍼블릭 접근 허용)
ALTER TABLE chat_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_chat_queries" ON chat_queries
  FOR ALL USING (true) WITH CHECK (true);
