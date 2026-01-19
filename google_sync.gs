/**
 * Google Sheets to Supabase Sync Script (v10: 커스텀 헤더 매핑 - 2줄 헤더)
 * 
 * [중요 변경사항]
 * 시트의 상단 2줄을 헤더로 사용합니다.
 * - 1행: 항목명 (한글/보기용) - 수정해도 연동에 영향 없음
 * - 2행: DB 컬럼명 (영어/실제값) - **이 값을 기준으로 Supabase와 통신합니다.**
 * 
 * 이제 스크립트 코드를 수정할 필요 없이, 시트의 2행을 직접 수정하여 DB 컬럼을 맞출 수 있습니다.
 */

const SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co';
const SUPABASE_KEY = 'sb_secret_RGOFo9awZvSy61H4fJuMVg_gb1XWKdq'; 

const CONFIG = [
  { sheetName: '완제품', tableName: 'finished_goods' },
  { sheetName: '원료', tableName: 'raw_materials' }
];

// 기본 매핑 정보 (초기화 시 1행/2행 채우기 용도)
// 사용자가 시트에서 2행을 수정하면 이 매핑보다 시트값이 우선됩니다.
const DEFAULT_MAP = [
  { label: '제품명', key: 'product_name' },
  { label: '규격', key: 'spec' },
  { label: '원산지', key: 'origin_country' },
  { label: '공급가', key: 'cost_blind' },
  { label: '도매가A', key: 'wholesale_a' },
  { label: '도매가B', key: 'wholesale_b' },
  { label: '소비자가', key: 'retail_price' },
  { label: '소비기한', key: 'expiry_date' },
  { label: '바코드', key: 'logistics_barcode' },
  { label: '제품중량', key: 'product_weight_g' },
  { label: '제품가로', key: 'product_width_mm' },
  { label: '제품세로', key: 'product_depth_mm' },
  { label: '제품높이', key: 'product_height_mm' },
  { label: '카톤중량', key: 'carton_weight_kg' },
  { label: '카톤입수', key: 'units_per_carton' },
  { label: '카톤가로', key: 'carton_width_mm' },
  { label: '카톤세로', key: 'carton_depth_mm' },
  { label: '카톤높이', key: 'carton_height_mm' },
  { label: '메모', key: 'memo' },
  { label: '썸네일', key: 'thumbnail_url' },
  { label: '연출사진', key: 'detail_image_url' }
];

// 물류 테이블에 속하는 컬럼 목록 (분리 업로드용)
const LOGISTICS_KEYS = [
  'logistics_barcode', 'hs_code', 
  'carton_weight_kg', 'units_per_carton', 'carton_width_mm', 'carton_depth_mm', 'carton_height_mm',
  'product_weight_g', 'product_width_mm', 'product_depth_mm', 'product_height_mm', 'cartons_per_pallet'
];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚡ Supabase 동기화')
      .addItem('▶ 선택한 행 업로드 (Sync Row)', 'syncSelectedRow')
      .addItem('▶▶ 전체 시트 업로드 (Sync All)', 'syncAllRows')
      .addSeparator()
      .addItem('◀ DB 전체 불러오기 (초기수집)', 'fetchAllTables')
      .addToUi();
}

/**
 * DB 데이터 불러오기
 */
