/**
 * Google Sheets to Supabase Sync Script
 * 
 * 설정 방법:
 * 1. Supabase URL과 API Key를 아래 변수에 입력하세요.
 * 2. 시트 이름이 DB 테이블 이름과 '비슷한지' 확인하거나 매핑을 수정하세요.
 *    예: 시트 이름 "완제품" -> tableName "finished_goods"
 */

// --- 설정 (CONFIGURATION) ---
const SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE'; // ★ 주의: Service Role Key 사용 권장 (Row Level Security 우회)

// 시트 이름 -> Supabase 테이블 이름 매핑
const SHEET_TO_TABLE_MAP = {
  '완제품': 'finished_goods',
  '원료': 'raw_materials',
  'finished_goods': 'finished_goods', // 영문 이름도 지원
  'raw_materials': 'raw_materials'
};

// 헤더 매핑 (한글 시트 헤더 -> DB 컬럼명)
const COLUMN_MAP = {
  '제품명': 'product_name',
  '규격': 'spec',
  '원산지': 'origin_country',
  '도매가A': 'wholesale_a',
  '도매가B': 'wholesale_b',
  '소비자가': 'retail_price',
  '원가': 'cost_blind',
  '유효기간': 'expiry_date',
  '입고일': 'inbound_date',
  '메모': 'memo',
  '썸네일': 'thumbnail_url',
  '이미지': 'detail_image_url' // '연출사진' 등도 매핑 가능
};

// ----------------------------------------

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Supabase 동기화')
      .addItem('선택한 행 강제 동기화', 'syncSelectedRow')
      .addItem('현재 시트 전체 동기화', 'syncAllRows')
      .addToUi();
}

/**
 * 선택된 행(Row)만 동기화
 */
function syncSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  
  if (row <= 1) { // 헤더 행 제외
    SpreadsheetApp.getUi().alert('헤더 행은 동기화할 수 없습니다.');
    return;
  }
  
  syncRow(sheet, row);
  SpreadsheetApp.getUi().alert('동기화 완료!');
}

/**
 * 시트 전체 동기화
 */
function syncAllRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // 2번째 행부터 끝까지
  for (let i = 2; i <= lastRow; i++) {
    syncRow(sheet, i);
  }
  
  SpreadsheetApp.getUi().alert(`전체 동기화 완료 (${lastRow - 1}건)`);
}

/**
 * 행 데이터 읽어서 Supabase로 전송
 */
function syncRow(sheet, rowIndex) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  const sheetName = sheet.getName();
  
  // 테이블 이름 찾기
  const tableName = SHEET_TO_TABLE_MAP[sheetName] || SHEET_TO_TABLE_MAP[Object.keys(SHEET_TO_TABLE_MAP).find(k => sheetName.includes(k))];
  
  if (!tableName) {
    console.error(`테이블 매핑 실패: 시트 이름 '${sheetName}'에 해당하는 DB 테이블을 못 찾았습니다.`);
    return;
  }
  
  // 데이터 객체 생성
  let payload = {};
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    const value = rowData[i];
    
    // 매핑된 컬럼명 찾기 (없으면 그대로 영문 헤더 사용 시도)
    const dbColumn = COLUMN_MAP[header] || header;
    
    // 빈 값 처리
    if (value === '' || value === undefined) {
      payload[dbColumn] = null;
    } else {
      payload[dbColumn] = value;
    }

    // 숫자 필드 전처리 (콤마 제거 등)
    if (typeof payload[dbColumn] === 'string' && ['wholesale_a', 'wholesale_b', 'retail_price', 'cost_blind'].includes(dbColumn)) {
        payload[dbColumn] = parseInt(payload[dbColumn].replace(/,/g, ''), 10);
    }
  }
  
  // ID가 없으면 에러 또는 생성? 
  // 보통 시트에 'id' 컬럼이 있거나, 없으면 Product Name을 기준으로 매칭해야 함.
  // 여기서는 'product_name'을 기준으로 Upsert 하거나, 기존 ID가 있다면 그것을 씀.
  
  // Upsert 실행
  upsertToSupabase(tableName, payload);
}

function upsertToSupabase(tableName, payload) {
  const options = {
    'method' : 'post',
    'contentType': 'application/json',
    'headers': {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=minimal' // 응답 최소화
    },
    // id가 있으면 id 기준, 없으면 product_name 기준 등 충돌 처리 전략 필요.
    // 여기서는 간단히 payload 전송. Supabase 테이블에 PK(Primary Key) 설정이 중요함.
    'payload' : JSON.stringify(payload)
  };
  
  try {
    // on_conflict 파라미터는 URL에 지정하는 방식이 일반적
    // 예: ?on_conflict=product_name
    let endpoint = `${SUPABASE_URL}/rest/v1/${tableName}`;
    
    // 만약 ID 컬럼이 페이로드에 있다면 ID 기준 업데이트가 됨 (Supabase 기본 동작)
    
    UrlFetchApp.fetch(endpoint, options);
    console.log(`Synced: ${payload['product_name'] || 'Unknown Product'}`);
  } catch (e) {
    console.error(`Sync Error: ${e.toString()}`);
    // SpreadsheetApp.getUi().alert(`Supabase 에러: ${e.message}`);
  }
}
