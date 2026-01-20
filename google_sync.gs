/**
 * Google Sheets to Supabase Sync
 * Updated: 2024-01-20 (Fixed Online Price Mapping)
 */

var SUPABASE_URL = 'https://qfvmqotkhjkewdwzibyb.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdm1xb3RraGprZXdkd3ppYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDU5NjAsImV4cCI6MjA4MTA4MTk2MH0.7NrJDA3l4PnGNLcv4O55gPrmg-HWL59JPKjOwiwrR3c'; 

var SHEET_CONFIG = {
  '완제품': 'finished_goods',
  '원료': 'raw_materials',
  'finished_goods': 'finished_goods',
  'raw_materials': 'raw_materials'
};

var HEADER_MAP = {
  // 공통
  '제품명': 'product_name', '품명': 'product_name', '이름': 'product_name',
  '규격': 'spec',
  '원산지': 'origin_country', '국가': 'origin_country',
  '메모': 'memo', '비고': 'memo',
  '썸네일': 'thumbnail_url', '이미지': 'thumbnail_url',
  '상세이미지': 'detail_image_url', '연출사진': 'detail_image_url',
  '태그': 'tags', '키워드': 'tags',
  '원재료': 'ingredients', '전성분': 'ingredients', 'Ingredients': 'ingredients', '함량': 'ingredients',

  // 가격
  '공급가': 'wholesale_a', '도매가A': 'wholesale_a', '도매가 A': 'wholesale_a',
  '도매가B': 'wholesale_b', '도매가 B': 'wholesale_b',
  '도매가C': 'wholesale_c', '도매가 C': 'wholesale_c',
  '소비자가': 'retail_price', '할인가': 'retail_price',
  '온라인가': 'online_price', '온라인판매가': 'online_price', '판매가': 'online_price', '온라인 판매가': 'online_price',
  '원가': 'cost_blind', 'Cost': 'cost_blind',

  // 날짜
  '입고일': 'inbound_date',
  '유효기간': 'expiry_date', '유통기한': 'expiry_date', '소비기한': 'expiry_date',

  // 재고 및 정렬
  '재고상태': 'stock_status', '상태': 'stock_status',
  '순서': 'sort_order', '정렬': 'sort_order',

  // 물류 스펙
  '바코드': 'logistics_barcode', 'Barcode': 'logistics_barcode',
  '단위중량': 'product_weight_g', '제품중량': 'product_weight_g',
  '카톤중량': 'carton_weight_kg', '박스중량': 'carton_weight_kg',
  
  '박스가로': 'carton_width_mm', '카톤가로': 'carton_width_mm',
  '박스세로': 'carton_depth_mm', '카톤세로': 'carton_depth_mm',
  '박스높이': 'carton_height_mm', '카톤높이': 'carton_height_mm',

  '입수': 'units_per_carton', '카톤입수': 'units_per_carton', '박스입수': 'units_per_carton',
  '팔레트적재': 'cartons_per_pallet'
};

var LOGISTICS_KEYS = [
  'logistics_barcode', 'product_weight_g', 'carton_weight_kg',
  'carton_width_mm', 'carton_depth_mm', 'carton_height_mm',
  'units_per_carton', 'cartons_per_pallet'
];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚡ Supabase 동기화')
      .addItem('▶ 선택한 행 업로드', 'syncSelectedRow')
      .addItem('▶▶ 전체 시트 업로드', 'syncAllRows')
      .addToUi();
}

function syncSelectedRow() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rowIndex = sheet.getActiveCell().getRow();
  if (rowIndex <= 1) { 
    SpreadsheetApp.getUi().alert('헤더 행은 업로드할 수 없습니다.'); 
    return; 
  }
  
  var result = processRow(sheet, rowIndex);
  if (result.success) {
    SpreadsheetApp.getUi().alert('✅ 업로드 성공');
  } else {
    SpreadsheetApp.getUi().alert('❌ 실패: ' + result.error);
  }
}

function syncAllRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var ui = SpreadsheetApp.getUi();

  if (lastRow <= 1) { 
    ui.alert('데이터가 없습니다.'); 
    return; 
  }
  
  if (ui.alert('총 ' + (lastRow - 1) + '건을 업로드하시겠습니까?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  var success = 0;
  var fail = 0;
  var lastError = "";

  for (var i = 2; i <= lastRow; i++) {
    var res = processRow(sheet, i);
    if (res.success) {
      success++;
    } else {
      fail++;
      lastError = res.error;
      console.error('Row ' + i + ' fail: ' + res.error);
    }
  }

  ui.alert('완료!\n성공: ' + success + '건\n실패: ' + fail + '건\n(마지막 에러: ' + lastError + ')');
}

function processRow(sheet, rowIndex) {
  var sheetName = sheet.getName();
  var tableName = SHEET_CONFIG[sheetName];

  if (!tableName) {
    return { success: false, error: '매핑된 테이블이 없습니다. (시트명: ' + sheetName + ')' };
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

  var mainPayload = {};
  var logisticsPayload = {};
  var hasLogistics = false;

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var rawValue = rowData[i];
    
    if (rawValue === "" || rawValue === undefined) continue;

    var trimmedHeader = header.toString().trim();
    var dbKey = HEADER_MAP[trimmedHeader];
    
    if (!dbKey && /^[a-z_][a-z0-9_]*$/.test(trimmedHeader)) {
      dbKey = trimmedHeader;
    }

    if (!dbKey) continue; 

    var value = rawValue;
    if (typeof value === 'string') {
        value = value.trim();
        // Remove commas for number fields
        if (['price', 'cost', 'wholesale', 'weight', 'width', 'depth', 'height', 'units', 'qty'].some(function(k) { return dbKey.indexOf(k) !== -1; })) {
            value = value.replace(/,/g, '');
            if (!isNaN(Number(value)) && value !== '') value = Number(value);
        }
    }

    if (tableName === 'finished_goods' && LOGISTICS_KEYS.indexOf(dbKey) !== -1) {
        logisticsPayload[dbKey] = value;
        hasLogistics = true;
    } else {
        mainPayload[dbKey] = value;
    }
  }

  if (!mainPayload['product_name']) {
    return { success: false, error: '제품명(product_name)이 없습니다.' };
  }

  if (mainPayload['tags'] && typeof mainPayload['tags'] === 'string') {
      mainPayload['tags'] = mainPayload['tags'].split(',').map(function(t) { return t.trim(); });
  }

  var options = {
    'method': 'post',
    'headers': {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    'muteHttpExceptions': true
  };

  var existingId = null;
  // Check existence
  var searchUrl = SUPABASE_URL + '/rest/v1/' + tableName + '?product_name=eq.' + encodeURIComponent(mainPayload.product_name) + '&select=id';
  var searchRes = UrlFetchApp.fetch(searchUrl, { headers: options.headers });
  
  if (searchRes.getResponseCode() === 200) {
      var found = JSON.parse(searchRes.getContentText());
      if (found.length > 0) existingId = found[0].id;
  }

  var finalRes;
  if (existingId) {
      options.method = 'patch';
      options.payload = JSON.stringify(mainPayload);
      finalRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/' + tableName + '?id=eq.' + existingId, options);
  } else {
      options.method = 'post';
      options.payload = JSON.stringify(mainPayload);
      finalRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/' + tableName, options);
  }

  if (finalRes.getResponseCode() >= 300) {
      return { success: false, error: finalRes.getContentText() };
  }

  var resultData = JSON.parse(finalRes.getContentText());
  var productId = resultData[0] ? resultData[0].id : null;

  if (hasLogistics && productId) {
      logisticsPayload['product_id'] = productId;
      
      var logSearchRes = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/product_logistics_specs?product_id=eq.' + productId + '&select=id', { headers: options.headers });
      var logMethod = 'post';
      var logUrl = SUPABASE_URL + '/rest/v1/product_logistics_specs';
      
      if (logSearchRes.getResponseCode() === 200 && JSON.parse(logSearchRes.getContentText()).length > 0) {
          logMethod = 'patch';
          logUrl += '?product_id=eq.' + productId;
      }

      UrlFetchApp.fetch(logUrl, {
          method: logMethod,
          headers: options.headers,
          payload: JSON.stringify(logisticsPayload),
          muteHttpExceptions: true
      });
  }

  return { success: true };
}
