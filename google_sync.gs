/**
 * Google Sheets to Supabase Sync Script (v4: 자동 초기화 강화)
 * 
 * 기능:
 * 1. "DB 전체 불러오기" 실행 시, '완제품', '원료' 시트가 없으면 자동으로 만듭니다.
 * 2. 빈 '시트1'이 있으면 재활용해서 깔끔하게 정리합니다.
 */

const SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c';

// 가져올 테이블 목록
const CONFIG = [
  { sheetName: '완제품', tableName: 'finished_goods' },
  { sheetName: '원료', tableName: 'raw_materials' }
];

// 헤더 매핑
const COLUMN_MAP = {
  '제품명': 'product_name', '규격': 'spec', '원산지': 'origin_country',
  '도매가A': 'wholesale_a', '도매가B': 'wholesale_b', '소비자가': 'retail_price',
  '원가': 'cost_blind', '유효기간': 'expiry_date', '입고일': 'inbound_date',
  '메모': 'memo', '썸네일': 'thumbnail_url', '연출사진': 'detail_image_url'
};

const DEFAULT_HEADERS = ['제품명', '규격', '원산지', '도매가A', '도매가B', '소비자가', '원가', '유효기간', '입고일', '메모', '썸네일', '연출사진'];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚡ Supabase 동기화')
      .addItem('▶ 선택한 행 전송 (Sync Row)', 'syncSelectedRow')
      .addSeparator()
      .addItem('◀ DB 전체 불러오기 (초기수집)', 'fetchAllTables')
      .addToUi();
}

function fetchAllTables() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 확인 창
  if (ui.alert('DB의 모든 내용을 불러와서 시트를 재구성합니다.\n(기존 내용 덮어씀)', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  let report = [];
  
  // 0. '시트1' 처리 (빈 시트면 첫번째 타겟으로 이름 변경)
  const sheet1 = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
  if (sheet1 && sheet1.getLastRow() <= 1 && CONFIG.length > 0) {
    sheet1.setName(CONFIG[0].sheetName);
  }

  CONFIG.forEach((item, index) => {
    try {
      // 1. 시트 확보 (없으면 생성)
      let sheet = ss.getSheetByName(item.sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(item.sheetName, index); // 순서대로 생성
      }
      
      // 2. DB Fetch
      const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/' + item.tableName + '?select=*&order=created_at.desc', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
        muteHttpExceptions: true
      });
      
      if (res.getResponseCode() !== 200) throw new Error(res.getContentText());
      
      const data = JSON.parse(res.getContentText());
      
      // 3. 헤더 준비
      const lastCol = Math.max(sheet.getLastColumn(), 1);
      let headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      if (!headers[0] || headers[0] === "") { 
        headers = DEFAULT_HEADERS; 
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]); 
      }
      
      // 4. 데이터 초기화
      if (sheet.getLastRow() > 1) {
         // 기존 데이터 클리어
         sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
      }

      if (data.length === 0) {
        report.push(`[${item.sheetName}] 데이터 0건`);
        return;
      }

      // 5. 데이터 매핑
      const newRows = data.map(record => {
        return headers.map(header => {
          const key = header.toString().trim();
          const dbKey = COLUMN_MAP[key] || key;
          return record[dbKey] ?? "";
        });
      });

      // 6. 쓰기
      sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
      report.push(`[${item.sheetName}] ✅ ${newRows.length}건 불러오기 성공`);
      
    } catch(e) { 
      report.push(`[${item.sheetName}] ❌ 실패: ${e.message}`); 
    }
  });
  
  ui.alert(report.join('\\n'));
}

function syncSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row <= 1) return;
  
  const config = CONFIG.find(c => sheet.getName() === c.sheetName);
  if (!config) { 
    SpreadsheetApp.getUi().alert('현재 시트가 "완제품" 또는 "원료"가 아닙니다.'); 
    return; 
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  let payload = {};
  headers.forEach((h, i) => {
    const dbKey = COLUMN_MAP[h.toString().trim()] || h;
    let val = rowData[i];
    if (typeof val === 'string') val = val.replace(/,/g, ''); // 콤마 제거
    if (!isNaN(parseFloat(val)) && ['wholesale_a', 'retail_price'].includes(dbKey)) val = parseFloat(val);
    
    payload[dbKey] = (val === '' || val === undefined) ? null : val;
  });

  if (!payload['product_name']) { SpreadsheetApp.getUi().alert('제품명이 비어있습니다.'); return; }

  const target = payload.id ? 'id' : 'product_name';
  const res = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${config.tableName}?on_conflict=${target}`, {
    method: 'post', contentType: 'application/json',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=representation, resolution=merge-duplicates' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  
  SpreadsheetApp.getUi().alert(res.getResponseCode() < 300 ? '✅ 저장 완료' : 'Error: ' + res.getContentText());
}