function fetchAllTables() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (ui.alert('DB 데이터를 불러옵니다.\n시트가 [1행:한글, 2행:영어(DB컬럼)] 형태로 재설정됩니다.\n진행하시겠습니까?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  let report = [];
  
  // 시트 이름 정리
  const sheet1 = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1') || ss.getSheetByName('finished_goods') || ss.getSheetByName('raw_materials');
  if (sheet1 && sheet1.getLastRow() <= 1 && CONFIG.length > 0) {
    sheet1.setName(CONFIG[0].sheetName);
  }

  CONFIG.forEach((item, index) => {
    try {
      let sheet = ss.getSheetByName(item.sheetName);
      if (!sheet) sheet = ss.insertSheet(item.sheetName, index);

      // 1. Fetch Data (Join)
      let url = `${SUPABASE_URL}/rest/v1/${item.tableName}?select=*&order=created_at.desc`;
      if (item.tableName === 'finished_goods') {
         url = `${SUPABASE_URL}/rest/v1/${item.tableName}?select=*,product_logistics_specs(*)&order=created_at.desc`;
      }
      
      const res = UrlFetchApp.fetch(url, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
        muteHttpExceptions: true
      });
      
      let rawData = [];
      if (res.getResponseCode() === 200) {
          rawData = JSON.parse(res.getContentText());
      } else {
          // Fallback
          const simpleUrl = `${SUPABASE_URL}/rest/v1/${item.tableName}?select=*&order=created_at.desc`;
          const retryRes = UrlFetchApp.fetch(simpleUrl, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }, muteHttpExceptions: true });
          if (retryRes.getResponseCode() === 200) rawData = JSON.parse(retryRes.getContentText());
      }

      // 2. 헤더 구성 (DEFAULT_MAP 기준)
      // 만약 원료 시트라면 DEFAULT_MAP 대신 기본 키값 사용 가능하나, 일단 일관성을 위해 DEFAULT 사용
      // 필요시 raw_materials용 맵을 따로 정의해도 됨. 지금은 공용.
      const labels = DEFAULT_MAP.map(m => m.label);
      const keys = DEFAULT_MAP.map(m => m.key);

      sheet.clear();
      // 1행: 라벨, 2행: 키
      sheet.getRange(1, 1, 1, labels.length).setValues([labels]).setFontWeight('bold').setBackground('#f3f3f3');
      sheet.getRange(2, 1, 1, keys.length).setValues([keys]).setFontColor('#666666').setFontStyle('italic');
      
      // 3. 데이터 매핑
      if (!rawData || rawData.length === 0) {
        report.push(`[${item.sheetName}] 데이터 0건`);
        return;
      }

      const newRows = rawData.map(record => {
        // Flatten Logistics
        if (record.product_logistics_specs) {
            const specs = Array.isArray(record.product_logistics_specs) ? record.product_logistics_specs[0] : record.product_logistics_specs;
            if (specs) Object.assign(record, specs);
        }

        return keys.map(key => {
          return record[key] ?? "";
        });
      });

      if (newRows.length > 0) {
          sheet.getRange(3, 1, newRows.length, keys.length).setValues(newRows);
      }
      report.push(`[${item.sheetName}] ✅ ${newRows.length}건 완료`);
      
    } catch(e) { 
      report.push(`[${item.sheetName}] ❌ 오류: ${e.message}`); 
    }
  });
  
  ui.alert(report.join('\\n'));
}

/* ========================================================================= */
/*  Upload Logic (v10: 2행의 키값을 그대로 사용)                               */
/* ========================================================================= */

function syncSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  if (row <= 2) { SpreadsheetApp.getUi().alert("헤더(1~2행)는 선택할 수 없습니다."); return; }
  processRow(sheet, row, true);
}

function syncAllRows() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lastRow = sheet.getLastRow();
  const ui = SpreadsheetApp.getUi();

  if (lastRow <= 2) { ui.alert("업로드할 데이터가 없습니다."); return; }
  if (ui.alert(`총 ${lastRow - 2}건을 업로드하시겠습니까?`, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  let successCount = 0, failCount = 0;
  let lastError = "";
  
  // 2행에서 DB Header(Key)를 읽어옵니다.
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const config = CONFIG.find(c => sheet.getName() === c.sheetName);
  
  if (!config) { ui.alert('시트 이름 확인 ("완제품", "원료")'); return; }

  const allData = sheet.getRange(3, 1, lastRow - 2, sheet.getLastColumn()).getValues();

  for (let i = 0; i < allData.length; i++) {
    try {
      const result = uploadRowData(config, headers, allData[i]);
      if (result.success) successCount++;
      else {
        failCount++;
        lastError = result.error;
        console.error(`Row ${i + 3} fail: ${result.error}`);
      }
    } catch (e) {
      failCount++;
      lastError = e.message;
      console.error(`Row ${i + 3} error: ${e.message}`);
    }
    if (i % 10 === 0) ss.toast(`${i + 1} / ${allData.length} ...`);
  }
  if (failCount > 0) {
    ui.alert(`⚠️ 완료 (일부 실패)\n성공: ${successCount}건\n실패: ${failCount}건\n\n[마지막 오류 내용]\n${lastError}`);
  } else {
    ui.alert(`✅ 완료!\n성공: ${successCount}건\n실패: ${failCount}건`);
  }
}

function processRow(sheet, row, showAlert) {
  const config = CONFIG.find(c => sheet.getName() === c.sheetName);
  const ui = SpreadsheetApp.getUi();
  if (!config) { if (showAlert) ui.alert('시트 이름 확인'); return; }

  // 2행을 Key로 사용
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const result = uploadRowData(config, headers, rowData);

  if (showAlert) {
    if (result.success) ui.alert('✅ 저장 완료');
    else ui.alert('❌ 실패: ' + result.error);
  }
}

function uploadRowData(config, headers, rowValues) {
  let mainPayload = {};
  let logisticsPayload = {};
  let hasLogistics = false;

  headers.forEach((key, i) => {
    const dbKey = key.toString().trim(); // 2행에 적힌 값이 곧 DB Key입니다.
    if (!dbKey) return; 

    let val = rowValues[i];
    if (typeof val === 'string') val = val.replace(/,/g, '').trim();
    if (val === '') val = null;

    if (val !== null && !isNaN(Number(val)) && val !== '') {
        // 숫자 예외 필드
        if (!['logistics_barcode', 'hs_code', 'expiry_date', 'product_name', 'spec', 'origin_country', 'memo', 'thumbnail_url', 'detail_image_url'].includes(dbKey)) {
            val = Number(val);
        }
    }

    // 분류: Logistics vs Finished Goods
    if (config.tableName === 'finished_goods' && LOGISTICS_KEYS.includes(dbKey)) {
        logisticsPayload[dbKey] = val;
        if (val !== null) hasLogistics = true;
    } else {
        // 나머지는 메인 테이블
        mainPayload[dbKey] = val;
    }
  });

  if (!mainPayload['product_name']) return { success: false, error: 'product_name (2행 키값 확인) 누락' };

  let existingId = mainPayload.id || null;
  const commonHeaders = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=representation', 'Content-Type': 'application/json' };

  // ID Check
  if (!existingId) {
      const searchRes = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${config.tableName}?product_name=eq.${encodeURIComponent(mainPayload.product_name)}&select=id`, { headers: commonHeaders, muteHttpExceptions: true });
      if (searchRes.getResponseCode() === 200) {
          const found = JSON.parse(searchRes.getContentText());
          if (found && found.length > 0) existingId = found[0].id;
      }
  }

  let res;
  if (existingId) {
      res = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${config.tableName}?id=eq.${existingId}`, { method: 'patch', headers: commonHeaders, payload: JSON.stringify(mainPayload), muteHttpExceptions: true });
  } else {
      res = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${config.tableName}`, { method: 'post', headers: commonHeaders, payload: JSON.stringify(mainPayload), muteHttpExceptions: true });
  }
  
  if (res.getResponseCode() >= 300) return { success: false, error: res.getContentText() };

  const productId = JSON.parse(res.getContentText())[0]?.id;

  if (config.tableName === 'finished_goods' && hasLogistics && productId) {
    logisticsPayload['product_id'] = productId;
    
    // Check Logistics
    let logParams = { method: 'post', url: `${SUPABASE_URL}/rest/v1/product_logistics_specs` };
    const logSearch = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/product_logistics_specs?product_id=eq.${productId}&select=id`, { headers: commonHeaders, muteHttpExceptions: true });
    
    if (logSearch.getResponseCode() === 200 && JSON.parse(logSearch.getContentText()).length > 0) {
        logParams.method = 'patch';
        logParams.url = `${SUPABASE_URL}/rest/v1/product_logistics_specs?product_id=eq.${productId}`;
    }

    UrlFetchApp.fetch(logParams.url, { method: logParams.method, headers: commonHeaders, payload: JSON.stringify(logisticsPayload), muteHttpExceptions: true });
  }

  return { success: true };
}
